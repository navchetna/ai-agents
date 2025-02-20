import axios from "axios"
import type { Paper } from "../types"

const URL = "http://localhost:8000/api"

// const axiosInstance = axios.create({
//   baseURL: "/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

const validatePaper = (paper: any): Paper => {
  return {
    id: paper.id || paper.paperId || "",
    paperId: paper.paperId || paper.id || "",
    title: paper.title || "Untitled Paper",
    url: paper.url || "",
    abstract: paper.abstract || paper.snippet || "",
    year: paper.year || null,
    authors: Array.isArray(paper.authors) ? paper.authors : [],
    venue: paper.venue || "",
    citationCount: typeof paper.citationCount === "number" ? paper.citationCount : 0,
  }
}

export const fetchSuggestions = async (input: string, apiType: string): Promise<string[]> => {
  try {
    console.log("Fetching suggestions for:", input, "API:", apiType)
    const response = await axios.get(`${URL}/suggest`, {
      params: { q: input, api: apiType },
    })

    console.log("Received suggestions response:", response.data)

    if (!response.data) {
      throw new Error("Empty response from server")
    }

    if (response.data.status === "error") {
      throw new Error(response.data.message || "Failed to fetch suggestions")
    }

    return response.data.suggestions || []
  } catch (err) {
    console.error("Error fetching suggestions:", err)
    if (axios.isAxiosError(err)) {
      console.error("Axios error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        code: err.code,
        request: {
          method: err.config?.method,
          url: err.config?.url,
          params: err.config?.params,
        },
      })

      if (err.response?.status === 500) {
        throw new Error("Server error occurred while fetching suggestions. Please try again later.")
      }
      if (err.code === "ECONNREFUSED") {
        throw new Error("Cannot connect to server. Please check if the server is running.")
      }
    }
    throw new Error(`Failed to fetch suggestions: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

export const performSearch = async (searchQuery: string, year: string, apiType: string): Promise<Paper[]> => {
  try {
    console.log("Sending search request:", { searchQuery, year, apiType })
    const response = await axios.post(`${URL}/search_papers`, {
      query: searchQuery,
      year: year ? Number.parseInt(year) : undefined,
      api: apiType,
    })

    console.log("Received search response:", response.data)

    if (!response.data) {
      throw new Error("Empty response from server")
    }

    let papers: any[]
    if (Array.isArray(response.data)) {
      papers = response.data
    } else if (response.data.papers && Array.isArray(response.data.papers)) {
      papers = response.data.papers
    } else {
      console.error("Unexpected response format:", response.data)
      throw new Error("Invalid response format from server")
    }

    return papers.map(validatePaper).filter((paper) => paper.paperId || paper.title)
  } catch (err) {
    console.error("Search error:", err)
    throw new Error(`Failed to search papers: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

export const fetchReferences = async (paperId: string): Promise<Paper[]> => {
  try {
    if (!paperId) {
      throw new Error("Paper ID is required")
    }

    console.log("Fetching references for paper:", paperId)
    const response = await axios.post(`${URL}/download_references`, {
      paper_id: paperId,
      depth: 1,
    })

    console.log("Raw response from /download_references:", response.data)

    if (!response.data) {
      throw new Error("Empty response from server")
    }

    let papers: Paper[]
    if (Array.isArray(response.data)) {
      papers = response.data
    } else if (response.data.references && Array.isArray(response.data.references)) {
      papers = response.data.references
    } else if (response.data.paper || response.data.citedPaper) {
      papers = [response.data.paper || response.data.citedPaper]
    } else {
      console.error("Unexpected response format:", response.data)
      throw new Error("Invalid response format from server")
    }

    return papers.map(validatePaper).filter((paper) => paper.paperId || paper.title)
  } catch (err) {
    console.error("Error fetching references:", err)
    if (axios.isAxiosError(err)) {
      console.error("Axios error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        code: err.code,
        request: {
          method: err.config?.method,
          url: err.config?.url,
          data: err.config?.data,
          headers: err.config?.headers,
        },
      })

      if (err.response?.status === 500) {
        throw new Error(`Server error (500) occurred: ${err.response.data.message || "Unknown server error"}`)
      }
      if (err.code === "ERR_NETWORK") {
        throw new Error("Network error. Please check your internet connection and ensure the server is running.")
      }
    }
    throw new Error(`Failed to fetch references: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}
