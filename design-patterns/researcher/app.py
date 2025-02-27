import os
import nltk
import logging
import json
import requests
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

load_dotenv()

# Download additional data files if needed
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')
nltk.download('omw-1.4')

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

backend = FastAPI(title="Research Paper Assistant API")
backend.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI(title="app")
app.mount("/api", backend)

SEMANTIC_SCHOLAR_SEARCH_URL = "https://api.semanticscholar.org/graph/v1/paper/search"
SEMANTIC_SCHOLAR_REFERENCES_URL = "https://api.semanticscholar.org/graph/v1/paper/{paper_id}/references"
ARXIV_SEARCH_URL = "http://export.arxiv.org/api/query"
DOAJ_SEARCH_URL = "https://doaj.org/api/v1/search/articles/{query}"

class SearchQuery(BaseModel):
    query: str
    year: int = None
    api: str = "semantic_scholar"

class PaperID(BaseModel):
    paper_id: str
    api: str = "semantic_scholar"

class SemanticScholarAPI:
    @staticmethod
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

    @staticmethod
    def search_papers(query: str, year: int = None):
        semantic_query = SemanticScholarAPI.construct_query(query)
        url = f"{SEMANTIC_SCHOLAR_SEARCH_URL}?query={semantic_query}&fields=title,url,abstract,year&limit=10"
        response = requests.get(url)
        search_results = response.json().get('data', [])
        if year:
            search_results = [result for result in search_results if result.get('year') == year]
        return [{"title": result['title'], "url": result['url'], "snippet": result.get('abstract', '')} for result in search_results]

    @staticmethod
    def get_suggestions(query: str):
        semantic_query = SemanticScholarAPI.construct_query(query)
        url = f"{SEMANTIC_SCHOLAR_SEARCH_URL}?query={semantic_query}&fields=title,url,abstract"
        response = requests.get(url)
        results = response.json().get('data', [])
        return [result['title'] for result in results]

    @staticmethod
    def fetch_references(paper_id: str):
        url = SEMANTIC_SCHOLAR_REFERENCES_URL.format(paper_id=paper_id)
        response = requests.get(url)
        return response.json().get('data', [])

class ArxivAPI:
    @staticmethod
    def search_papers(query: str, year: int = None):
        url = f"{ARXIV_SEARCH_URL}?search_query={query}&start=0&max_results=10"
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
        return papers

    @staticmethod
    def fetch_references(paper_id: str):
        url =  f"{ARXIV_SEARCH_URL}?search_query=id:{paper_id}"
        response = requests.get(url)
        entries = response.text.split("<entry>")
        references = []
        for entry in entries[1:]:
            title = entry.split("<title>")[1].split("</title>")[0]
            url = entry.split("<id>")[1].split("</id>")[0]
            year = entry.split("<published>")[1].split("</published>")[0][:4]
            references.append({"title": title, "url": url, "year": int(year)})
        return references

class DOAJAPI:
    @staticmethod
    def fetch_papers(query: str, year: int = None):
        url = DOAJ_SEARCH_URL.format(query=query)
        params = {
            "api_key": os.getenv('DOAJ_API_KEY'),
            "pageSize": 10
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            logging.error(f"Failed to fetch DOAJ papers: Status Code: {response.status_code}, Raw Response: {response.text}")
            return []
        articles = response.json().get('results', [])
        papers = [{"title": article['bibjson']['title'], "url": article['bibjson']['link'][0]['url'], "snippet": article.get('bibjson', {}).get('abstract', ''), "year": article.get('bibjson', {}).get('year')} for article in articles]
        if year:
            papers = [paper for paper in papers if paper.get('year') and int(paper.get('year')) == int(year)]
        return papers

    @staticmethod
    def get_suggestions(query: str):
        papers = DOAJAPI.fetch_papers(query)
        return [paper['title'] for paper in papers]

@backend.post("/search_papers")
async def search_papers(search_query: SearchQuery):
    query = search_query.query
    year = search_query.year
    api = search_query.api.lower()

    if not query:
        raise HTTPException(status_code=400, detail="No query provided")
    try:
        if api == "semantic_scholar":
            papers = SemanticScholarAPI.search_papers(query, year)
        elif api == "arxiv_papers":
            papers = ArxivAPI.search_papers(query, year)
        elif api == "doaj":
            papers = DOAJAPI.fetch_papers(query, year)
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")
        
        logging.info(f"Search results for {query} (Year: {year}, API: {api}): {papers}")

        return {"papers": papers}
    except Exception as e:
        logging.error(f"Error processing search_papers request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@backend.get("/suggest")
async def suggest(q: str = Query(..., min_length=3, description="The user's input query to get suggestions for"), api: str = "semantic_scholar"):
    try:
        if api == "semantic_scholar":
            suggestions = SemanticScholarAPI.get_suggestions(q)
        elif api == "doaj":
            suggestions = DOAJAPI.get_suggestions(q)
        elif api == "arxiv_papers":
            return {"suggestions": [], "message": "arXiv API does not support suggestions. Please try Semantic Scholar or DOAJ."}
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")
        

        logging.info(f"Suggestions for {q} (API: {api}): {suggestions}")

        return {"suggestions": suggestions}
    except Exception as e:
        logging.error(f"Error processing suggest request: {e}")
        raise HTTPException(status_code=500, detail="Failed to get suggestions")

@backend.post("/download_references")
async def download_references(paper: PaperID, depth: int = 1):
    try:
        if paper.api == "semantic_scholar":
            references = SemanticScholarAPI.fetch_references(paper.paper_id)
        elif paper.api == "arxiv_papers":
            references = ArxivAPI.fetch_references(paper.paper_id)
        elif paper.api == "doaj":
            references = []
        else:
            raise HTTPException(status_code=400, detail="Unsupported API")

        if not references:
            raise HTTPException(status_code=500, detail="Failed to fetch references")
        
        logging.info(f"References for paper {paper.paper_id} (API: {paper.api}): {references}")


        with open("references.json", "w") as file:
            json.dump(references, file)
        return FileResponse("references.json", media_type='application/json')
    except Exception as e:
        logging.error(f"Error processing download_references request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@backend.get("/")
async def read_root():
    return {"message": "Welcome to the Research Paper Assistant API. Use /docs for interactive API documentation."}

if __name__ == "__main__":
    uvicorn.run(backend, host="0.0.0.0", port=8400)