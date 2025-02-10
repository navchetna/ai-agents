"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TextField, Box, Paper, Typography, CircularProgress } from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { fetchSuggestions } from "../utils/search"

interface SearchBarProps {
  onSearch: (query: string) => void
  setQuery: (query: string) => void
  api: string
  onSuggestionsVisibilityChange: (visible: boolean) => void
}

const SearchContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  maxWidth: "800px",
  margin: "0 auto",
  zIndex: 1,
}))

const SearchInput = styled(TextField)(({ theme }) => ({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    transition: "all 0.2s ease-in-out",
    "&.Mui-focused": {
      boxShadow: "0 0 0 2px rgba(147, 51, 234, 0.3)",
      borderColor: "transparent",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "12px 16px",
    fontSize: "16px",
  },
}))

const SuggestionsList = styled(Paper)(({ theme }) => ({
  position: "relative", // Changed from absolute to relative
  marginTop: "4px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  zIndex: 2,
}))

const SuggestionItem = styled(Box)(({ theme }) => ({
  padding: "8px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: "rgba(147, 51, 234, 0.04)",
  },
  "&.selected": {
    backgroundColor: "rgba(147, 51, 234, 0.08)",
  },
}))

interface EnhancedSuggestion {
  main: string
  description?: string
}

const processRawSuggestion = (suggestion: string): EnhancedSuggestion => {
  const parts = suggestion.split(" - ")
  if (parts.length > 1) {
    return {
      main: parts[0],
      description: parts[1],
    }
  }
  return {
    main: suggestion,
  }
}

export default function SearchBar({ onSearch, setQuery, api, onSuggestionsVisibilityChange }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<EnhancedSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const handleSuggestionsFetch = useCallback(
    async (input: string) => {
      if (!input || input.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const suggestionsList = await fetchSuggestions(input, api)
        setSuggestions(suggestionsList.map(processRawSuggestion))
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [api],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSuggestionsFetch(searchTerm)
      } else {
        setSuggestions([])
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [searchTerm, handleSuggestionsFetch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        onSuggestionsVisibilityChange(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onSuggestionsVisibilityChange])

  // Update parent component when suggestions visibility changes
  useEffect(() => {
    onSuggestionsVisibilityChange(showSuggestions && searchTerm.length >= 2 && (suggestions.length > 0 || isLoading))
  }, [showSuggestions, searchTerm, suggestions.length, isLoading, onSuggestionsVisibilityChange])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex].main)
      } else {
        handleSearch()
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (event.key === "Escape") {
      setShowSuggestions(false)
      onSuggestionsVisibilityChange(false)
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm)
      setShowSuggestions(false)
      onSuggestionsVisibilityChange(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setQuery(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
    onSuggestionsVisibilityChange(false)
  }

  return (
    <SearchContainer ref={searchContainerRef}>
      <SearchInput
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setQuery(e.target.value)
          setShowSuggestions(true)
          setSelectedIndex(-1)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setShowSuggestions(true)
          if (searchTerm.length >= 2) {
            onSuggestionsVisibilityChange(true)
          }
        }}
        placeholder="Search papers..."
        InputProps={{
          startAdornment: <SearchIcon sx={{ ml: 1, mr: 1, color: "text.secondary" }} />,
        }}
      />

      {showSuggestions && searchTerm.length >= 2 && (suggestions.length > 0 || isLoading) && (
        <SuggestionsList elevation={3}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={20} sx={{ color: "primary.main" }} />
            </Box>
          ) : (
            suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                className={index === selectedIndex ? "selected" : ""}
                onClick={() => handleSuggestionClick(suggestion.main)}
              >
                <SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: index === selectedIndex ? 500 : 400,
                    }}
                  >
                    {suggestion.main}
                  </Typography>
                  {suggestion.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        mt: 0.25,
                      }}
                    >
                      {suggestion.description}
                    </Typography>
                  )}
                </Box>
              </SuggestionItem>
            ))
          )}
        </SuggestionsList>
      )}
    </SearchContainer>
  )
}

