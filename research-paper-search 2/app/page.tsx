"use client"

import { useState, useCallback, useEffect } from "react"
import { ThemeProvider, createTheme, styled } from "@mui/material/styles"
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material"
import {
  Search as SearchIcon,
  Hub as HubIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon,
} from "@mui/icons-material"
import SearchResults from "./components/SearchResults"
import References from "./components/References"
import DoodleBackground from "./components/doodlebackground"
import type { Paper, SearchRequest } from "./types"
import { performSearch } from "./utils/search"
import SearchBar from "./components/SearchBar"
import InfoBox from "./components/InfoBox"

const theme = createTheme({
  palette: {
    primary: {
      main: "#9333EA",
      light: "#A855F7",
      dark: "#7E22CE",
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "none",
          width: 280,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          margin: "4px 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.25)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
          borderRadius: "12px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white",
            borderRadius: "12px",
          },
        },
      },
    },
  },
})

const GradientBackground = styled(Box)({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #9333EA 0%, #A855F7 100%)",
  position: "relative",
  padding: "1rem",
  overflow: "hidden",
})

const MainContent = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "24px",
  padding: "2rem",
  minHeight: "calc(100vh - 2rem)",
  transition: "all 0.3s ease",
  [theme.breakpoints.up("md")]: {
    width: "calc(100% - 320px)",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "1200px",
  },
  [theme.breakpoints.down("md")]: {
    width: "100%",
    margin: "0 auto",
  },
}))

const SearchContainer = styled(Box)({
  maxWidth: "800px",
  margin: "0 auto",
})

const FilterContainer = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
  marginBottom: "1rem",
})

const SearchInput = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    height: "56px",
  },
})

enum View {
  Home = -1,
  Search = 0,
  References = 2,
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [year, setYear] = useState<string>("")
  const [api, setApi] = useState<SearchRequest["api"]>("semantic_scholar")
  const [currentView, setCurrentView] = useState<View>(View.Home)
  const [searchResults, setSearchResults] = useState<Paper[]>([])
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [depth, setDepth] = useState<1 | 2>(1)
  const [areSuggestionsVisible, setAreSuggestionsVisible] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const results = await performSearch(query, year, api)
      setSearchResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [query, year, api])

  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper)
    setCurrentView(View.References)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch()
    }
  }

  const handleFetchReferences = useCallback(
    async (paperId: string) => {
      //Implementation for fetching references
      console.log("Fetching references for", paperId, "with depth", depth)
    },
    [depth],
  )

  const handleSuggestionsVisibilityChange = (visible: boolean) => {
    setAreSuggestionsVisible(visible)
  }

  useEffect(() => {
    if (selectedPaper?.paperId) {
      handleFetchReferences(selectedPaper.paperId)
    }
  }, [selectedPaper?.paperId, handleFetchReferences])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedPaper?.paperId) {
      handleFetchReferences(selectedPaper.paperId)
    }
  }

  const drawer = (
    <>
      <List sx={{ mt: 2 }}>
        <ListItem disablePadding>
          <ListItemButton selected={currentView === View.Home} onClick={() => setCurrentView(View.Home)}>
            <ListItemIcon sx={{ color: "white" }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Home"
              sx={{
                "& .MuiListItemText-primary": {
                  color: "white",
                  fontWeight: currentView === View.Home ? 600 : 400,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={currentView === View.Search} onClick={() => setCurrentView(View.Search)}>
            <ListItemIcon sx={{ color: "white" }}>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText
              primary="Search Papers"
              sx={{
                "& .MuiListItemText-primary": {
                  color: "white",
                  fontWeight: currentView === View.Search ? 600 : 400,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={currentView === View.References} onClick={() => setCurrentView(View.References)}>
            <ListItemIcon sx={{ color: "white" }}>
              <HubIcon />
            </ListItemIcon>
            <ListItemText
              primary="Reference Snowballing"
              sx={{
                "& .MuiListItemText-primary": {
                  color: "white",
                  fontWeight: currentView === View.References ? 600 : 400,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  )

  const renderContent = () => {
    switch (currentView) {
      case View.Home:
        return (
          <Box sx={{ textAlign: "center", color: "white" }}>
            <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: "bold" }}>
              Research Paper Search
            </Typography>
            <Typography variant="h5" component="h2" sx={{ mb: 6, opacity: 0.8 }}>
              Search across multiple academic databases
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 4, mt: 8 }}>
              <InfoBox
                icon={SearchIcon}
                title="Advanced Search"
                description="Search through multiple academic databases including Semantic Scholar, arXiv, and DOAJ with smart filtering options."
              />
              <InfoBox
                icon={CloudDownloadIcon}
                title="Reference Snowballing"
                description="Explore paper references and citations with our snowballing feature to discover related research efficiently."
              />
              <InfoBox
                icon={ShareIcon}
                title="Easy Access"
                description="Get direct access to research papers with links to full texts, abstracts, and citation information."
              />
            </Box>
          </Box>
        )
      case View.Search:
        return (
          <>
            <Typography variant="h4" sx={{ color: "white", mb: 4, textAlign: "center" }}>
              Search Papers
            </Typography>
            <SearchContainer>
              <FilterContainer sx={{ mb: 3 }}>
                <FormControl fullWidth>
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

                <FormControl fullWidth>
                  <InputLabel>Database</InputLabel>
                  <Select
                    value={api}
                    defaultValue="semantic_scholar"
                    label="Database"
                    onChange={(e) => setApi(e.target.value as SearchRequest["api"])}
                  >
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
                onSuggestionsVisibilityChange={handleSuggestionsVisibilityChange}
              />
              {searchResults.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <SearchResults
                    papers={searchResults}
                    onPaperSelect={handlePaperSelect}
                    isLoading={isLoading}
                    api={api}
                  />
                </Box>
              )}
            </SearchContainer>
          </>
        )
      case View.References:
        return (
          <>
            <Typography variant="h4" sx={{ color: "white", mb: 4, textAlign: "center" }}>
              Reference Snowballing
            </Typography>
            <SearchContainer>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (selectedPaper?.paperId) {
                    handleFetchReferences(selectedPaper.paperId)
                  }
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    p: 3,
                    mb: 4,
                  }}
                >
                  <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
                    Enter Paper ID
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Semantic Scholar Paper ID"
                      value={selectedPaper?.paperId || ""}
                      onChange={(e) => {
                        setSelectedPaper({
                          paperId: e.target.value,
                          title: "",
                          url: "",
                          abstract: "",
                          snippet: "",
                          year: null,
                          authors: [],
                          id: e.target.value,
                        } as Paper)
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Depth</InputLabel>
                      <Select
                        value={depth}
                        label="Depth"
                        onChange={(e) => setDepth(Number(e.target.value) as 1 | 2)}
                        sx={{
                          backgroundColor: "white",
                          borderRadius: "12px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                {selectedPaper ? (
                  <References paperId={selectedPaper.paperId} depth={depth} />
                ) : (
                  <Typography sx={{ color: "white", textAlign: "center" }}>
                    Enter a paper ID or select a paper from search results to view its references
                  </Typography>
                )}
              </form>
            </SearchContainer>
          </>
        )
    }
  }

  useEffect(() => {
    if (selectedPaper?.paperId) {
      handleSubmit(new Event("submit") as unknown as React.FormEvent)
    }
  }, [selectedPaper?.paperId, handleSubmit])

  return (
    <ThemeProvider theme={theme}>
      <GradientBackground>
        <DoodleBackground />
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            component="nav"
            sx={{
              width: { md: 280 },
              flexShrink: { md: 0 },
            }}
          >
            <IconButton
              sx={{
                position: "fixed",
                top: 8,
                left: 8,
                color: "white",
                display: { md: "none" },
                zIndex: 1300,
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: "none", md: "block" },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>
          <MainContent>{renderContent()}</MainContent>
        </Box>
      </GradientBackground>
    </ThemeProvider>
  )
}

