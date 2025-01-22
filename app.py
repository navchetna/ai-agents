import os
import nltk
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from pydantic import BaseModel
import requests
from collections import defaultdict
import time
import logging
import networkx as nx

import io
import json
from fastapi.responses import FileResponse
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import fitz 

# Load environment variables
load_dotenv()

# Get DOAJ API key from environment variables
DOAJ_API_KEY = os.getenv('DOAJ_API_KEY')

# Download additional data files if needed
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')
nltk.download('omw-1.4')

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)

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

def make_request_with_retry(url, params=None, headers=None, max_retries=3, delay=5):
    for i in range(max_retries):
        try:
            response = requests.get(url, params=params, headers=headers)
            if response.status_code == 200:
                return response
            elif response.status_code == 429:
                logging.warning(f"Rate limit exceeded. Attempt {i+1}: Retrying after {delay} seconds.")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            else:
                logging.error(f"Attempt {i+1}: Failed request - Status Code: {response.status_code}, Raw Response: {response.text}")
        except requests.RequestException as e:
            logging.error(f"Attempt {i+1}: Request exception - {e}")
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

def get_semantic_scholar_suggestions(query):
    semantic_query = construct_query(query)
    url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={semantic_query}&fields=title,url,abstract'
    response = make_request_with_retry(url)
    if not response:
        return []
    results = response.json().get('data', [])
    suggestions = [result['title'] for result in results]
    return suggestions

def fetch_doaj_papers(query, year=None):
    url = f'https://doaj.org/api/v1/search/articles/{query}'
    params = {
        "api_key": DOAJ_API_KEY,
        "pageSize": 100
    }
    response = make_request_with_retry(url, params=params)
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


@app.post("/search_papers")
async def search_papers(search_query: SearchQuery):
    query = search_query.query
    year = search_query.year
    api = search_query.api.lower()

    if not query:
        raise HTTPException(status_code=400, detail="No query provided")

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

        return {"papers": papers}
    except Exception as e:
        logging.error(f"Error processing search_papers request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/suggest")
async def suggest(q: str = Query(..., min_length=3, description="The user's input query to get suggestions for"), api: str = "semantic_scholar"):
    current_time = time.time()
    if q in suggestions_cache and (current_time - suggestions_cache[q]['time']) < CACHE_EXPIRY_TIME:
        return {"suggestions": suggestions_cache[q]['data']}

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

        suggestions_cache[q] = {'data': suggestions, 'time': time.time()}
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



@app.post("/download_references")
async def download_references(paper: PaperID, depth: int = 1):
    if paper.api == "semantic_scholar":
        references = fetch_references_recursive(paper.paper_id, paper.api, depth)
    elif paper.api == "arxiv_papers":
        references = fetch_references(paper.paper_id, paper.api)
    elif paper.api == "doaj":
        references = fetch_doaj_references(paper.paper_id)
    else:
        raise HTTPException(status_code=400, detail="Unsupported API")

    if not references:
        raise HTTPException(status_code=500, detail="Failed to fetch references")
    
    with open("references.json", "w") as file:
        json.dump(references, file)
    
    return FileResponse("references.json", media_type='application/json')

@app.get("/")
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
