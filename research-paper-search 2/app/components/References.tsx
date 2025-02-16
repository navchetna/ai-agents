"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Box, Typography, Button, CircularProgress, Card, CardContent } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Launch as LaunchIcon, ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from "@mui/icons-material"
import type { Paper } from "../types"

const PaperCard = styled(Card)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  },
}))

const StyledCardContent = styled(CardContent)({
  "& .paper-title": {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: "#1a1a1a",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    lineHeight: 1.4,
  },
  "& .paper-abstract": {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: 1.6,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    backgroundColor: "rgba(243, 244, 246, 0.8)",
    padding: "16px",
    borderRadius: "8px",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    marginTop: "0.5rem",
  },
  "& .paper-metadata": {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "#4b5563",
    fontSize: "0.875rem",
    marginTop: "1rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  },
  "& .paper-url": {
    color: "#2563eb",
    wordBreak: "break-all",
    fontSize: "14px",
    marginTop: "0.5rem",
    marginBottom: "1rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    opacity: 0.9,
    "&:hover": {
      opacity: 1,
    },
  },
  "& .paper-keywords": {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  "& .keyword-chip": {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    color: "#2563eb",
    padding: "0.25rem 0.75rem",
    borderRadius: "16px",
    fontSize: "0.75rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    border: "1px solid rgba(37, 99, 235, 0.2)",
  },
})

interface ReferencesProps {
  paperId: string
  depth?: 1 | 2
}

export default function References({ paperId, depth = 1 }: ReferencesProps) {
  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [shouldSearch, setShouldSearch] = useState(false)
  const previousPaperIdRef = useRef(paperId)

  // Reset search state when paperId changes
  useEffect(() => {
    if (previousPaperIdRef.current !== paperId) {
      setShouldSearch(false)
      setPapers([])
      setError(null)
      previousPaperIdRef.current = paperId
    }
  }, [paperId])

  const loadReferences = useCallback(async () => {
    if (!paperId) return

    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = "http://localhost:8000/api"
      const response = await fetch(`${apiUrl}/download_references`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paper_id: paperId,
          depth: depth,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch references")
      }

      let referencesData = []
      if (data.references && Array.isArray(data.references)) {
        referencesData = data.references.map((ref: { citedPaper: any }) => ref.citedPaper || ref)
      } else if (Array.isArray(data)) {
        referencesData = data.map((ref) => ref.citedPaper || ref)
      } else if (data.paper && data.paper.references) {
        referencesData = data.paper.references.map((ref: { citedPaper: any }) => ref.citedPaper || ref)
      } else {
        throw new Error("Invalid response format from server")
      }

      const processedPapers = referencesData
        .map((ref: any) => ({
          id: ref.paperId || ref.id || "",
          paperId: ref.paperId || ref.id || "",
          title: ref.title || "Untitled Paper",
          url: ref.url || `https://www.semanticscholar.org/paper/${ref.paperId || ref.id}`,
          abstract: ref.abstract || ref.snippet || "No abstract available.",
          year: ref.year || null,
          authors: Array.isArray(ref.authors) ? ref.authors : [],
          venue: ref.venue || "",
          citationCount: typeof ref.citationCount === "number" ? ref.citationCount : 0,
        }))
        .filter((paper: { paperId: any; title: any }) => paper.paperId || paper.title)

      setPapers(processedPapers)
    } catch (err) {
      console.error("Error loading references:", err)
      setError(err instanceof Error ? err.message : "Failed to load references")
    } finally {
      setIsLoading(false)
    }
  }, [paperId, depth])

  useEffect(() => {
    if (shouldSearch && paperId) {
      loadReferences()
    }
  }, [shouldSearch, loadReferences, paperId])

  const handleSearch = () => {
    if (paperId) {
      setShouldSearch(true)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setShouldSearch(true)
  }

  if (!paperId) {
    return (
      <Box sx={{ textAlign: "center", color: "white", mt: 4 }}>
        <Typography>Enter a Paper ID to search for references</Typography>
      </Box>
    )
  }

  if (!shouldSearch) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          New Search
        </Button>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          mt: 4,
          p: 4,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <ErrorIcon sx={{ fontSize: 28, color: "white" }} />
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "white",
            }}
          >
            Unable to Load Paper Data
          </Typography>
        </Box>

        <Typography sx={{ color: "white", mb: 3, opacity: 0.9 }}>{error}</Typography>

        <Typography
          sx={{
            color: "white",
            mb: 2,
            fontWeight: 500,
          }}
        >
          Technical details:
        </Typography>

        <Box
          sx={{
            color: "white",
            opacity: 0.9,
            mb: 4,
          }}
        >
          <Box sx={{ mb: 1 }}>Paper ID: {paperId}</Box>
          <Box sx={{ mb: 1 }}>Attempt: {retryCount + 1}</Box>
          <Box>Time: {new Date().toISOString()}</Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ color: "white" }}>
          References for Paper ID: {paperId}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShouldSearch(false)}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          New Search
        </Button>
      </Box>
      {papers.length > 0 ? (
        renderReferences(papers)
      ) : (
        <Typography sx={{ color: "white", textAlign: "center" }}>No references found for this paper.</Typography>
      )}
    </Box>
  )
}

const renderReferences = (references: Paper[]) => {
  return (
    <Box>
      {references.map((paper, index) => (
        <PaperCard key={index}>
          <StyledCardContent>
            <Typography className="paper-title">{paper.title}</Typography>
            {paper.url && (
              <Typography className="paper-url">
                <a href={paper.url} target="_blank" rel="noopener noreferrer">
                  {paper.url}
                </a>
              </Typography>
            )}

            <div className="paper-keywords">
              {paper.title
                .split(" ")
                .filter((word) => word.length > 4)
                .slice(0, 5)
                .map((keyword, idx) => (
                  <span key={idx} className="keyword-chip">
                    {keyword.toLowerCase()}
                  </span>
                ))}
            </div>

            <Typography className="paper-abstract">{paper.abstract}</Typography>
            <div className="paper-metadata">
              <span>ID: {paper.paperId}</span>
              {paper.year && <span>Year: {paper.year}</span>}
              {paper.url && (
                <Button
                  variant="contained"
                  size="small"
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LaunchIcon />}
                  sx={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1d4ed8",
                    },
                    textTransform: "none",
                    fontWeight: 500,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                  }}
                >
                  View Paper
                </Button>
              )}
            </div>
          </StyledCardContent>
        </PaperCard>
      ))}
    </Box>
  )
}

