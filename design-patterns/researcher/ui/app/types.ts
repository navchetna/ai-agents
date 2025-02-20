export interface SearchRequest {
  query: string
  year?: number
  api: "semantic_scholar" | "arxiv_papers" | "doaj"
}

export interface Paper {
  id: string
  paperId: string
  title: string
  url: string
  abstract: string
  snippet?: string // Make snippet optional
  year: number | null
  authors: string[]
  venue?: string
  citationCount?: number
}

export interface SearchResponse {
  papers: Paper[]
}

export interface SuggestionResponse {
  suggestions: string[]
  status: "success" | "error"
  message?: string
}

export type ReferenceDepth = 1 | 2

export interface ReferenceRequest {
  paper_id: string
  depth: ReferenceDepth
}

export interface ReferenceResponse {
  references: Paper[]
}

