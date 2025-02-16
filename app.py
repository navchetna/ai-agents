import os
import nltk
import redis

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, File, UploadFile,Request,Response
from pydantic import BaseModel
import requests
from collections import defaultdict
import time
import logging
import networkx as nx
from fastapi_redis_cache import FastApiRedisCache, cache
import io
import json
from fastapi.responses import FileResponse
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import fitz
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Get DOAJ API key from environment variables
DOAJ_API_KEY = os.getenv('DOAJ_API_KEY')

# Configure Redis
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')  # Default to localhost for local development
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
#redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)

# Configure Redis
#REDIS_HOST = 'localhost'
#REDIS_PORT = 6379
#redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)



# Cache expiration times (in seconds)
CACHE_EXPIRY_SUGGESTIONS = 600   # 10 minutes
CACHE_EXPIRY_SEARCH = 3600       # 1 hour
CACHE_EXPIRY_REFERENCES = 86400  # 24 hours


# Download additional data files if needed
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')
nltk.download('omw-1.4')

backend = FastAPI(title="backend")
backend.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app = FastAPI(title="app")
app.mount("/api", backend)

# Create an instance of FastApiRedisCache
redis_cache = FastApiRedisCache()

@app.on_event("startup")
async def startup():
    redis_cache.init(
        host_url=f"redis://{REDIS_HOST}:{REDIS_PORT}/0",
        response_header="X-FastAPI-Cache",
        prefix="fastapi-cache",
        ignore_arg_types=[Request, Response]
    )

#@app.post("/store")
#def store_data(key: str, value: str):
    #redis_client.set(key, value)
    #return {"message": f"Stored {key}: {value}"}

#@app.get("/retrieve")
#def retrieve_data(key: str):
    #value = redis_client.get(key)
    #return {"message": f"Value for {key}: {value}"}

from fastapi import Request

#@backend.post("/store_cache")
#async def store_cache(request: Request):
    #try:
        #data = await request.json()  # Receive data from frontend
        #key = data.get("key")  # Unique cache key (should be provided)
        #value = json.dumps(data.get("value"))  # Store value as JSON

        #if not key or not value:
            #raise HTTPException(status_code=400, detail="Missing key or value")

        #redis_client.set(key, value, ex=3600)  # Cache for 1 hour

        #return {"message": f"Stored {key}: {value}"}
    #except Exception as e:
        #logging.error(f"Error storing cache: {e}")
        ## Improved code with added error handling, logging, and caching
@backend.post("/search_papers")
async def search_papers(search_query: SearchQuery):
    query = search_query.query
    year = search_query.year
    api = search_query.api.lower()

    if not query:
        raise HTTPException(status_code=400, detail="No query provided")

    cache_key = f"{query}_{year}_{api}"
    cached_result = redis_client.get(cache_key)

    if cached_result:
        logging.info(f"Cache hit for {cache_key}")
        return json.loads(cached_result)

    try:
        if api == "semantic_scholar":
            semantic_query = construct_query(query)
            url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={semantic_query}&fields=title,url,abstract,year&limit=10'
            response = requests.get(url, timeout=10)  # Added timeout
            response.raise_for_status()  # Raise an exception for bad status codes
            search_results = response.json().get('data', [])
            if year:
                search_results = [result for result in search_results if result.get('year') == year]
            papers = [{"title": result['title'], "url": result['url'], "snippet": result.get('abstract', '')} for result in search_results]
        elif api == "arxiv_papers":
            url = f'http://export.arxiv.org/api/query?search_query={query}&start=0&max_results=10'
            response = requests.get(url, timeout=10)  # Added timeout
            response.raise_for_status()  # Raise an exception for bad status codes
            entries = response.text.split("<entry>")
            papers = []
            for entry in entries[1:]:
                title = entry.split("<title>")[1].split("</title>")[0]
                url = entry.split("<id>")[1].split("</id>")[0]
                snippet = entry.split("<summary>")[1].split("</summary>")[0]
                year_published = entry.split("<published>")[1].split("</published>")[0][:4]
                if year and int(year_published) != year:
                    continue
                papers.append({"title": title, "url": url, "snippet": snippet})
        elif api == "doaj":
            papers = fetch_doaj_papers(query, year)
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")

        redis_client.set(cache_key, json.dumps(papers), ex=3600)  # Cache the result for 1 hour
        logging.info(f"Cache set for {cache_key}")

        return {"papers": papers}
    except requests.exceptions.RequestException as e:
        logging.error(f"Error processing search_papers request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    except Exception as e:
        logging.error(f"Error processing search_papers request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")raise HTTPException(status_code=500, detail="Failed to store cache")
    

# Endpoint to fetch history from Redis
#@app.get("/history")
#async def get_history():
    #history = redis_client.lrange("history_key", 0, -1)
    #return {"history": history}

# Function to store request and response in Redis
#def store_data_in_redis(request_data, response_data):
    #timestamp = datetime.datetime.utcnow().isoformat()
    #log_entry = f"Request: {request_data} | Response: {response_data} | Timestamp: {timestamp}"
    #redis_client.rpush("history_key", log_entry)
    
# Example to store request and response in Redis on startup
#@app.on_event("startup")
#async def startup():
   # example_request = {"action": "example_request"}
   # example_response = {"message": "Example response"}
    #store_data_in_redis(example_request, example_response)
    

# Configure logging
#logging.basicConfig(level=logging.INFO)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# Simple in-memory cache for suggestions
suggestions_cache = defaultdict(dict)
CACHE_EXPIRY_TIME = 600  # Cache expiry time in seconds

class SearchQuery(BaseModel):
    query: str
    year: int = None  # Optional year attribute
    api: str = "semantic_scholar"  # Default to Semantic Scholar

class PaperID(BaseModel):
    paper_id: str
    api: str = "semantic_scholar"  # Default to Semantic Scholar

# def make_request_with_retry(url, params=None, headers=None, max_retries=3, delay=5):
#     for i in range(max_retries):
#         try:
#             response = requests.get(url, params=params, headers=headers)
#             if response.status_code == 200:
#                 return response
#             elif response.status_code == 429:
#                 logging.warning(f"Rate limit exceeded. Attempt {i+1}: Retrying after {delay} seconds.")
#                 time.sleep(delay)
#                 delay *= 2  # Exponential backoff
#             else:
#                 logging.error(f"Attempt {i+1}: Failed request - Status Code: {response.status_code}, Raw Response: {response.text}")
#         except requests.RequestException as e:
#             logging.error(f"Attempt {i+1}: Request exception - {e}")
#     return None

def construct_query(query: str) -> str:
    terms = query.split()
    search_terms = []
    operator = None
    for term in terms:
        if term.upper() in ["AND", "OR"]:
            operator = term.upper()
        else:
            if operator:
                if operator == "AND":
                    search_terms.append(f"{search_terms.pop()} AND {term}")
                elif operator == "OR":
                    search_terms.append(f"{search_terms.pop()} OR {term}")
                operator = None
            else:
                search_terms.append(term)
    return " AND ".join(search_terms)

def get_semantic_scholar_suggestions(query):
    semantic_query = construct_query(query)
    url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={semantic_query}&fields=title,url,abstract'
    response = requests.get(url)
    print(response)
    if not response:
        return []
    results = response.json().get('data', [])
    suggestions = [result['title'] for result in results]
    return suggestions

def fetch_doaj_papers(query, year=None):
    url = f'https://doaj.org/api/v1/search/articles/{query}'
    params = {
        "api_key": DOAJ_API_KEY,
        "pageSize": 10
    }
    response = requests.get(url, params=params)
    print(response)
    if response.status_code != 200:
        logging.error(f"Failed to fetch DOAJ papers: Status Code: {response.status_code}, Raw Response: {response.text}")
        return []
    
    articles = response.json().get('results', [])
    papers = [{"title": article['bibjson']['title'], "url": article['bibjson']['link'][0]['url'], "snippet": article.get('bibjson', {}).get('abstract', ''), "year": article.get('bibjson', {}).get('year')} for article in articles]
    
    # Log fetched papers before filtering
    logging.info(f"Fetched papers: {papers}")

    # Filter by year if specified
    if year:
        papers = [paper for paper in papers if paper.get('year') and int(paper.get('year')) == int(year)]
    
    # Log papers after filtering
    logging.info(f"Filtered papers: {papers}")

    return papers

@backend.post("/search_papers")
async def search_papers(search_query: SearchQuery):
    query = search_query.query
    year = search_query.year
    api = search_query.api.lower()

    if not query:
        raise HTTPException(status_code=400, detail="No query provided")

    cache_key = f"{query}_{year}_{api}"
    cached_result = redis_client.get(cache_key)
        
    if cached_result:
        logging.info(f"Cache hit for {cache_key}")
        return json.loads(cached_result)

    try:
        if api == "semantic_scholar":
            semantic_query = construct_query(query)
            url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={semantic_query}&fields=title,url,abstract,year&limit=10'
            response = requests.get(url)
            search_results = response.json().get('data', [])
            if year:
                search_results = [result for result in search_results if result.get('year') == year]
            papers = [{"title": result['title'], "url": result['url'], "snippet": result.get('abstract', '')} for result in search_results]
        elif api == "arxiv_papers":
            url = f'http://export.arxiv.org/api/query?search_query={query}&start=0&max_results=10'
            response = requests.get(url)
            entries = response.text.split("<entry>")
            papers = []
            for entry in entries[1:]:
                title = entry.split("<title>")[1].split("</title>")[0]
                url = entry.split("<id>")[1].split("</id>")[0]
                snippet = entry.split("<summary>")[1].split("</summary>")[0]
                year_published = entry.split("<published>")[1].split("</published>")[0][:4]
                if year and int(year_published) != year:
                    continue
                papers.append({"title": title, "url": url, "snippet": snippet})
        elif api == "doaj":
            papers = fetch_doaj_papers(query, year)
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")

        redis_client.set(cache_key, json.dumps(papers), ex=3600)  # Cache the result for 1 hour
        logging.info(f"Cache set for {cache_key}")

        return {"papers": papers}
    except Exception as e:
        logging.error(f"Error processing search_papers request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@backend.get("/suggest")
async def suggest(q: str = Query(..., min_length=3, description="The user's input query to get suggestions for"), api: str = "semantic_scholar"):
    current_time = time.time()
    cache_key = f"suggestions_{q}_{api}"
    cached_suggestions = redis_client.get(cache_key)

    if cached_suggestions and (current_time - json.loads(cached_suggestions)['time']) < CACHE_EXPIRY_TIME:
        logging.info(f"Cache hit for {cache_key}")
        return {"suggestions": json.loads(cached_suggestions)['data']}

    try:
        suggestions = []
        if api == "semantic_scholar":
            suggestions = get_semantic_scholar_suggestions(q)
        elif api == "doaj":
            papers = fetch_doaj_papers(q)
            suggestions = [paper['title'] for paper in papers]
        elif api == "arxiv_papers":
            return {"suggestions": [], "message": "arXiv API does not support suggestions. Please try Semantic Scholar or DOAJ."}
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")

        cache_data = {'data': suggestions, 'time': time.time()}
        redis_client.set(cache_key, json.dumps(cache_data), ex=CACHE_EXPIRY_TIME)
        logging.info(f"Cache set for {cache_key}")
        return {"suggestions": suggestions}
    except Exception as e:
        logging.error(f"Error processing suggest request: {e}")
        raise HTTPException(status_code=500, detail="Failed to get suggestions")


def fetch_references(paper_id, api):
    if api == "semantic_scholar":
        url = f'https://api.semanticscholar.org/graph/v1/paper/{paper_id}/references?fields=title,url,abstract,year'
    elif api == "arxiv_papers":
        url = f'http://export.arxiv.org/api/query?search_query=id:{paper_id}'
    elif api == "doaj":
        # Implement fetch references for DOAJ if applicable
        pass
    response = requests.get(url)
    if response.status_code != 200:
        logging.error(f"Failed to fetch references: Status Code: {response.status_code}, Raw Response: {response.text}")
        return []
    
    if api == "semantic_scholar":
        logging.info(f"References API Response: {response.json()}")
        return response.json().get('data', [])
    elif api == "arxiv_papers":
        entries = response.text.split("<entry>")
        references = []
        for entry in entries[1:]:
            title = entry.split("<title>")[1].split("</title>")[0]
            url = entry.split("<id>")[1].split("</id>")[0]
            year = entry.split("<published>")[1].split("</published>")[0][:4]
            references.append({"title": title, "url": url, "year": int(year)})
        return references



def fetch_references_recursive(paper_id, api, depth=1):
    if depth <= 0:
        return []
    references = fetch_references(paper_id, api)
    all_references = references.copy()
    if api == "semantic_scholar":
        for ref in references:
            ref_id = ref.get('paperId')
            if ref_id:
                all_references.extend(fetch_references_recursive(ref_id, api, depth-1))
    return all_references



@backend.post("/download_references")
async def download_references(paper: PaperID, depth: int = 1):
    cache_key = f"references_{paper.paper_id}_{depth}"
    cached_references = redis_client.get(cache_key)

    if cached_references:
     logging.info(f"Cache hit for {cache_key}")
     return JSONResponse(content=json.loads(cached_references))
    
    
    
    api = "semantic_scholar"
    if api == "semantic_scholar":
        references = fetch_references_recursive(paper.paper_id, api, depth)
    elif api == "arxiv_papers":
        references = fetch_references(paper.paper_id, paper.api)
    elif api == "doaj":
        references = fetch_doaj_references(paper.paper_id)
    else:
        raise HTTPException(status_code=400, detail="Unsupported API")

    if not references:
        raise HTTPException(status_code=500, detail="Failed to fetch references")
    
    with open("references.json", "w") as file:
        json.dump(references, file)
    
    return FileResponse("references.json", media_type='application/json')

@backend.get("/")
async def read_root():
    return {"message": "Welcome to the Research Paper Assistant API. Use /docs for interactive API documentation."}

def fetch_doaj_references(paper_id):
    # Implement the logic to fetch references from DOAJ
    # This is a placeholder function and needs to be implemented
    return []

def filter_by_year(references, start_year, end_year):
    filtered_references = []
    for ref in references:
        year = ref.get('year')
        if year:
            if start_year and year < start_year:
                continue
            if end_year and year > end_year:
                continue
        filtered_references.append(ref)
    return filtered_references


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)