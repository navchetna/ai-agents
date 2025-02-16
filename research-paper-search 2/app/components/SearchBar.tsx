"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TextField, Box, Paper, Typography, CircularProgress, Popper, ClickAwayListener } from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { fetchSuggestions } from "../utils/search"

interface SearchBarProps {
  onSearch: (query: string) => void
  setQuery: (query: string) => void
  api: string
  onSuggestionsVisibilityChange: (visible: boolean) => void
}

const SearchInput = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "white",
    borderRadius: "12px",
    height: "56px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.2)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#9333EA",
    },
  },
})

const SuggestionsList = styled(Paper)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: "12px",
  marginTop: "4px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  maxHeight: "300px",
  overflow: "auto",
}))

const SuggestionItem = styled(Box)(({ theme }) => ({
  padding: "12px 16px",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const preventSuggestionRef = useRef(false)

  const handleSuggestionsFetch = useCallback(
    async (input: string) => {
      if (!input || input.length < 2 || preventSuggestionRef.current) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const suggestionsList = await fetchSuggestions(input, api)
        if (!preventSuggestionRef.current) {
          setSuggestions(suggestionsList.map(processRawSuggestion))
          setAnchorEl(inputRef.current)
        }
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
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (searchTerm && !preventSuggestionRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        handleSuggestionsFetch(searchTerm)
        onSuggestionsVisibilityChange(true)
      }, 300)
    } else {
      setSuggestions([])
      setAnchorEl(null)
      onSuggestionsVisibilityChange(false)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchTerm, handleSuggestionsFetch, onSuggestionsVisibilityChange])

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
      clearSuggestions()
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm)
      clearSuggestions()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setQuery(suggestion)
    onSearch(suggestion)
    clearSuggestions()
  }

  const clearSuggestions = useCallback(() => {
    preventSuggestionRef.current = true
    setSuggestions([])
    setAnchorEl(null)
    setSelectedIndex(-1)
    onSuggestionsVisibilityChange(false)
    // Reset the prevention flag after a short delay
    setTimeout(() => {
      preventSuggestionRef.current = false
    }, 100)
  }, [onSuggestionsVisibilityChange])

  return (
    <ClickAwayListener onClickAway={clearSuggestions}>
      <Box sx={{ position: "relative" }} ref={inputRef}>
        <SearchInput
          fullWidth
          placeholder="Search papers..."
          value={searchTerm}
          onChange={(e) => {
            preventSuggestionRef.current = false
            setSearchTerm(e.target.value)
            setQuery(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <Box sx={{ pl: 1, pr: 1, display: "flex", alignItems: "center" }}>
                <SearchIcon sx={{ color: "text.secondary" }} />
              </Box>
            ),
            endAdornment: isLoading && (
              <Box sx={{ pr: 2 }}>
                <CircularProgress size={20} sx={{ color: "primary.main" }} />
              </Box>
            ),
          }}
        />
        <Popper
          open={Boolean(anchorEl) && suggestions.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
        >
          <SuggestionsList elevation={3}>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                className={index === selectedIndex ? "selected" : ""}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSuggestionClick(suggestion.main)
                }}
              >
                <Typography
                  sx={{
                    fontWeight: index === selectedIndex ? 500 : 400,
                    color: "text.primary",
                  }}
                >
                  {suggestion.main}
                </Typography>
                {suggestion.description && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    {suggestion.description}
                  </Typography>
                )}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}

