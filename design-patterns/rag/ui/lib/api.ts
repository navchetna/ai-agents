import { SearchResponse, SuggestResponse } from '../types/api';
import { SEARCH_URL } from './constants';
import { ApiType } from '../types/api';


export async function searchPapers(query: string, year?: number, api: string = 'semantic_scholar'): Promise<SearchResponse> {
  console.log('Sending request to:', `locahost:8401/search_papers`);
  console.log('Request payload:', { query, year, api });

  const response = await fetch(`http://locahost:8401/search_papers`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, year, api }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  const data = await response.json();
  console.log('Response data:', data);
  return data;
}

export async function getSuggestions(query: string, api: ApiType = 'semantic_scholar'): Promise<SuggestResponse> {
  const response = await fetch(`http://localhost:8401/suggest?q=${encodeURIComponent(query)}&api=${api}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function downloadReferences(paperId: string, api: string = 'semantic_scholar'): Promise<Blob> {
  const response = await fetch(`http://localhost:8401/download_references`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paper_id: paperId, api }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.blob();
}