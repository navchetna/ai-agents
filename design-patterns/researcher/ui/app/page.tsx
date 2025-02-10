"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  styled,
  Grid,
} from "@mui/material"
import {
  School as SchoolIcon,
  Search as SearchIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon,
} from "@mui/icons-material"
import SearchBar from "./components/SearchBar"
import DoodleBackground from "./components/doodlebackground"
import type { SearchRequest } from "./types"

const theme = createTheme({
  palette: {
    primary: {
      main: "#9333EA",
      light: "#A855F7",
      dark: "#7E22CE",
    },
  },
  components: {
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          transition: "box-shadow 0.2s ease-in-out",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.1)",
          },
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.2)",
          },
          "&.Mui-focused": {
            boxShadow: "0 4px 12px rgba(147, 51, 234, 0.15)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#9333EA",
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            marginLeft: "8px",
          },
          "& .MuiInputLabel-shrink": {
            marginLeft: 0,
          },
        },
      },
    },
  },
})

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: "0 auto",
  borderRadius: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  transition: "height 0.2s ease-in-out",
  overflow: "visible",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
}))

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
}))

const GradientBackground = styled(Box)({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #9333EA 0%, #A855F7 100%)",
  position: "relative",
  padding: "4rem 0",
  overflow: "hidden",
})

const FilterContainer = styled(Box)({
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
  "& .MuiFormControl-root": {
    minWidth: "160px",
    "& .MuiInputLabel-root": {
      transform: "translate(14px, 14px)",
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(0.75)",
    },
  },
})

export default function Home() {
  const [query, setQuery] = useState("")
  const [year, setYear] = useState<string>("")
  const [api, setApi] = useState<SearchRequest["api"]>("semantic_scholar")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const searchParams = new URLSearchParams({
      query: searchQuery,
      ...(year && { year }),
      api: api,
    })
    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <ThemeProvider theme={theme}>
      <GradientBackground>
        <DoodleBackground />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <SchoolIcon sx={{ fontSize: 48, color: "white", mb: 2 }} />
            <Typography variant="h2" component="h1" sx={{ color: "white", mb: 2 }}>
              Research Paper Search
            </Typography>
            <Typography variant="h5" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Search across multiple academic databases
            </Typography>
          </Box>

          <MainCard>
            <CardContent sx={{ p: 4 }}>
              <FilterContainer>
                <FormControl>
                  <InputLabel>Year</InputLabel>
                  <Select value={year} label="Year" onChange={(e) => setYear(e.target.value as string)}>
                    <MenuItem value="">Any year</MenuItem>
                    {[...Array(30)].map((_, i) => (
                      <MenuItem key={i} value={`${new Date().getFullYear() - i}`}>
                        {new Date().getFullYear() - i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <InputLabel>Database</InputLabel>
                  <Select value={api} label="Database" onChange={(e) => setApi(e.target.value as SearchRequest["api"])}>
                    <MenuItem value="semantic_scholar">Semantic Scholar</MenuItem>
                    <MenuItem value="arxiv_papers">arXiv Papers</MenuItem>
                    <MenuItem value="doaj">DOAJ</MenuItem>
                  </Select>
                </FormControl>
              </FilterContainer>

              <SearchBar
                onSearch={handleSearch}
                setQuery={setQuery}
                api={api}
                onSuggestionsVisibilityChange={setShowSuggestions}
              />
            </CardContent>
          </MainCard>

          <Grid container spacing={4} sx={{ mt: 6 }}>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  <SearchIcon sx={{ fontSize: 40, color: "white", mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                    Advanced Search
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    Search through multiple academic databases including Semantic Scholar, arXiv, and DOAJ with smart
                    filtering options.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  <CloudDownloadIcon sx={{ fontSize: 40, color: "white", mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                    Reference Snowballing
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    Explore paper references and citations with our snowballing feature to discover related research
                    efficiently.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  <ShareIcon sx={{ fontSize: 40, color: "white", mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
                    Easy Access
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    Get direct access to research papers with links to full texts, abstracts, and citation information.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </GradientBackground>
    </ThemeProvider>
  )
}

