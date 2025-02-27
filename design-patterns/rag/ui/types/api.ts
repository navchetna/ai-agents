export const API_TYPES = ['semantic_scholar', 'doaj', 'arxiv_papers'] as const;
export type ApiType = typeof API_TYPES[number];

export interface PaperResult {
  title: string;
  url: string;
  snippet: string | null;
  year?: number;
}

export interface SearchResponse {
  papers: PaperResult[];
}

export interface SuggestResponse {
  suggestions: string[];
}

export interface SearchParams {
  query: string;
  year?: number;
  api: ApiType;
}

export function isValidApiType(api: string): api is ApiType {
  return API_TYPES.includes(api as ApiType);
}