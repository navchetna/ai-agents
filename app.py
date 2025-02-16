import os
import time
import json
import redis
import logging
import requests
import nltk
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request , Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from collections import defaultdict
from fastapi_redis_cache import FastApiRedisCache, cache


# Load environment variables
load_dotenv()

# Configure Redis
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')  # Default to localhost for local development
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)



# Cache expiration times (in seconds)
CACHE_EXPIRY_SUGGESTIONS = 600   # 10 minutes
CACHE_EXPIRY_SEARCH = 3600       # 1 hour
CACHE_EXPIRY_REFERENCES = 86400  # 24 hours

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize FastAPI
app = FastAPI()


@app.on_event("startup")
async def startup():
    redis_cache.init(
        host_url=f"redis://{REDIS_HOST}:{REDIS_PORT}/0",
        response_header="X-FastAPI-Cache",
        prefix="fastapi-cache",
        ignore_arg_types=[Request, Response]
    )

# Load environment variables
DOAJ_API_KEY = os.getenv('DOAJ_API_KEY')

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')

class SearchQuery(BaseModel):
    query: str
    year: int = None
    api: str = "semantic_scholar"

class PaperID(BaseModel):
    paper_id: str
    api: str = "semantic_scholar"

def make_request_with_retry(url, params=None, headers=None, max_retries=3, delay=5):
    for i in range(max_retries):
        try:
            response = requests.get(url, params=params, headers=headers)
            if response.status_code == 200:
                return response
            elif response.status_code == 429:
                logging.warning(f"Rate limit exceeded. Retrying ({i+1}/{max_retries}) in {delay} seconds...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            else:
                logging.error(f"Request failed: {response.status_code}, Response: {response.text}")
        except requests.RequestException as e:
            logging.error(f"Request exception: {e}")
    return None

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

@app.post("/search_papers")
async def search_papers(search_query: SearchQuery):
    query = search_query.query
    year = search_query.year
    api = search_query.api.lower()

    if not query:
        raise HTTPException(status_code=400, detail="No query provided")

    cache_key = f"search:{query}:{year}:{api}"
    cached_result = redis_client.get(cache_key)

    if cached_result:
        return json.loads(cached_result)

    try:
        if api == "semantic_scholar":
            semantic_query = construct_query(query)
            url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={semantic_query}&fields=title,url,abstract,year&limit=100'
            response = make_request_with_retry(url)
            search_results = response.json().get('data', [])
            if year:
                search_results = [result for result in search_results if result.get('year') == year]
            papers = [{"title": result['title'], "url": result['url'], "snippet": result.get('abstract', '')} for result in search_results]
        elif api == "arxiv_papers":
            url = f'http://export.arxiv.org/api/query?search_query={query}&start=0&max_results=100'
            response = make_request_with_retry(url)
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

        redis_client.setex(cache_key, CACHE_EXPIRY_SEARCH, json.dumps({"papers": papers}))
        return {"papers": papers}
    except Exception as e:
        logging.error(f"Error in /search_papers: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
def get_semantic_scholar_suggestions(query):
    """Fetch search suggestions from Semantic Scholar."""
    semantic_query = construct_query(query)
    url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={semantic_query}&fields=title'
    response = make_request_with_retry(url)
    
    if not response:
        return []
    
    results = response.json().get('data', [])
    suggestions = [result['title'] for result in results]
    return suggestions

   



@app.get("/suggest")
async def suggest(q: str = Query(..., min_length=3), api: str = "semantic_scholar"):
    cache_key = f"suggest:{q}:{api}"
    cached_result = redis_client.get(cache_key)

    if cached_result:
        return json.loads(cached_result)

    try:
        suggestions = []
        if api == "semantic_scholar":
            suggestions = get_semantic_scholar_suggestions(q)
        elif api == "doaj":
            papers = fetch_doaj_papers(q)
            suggestions = [paper['title'] for paper in papers]
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")

        redis_client.setex(cache_key, CACHE_EXPIRY_SUGGESTIONS, json.dumps({"suggestions": suggestions}))
        return {"suggestions": suggestions}
    except Exception as e:
        logging.error(f"Error in /suggest: {e}")
        raise HTTPException(status_code=500, detail="Failed to get suggestions")

@app.post("/download_references")
async def download_references(paper: PaperID, depth: int = 1):
    cache_key = f"references:{paper.paper_id}:{paper.api}:{depth}"
    cached_result = redis_client.get(cache_key)

    if cached_result:
        return json.loads(cached_result)

    try:
        if paper.api == "semantic_scholar":
            references = fetch_references_recursive(paper.paper_id, paper.api, depth)
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")

        redis_client.setex(cache_key, CACHE_EXPIRY_REFERENCES, json.dumps({"references": references}))

        with open("references.json", "w") as file:
            json.dump(references, file)
        
        return FileResponse("references.json", media_type='application/json')
    except Exception as e:
        logging.error(f"Error in /download_references: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch references")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Research Paper Assistant API. Use /docs for interactive API documentation."}

def fetch_doaj_papers(query, year=None):
    url = f'https://doaj.org/api/v1/search/articles/{query}'
    params = {"api_key": DOAJ_API_KEY, "pageSize": 100}
    response = make_request_with_retry(url, params=params)
    
    if response.status_code != 200:
        return []
    
    articles = response.json().get('results', [])
    papers = [
        {
            "title": article['bibjson']['title'],
            "url": article['bibjson']['link'][0]['url'],
            "snippet": article.get('bibjson', {}).get('abstract', ''),
            "year": article.get('bibjson', {}).get('year')
        }
        for article in articles
    ]
    if year:
        papers = [paper for paper in papers if paper.get('year') and int(paper.get('year')) == int(year)]
    return papers


def fetch_references(paper_id, api):
    if api == "semantic_scholar":
        url = f'https://api.semanticscholar.org/graph/v1/paper/{paper_id}/references?fields=title,url,abstract,year'
    elif api == "arxiv_papers":
        url = f'http://export.arxiv.org/api/query?search_query=id:{paper_id}'
    elif api == "doaj":
        return []  # DOAJ reference fetching is not implemented

    response = requests.get(url)
    if response.status_code != 200:
        logging.error(f"Failed to fetch references: {response.status_code} - {response.text}")
        return []

    if api == "semantic_scholar":
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
    return all_references
