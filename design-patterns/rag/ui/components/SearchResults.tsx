"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Search, ChevronDown, ChevronUp } from "lucide-react"
import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Container,
  CircularProgress,
  Alert,
  TextField,
  Collapse,
} from "@mui/material"
import { type PaperResult, isValidApiType, type ApiType } from "@/types/api"

export default function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [query, setQuery] = useState<string>("")
  const [papers, setPapers] = useState<PaperResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [expandedSnippets, setExpandedSnippets] = useState<{[key: string]: boolean}>({})
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const q = searchParams.get("q") || ""
    const apiParam = searchParams.get("api") || "semantic_scholar"
    const yearParam = searchParams.get("year")
    
    setQuery(q)
    setSearchQuery(q)
  }, [searchParams])

  useEffect(() => {
    const fetchPapers = async () => {
      if (!query) {
        setIsInitialLoad(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const apiParam = searchParams.get("api") || "semantic_scholar"
        const yearParam = searchParams.get("year")
        const api = isValidApiType(apiParam) ? apiParam : "semantic_scholar"
        const year = yearParam ? parseInt(yearParam) : 0

        const response = await fetch('http://localhost:8400/search_papers', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            year,
            api
          })
        })

        const data = await response.json()
        setPapers(data || [])
      } catch (error) {
        console.error('Search failed:', error)
        setError("Failed to fetch papers. Please try again.")
        setPapers([])
      } finally {
        setLoading(false)
        setIsInitialLoad(false)
      }
    }

    fetchPapers()
  }, [query, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleDownloadReferences = async (paperId: string) => {
    try {
      const response = await fetch('http://localhost:8400/download_references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper_id: paperId,
          api: searchParams.get("api") || "semantic_scholar"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `references-${paperId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading references:", error);
      setError("Failed to download references. Please try again.");
    }
  };

  const toggleSnippet = (paperId: string) => {
    setExpandedSnippets(prev => ({
      ...prev,
      [paperId]: !prev[paperId]
    }))
  }

  const isSnippetTruncated = (snippet: string | null): boolean => {
    if (!snippet) return false;
    return snippet.length > 300;
  }

  return (
    <Box className="min-h-screen flex flex-col bg-white">
        <Button
          startIcon={<ArrowLeft />}
          sx={{
            mb: 4,
            fontWeight: 500,
            color: "rgb(26, 13, 171)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      <Container maxWidth="lg" sx={{ paddingLeft: 4, paddingRight: 4 }}>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 500, color: "#000000", mb: 4 }}
        >
          Search Results for "{query}"
        </Typography>

        <Box component="form" onSubmit={handleSearch} noValidate sx={{ mb: 4 }}>
  <TextField
    fullWidth
    variant="outlined"
    placeholder="Search for research papers..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    InputProps={{
      endAdornment: (
        <Button type="submit" variant="contained" sx={{ borderRadius: "0 4px 4px 0" }}>
          <Search />
        </Button>
      ),
    }}
    sx={{
      backgroundColor: "white",
      borderRadius: "4px",
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#dfe1e5",
        },
        "&:hover fieldset": {
          borderColor: "#dfe1e5",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#4d90fe",
        },
      },
    }}
  />
</Box>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress sx={{ color: "white" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : !isInitialLoad && papers && papers.length > 0 ? (
          <Box 
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 2, 
              padding: 3, 
              backgroundColor: 'white'
            }}
          >
            {papers.map((paper, index) => {
              const paperId = paper.url.split('/').pop() || '';
              const isExpanded = expandedSnippets[paperId];
              const shouldShowReadMore = isSnippetTruncated(paper.snippet);
              
              return (
                <Box key={index} sx={{ mb: 3, pb: 3, borderBottom: index < papers.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1a0dab", textDecoration: "none" }}
                    >
                      {paper.title}
                    </a>
                  </Typography>
                  
                  {paper.snippet ? (
                    <Box>
                      <Collapse in={isExpanded} collapsedSize={60}>
                        <Typography variant="body2" color="text.secondary">
                          {paper.snippet}
                        </Typography>
                      </Collapse>
                      {shouldShowReadMore && (
                        <Button
                          onClick={() => toggleSnippet(paperId)}
                          startIcon={isExpanded ? <ChevronUp /> : <ChevronDown />}
                          sx={{ mt: 1, color: "#006621", textTransform: 'none' }}
                        >
                          {isExpanded ? "Show Less" : "Read More"}
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No abstract available
                    </Typography>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Button
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 500, color: "#006621" }}
                    >
                      Read Paper
                    </Button>
                    <Button
                      startIcon={<Download />}
                      onClick={() => paperId && handleDownloadReferences(paperId)}
                      sx={{ fontWeight: 500, color: "#006621" }}
                    >
                      Download References
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography sx={{ color: "black" }}>No results found.</Typography>
        )}
      </Container>
    </Box>
  )
}