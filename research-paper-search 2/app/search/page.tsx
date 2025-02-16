"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ThemeProvider, createTheme, styled } from "@mui/material/styles"
import { Container, Typography, Box, IconButton, Alert, AlertTitle } from "@mui/material"
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material"
import type { Paper } from "../types"
import { performSearch } from "../utils/search"
import SearchResults from "../components/SearchResults"

const theme = createTheme({
  palette: {
    primary: {
      main: "#9333EA",
    },
  },
  typography: {
    fontFamily: "'Geist', sans-serif",
  },
})

const GradientBackground = styled(Box)({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #9333EA 0%, #A855F7 100%)",
  padding: "2rem 0",
})

const QueryText = styled(Typography)({
  color: "white",
  opacity: 0.9,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  "& span": {
    opacity: 0.7,
  },
})

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query")
  const year = searchParams.get("year")
  const api = searchParams.get("api")

  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return

      setIsLoading(true)
      setError(null)
      try {
        console.log("Fetching search results for:", { query, year, api })
        const results = await performSearch(query, year || "", api || "semantic_scholar")
        console.log("Received search results:", results)
        setPapers(results)
      } catch (err) {
        console.error("Search error:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred while searching")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, year, api])

  return (
    <ThemeProvider theme={theme}>
      <GradientBackground>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Link
              href="/"
              style={{
                color: "white",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                fontSize: "1.1rem",
                marginBottom: "1rem",
              }}
            >
              <IconButton size="small" sx={{ color: "white", mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              Back to Search
            </Link>

            <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
              Search Results
            </Typography>

            <QueryText variant="h6">
              Query: {query} <span>›</span> Database: {api}
              {year && (
                <>
                  <span>›</span> Year: {year}
                </>
              )}
            </QueryText>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                backgroundColor: "rgba(211, 47, 47, 0.1)",
                color: "white",
                "& .MuiAlert-icon": {
                  color: "white",
                },
              }}
            >
              <AlertTitle>Error</AlertTitle>
              <Typography variant="body1">{error}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                It seems there's an issue with the server. Please try the following:
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  <li>Check if the backend server is running on http://localhost:8000</li>
                  <li>Verify that the `/search_papers` endpoint is correctly implemented on the server</li>
                  <li>Check the server logs for any error messages or stack traces</li>
                  <li>Ensure that the server can handle the current search query and API type</li>
                  <li>If the issue persists, try restarting the server and refreshing this page</li>
                </ul>
              </Typography>
            </Alert>
          )}

          <SearchResults
            papers={papers}
            isLoading={isLoading}
            api={api || "semantic_scholar"}
            onPaperSelect={(paper) => {
              window.open(paper.url, "_blank", "noopener,noreferrer")
            }}
          />
        </Container>
      </GradientBackground>
    </ThemeProvider>
  )
}

