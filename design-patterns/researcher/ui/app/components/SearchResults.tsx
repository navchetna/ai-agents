"use client"

import { Box, Card, CardContent, Typography, Button, Chip, CircularProgress } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useRouter } from "next/navigation"
import {
  Hub as HubIcon,
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material"
import { useState } from "react"
import type { Paper } from "../types"

const ResultCard = styled(Card)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.95)", // Lighter background
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 40px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-2px)",
  },
}))

const CardTitle = styled(Typography)({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontSize: "20px",
  fontWeight: 600,
  color: "#1a1a1a", // Dark text for better contrast
  marginBottom: "12px",
})

const CardUrl = styled(Typography)({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontSize: "14px",
  color: "#2563eb", // Blue color for URLs
  marginBottom: "12px",
  wordBreak: "break-all",
})

const AbstractText = styled(Typography)({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#4b5563", // Gray color for better readability
  backgroundColor: "rgba(243, 244, 246, 0.8)", // Light gray background
  padding: "16px",
  borderRadius: "8px",
  marginBottom: "16px",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
})

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#2563eb", // Blue background
  color: "white",
  borderRadius: "8px",
  padding: "6px 16px",
  fontSize: "0.875rem",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontWeight: 500,
  textTransform: "none",
  marginRight: theme.spacing(1),
  "&:hover": {
    backgroundColor: "#1d4ed8", // Darker blue on hover
  },
}))

const KeywordChip = styled(Chip)({
  backgroundColor: "rgba(37, 99, 235, 0.1)", // Light blue background
  color: "#2563eb", // Blue text
  margin: "0 4px 4px 0",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontWeight: 500,
})

const ExpandButton = styled(Button)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "#4b5563", // Gray color
  fontSize: "0.875rem",
  padding: "4px 8px",
  minWidth: "auto",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
}))

interface SearchResultsProps {
  papers: Paper[]
  onPaperSelect: (paper: Paper) => void
  isLoading: boolean
  api: string
}

const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || []
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "this",
    "that",
    "these",
    "those",
  ])
  const uniqueWords = new Set(words.filter((word) => !commonWords.has(word)))
  return Array.from(uniqueWords).slice(0, 5)
}

export default function SearchResults({ papers, onPaperSelect, isLoading, api }: SearchResultsProps) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const router = useRouter()

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedCards)
    if (expandedCards.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCards(newExpanded)
  }

  const handleViewReferences = (paper: Paper) => {
    // Navigate directly to references page with the paper ID
    router.push(`/references?paperId=${paper.paperId || paper.id}`)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
      </Box>
    )
  }

  if (papers.length === 0) {
    return (
      <ResultCard>
        <CardContent>
          <Typography color="rgba(255, 255, 255, 0.7)" align="center">
            No papers found. Try adjusting your search query.
          </Typography>
        </CardContent>
      </ResultCard>
    )
  }

  return (
    <Box>
      {papers.map((paper, index) => (
        <ResultCard key={index}>
          <CardContent>
            <CardTitle variant="h6">{paper.title}</CardTitle>
            <CardUrl variant="body2">{paper.url}</CardUrl>

            <Box sx={{ mb: 2 }}>
              {extractKeywords(paper.title + " " + (paper.abstract || "")).map((keyword, idx) => (
                <KeywordChip key={idx} label={keyword} size="small" />
              ))}
            </Box>

            {paper.abstract ? (
              <>
                <AbstractText>
                  {expandedCards.has(index)
                    ? paper.abstract
                    : paper.abstract.slice(0, 200) + (paper.abstract.length > 200 ? "..." : "")}
                </AbstractText>
                {paper.abstract.length > 200 && (
                  <ExpandButton
                    onClick={() => toggleExpand(index)}
                    startIcon={expandedCards.has(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                    {expandedCards.has(index) ? "Show Less" : "Show More"}
                  </ExpandButton>
                )}
              </>
            ) : (
              <AbstractText sx={{ fontStyle: "italic", opacity: 0.7 }}>No abstract available</AbstractText>
            )}

            <Box sx={{ mt: 2 }}>
              <ActionButton startIcon={<OpenInNewIcon />} onClick={() => onPaperSelect(paper)}>
                Open Paper
              </ActionButton>
              {api === "semantic_scholar" && (
                <ActionButton startIcon={<HubIcon />} onClick={() => handleViewReferences(paper)}>
                  View References
                </ActionButton>
              )}
            </Box>
          </CardContent>
        </ResultCard>
      ))}
    </Box>
  )
}

