import axios from 'axios';
import { SearchResponse, SuggestResponse, ApiType } from '../types/api';
import { SEARCH_URL } from './constants';

export async function searchPapers(query: string, year?: number, api: string = 'semantic_scholar'): Promise<SearchResponse> {
  try {
    const response = await axios.post<SearchResponse>(`${SEARCH_URL}/search_papers`, 
      { query, year, api },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(`HTTP error! status: ${error.response.status}, body: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

export async function getSuggestions(query: string, api: ApiType = 'semantic_scholar'): Promise<SuggestResponse> {
  try {
    const response = await axios.get<SuggestResponse>(`${SEARCH_URL}/suggest`, {
      params: { q: query, api }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`HTTP error! status: ${error.response.status}`);
    }
    throw error;
  }
}

export async function downloadReferences(paperId: string, api: string = 'semantic_scholar'): Promise<Blob> {
  try {
    const response = await axios.post(`${SEARCH_URL}/download_references`, 
      { paper_id: paperId, api },
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return new Blob([response.data], { type: response.headers['content-type'] });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`HTTP error! status: ${error.response.status}`);
    }
    throw error;
  }
}