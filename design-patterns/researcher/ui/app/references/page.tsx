"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ThemeProvider, createTheme, styled } from "@mui/material/styles"
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  type SelectChangeEvent,
} from "@mui/material"
import { ArrowBack as ArrowBackIcon, Science as ScienceIcon, Hub as HubIcon } from "@mui/icons-material"
import type { ReferenceDepth } from "../types"

const theme = createTheme({
  palette: {
    primary: {
      main: "#10B981",
    },
    background: {
      default: "#9333EA",
      paper: "#ffffff",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "uppercase",
          padding: "12px 24px",
        },
      },
    },
  },
})

const GradientBackground = styled("div")({
  background: "linear-gradient(135deg, #9333EA 0%, #A855F7 100%)",
  minHeight: "100vh",
  padding: "2rem 0",
})

const ContentCard = styled(Card)({
  maxWidth: 600,
  margin: "0 auto",
  borderRadius: "16px",
  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
})

const NavigationLink = styled(Link)({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "white",
  marginBottom: "2rem",
  maxWidth: 600,
  margin: "0 auto 2rem",
})

export default function Page() {
  const searchParams = useSearchParams()
  const [paperId, setPaperId] = React.useState(searchParams.get("paperId") || "")
  const [depth, setDepth] = React.useState<ReferenceDepth>(1)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  // Set the paper ID from URL parameters when component mounts
  React.useEffect(() => {
    const urlPaperId = searchParams.get("paperId")
    if (urlPaperId) {
      setPaperId(urlPaperId)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paperId) {
      setError("Please enter a Paper ID")
      return
    }

    router.push(`/references/${paperId}?depth=${depth}`)
  }

  const handleDepthChange = (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value)
    if (value === 1 || value === 2) {
      setDepth(value as ReferenceDepth)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <GradientBackground>
        <NavigationLink href="/">
          <IconButton size="small" sx={{ color: "white", mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          Back to Search
        </NavigationLink>

        <Container maxWidth="sm">
          <ContentCard>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <HubIcon sx={{ fontSize: 40, color: "#10B981", mb: 2 }} />
                <Typography variant="h4" component="h1" sx={{ color: "#10B981", fontWeight: 600 }}>
                  References Snowballing
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Paper ID"
                    placeholder="Enter Semantic Scholar Paper ID"
                    value={paperId}
                    onChange={(e) => {
                      setPaperId(e.target.value)
                      setError(null)
                    }}
                    error={!!error}
                    helperText={error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScienceIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Depth</InputLabel>
                    <Select value={depth} label="Depth" onChange={handleDepthChange}>
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                    </Select>
                  </FormControl>

                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "rgba(25, 118, 210, 0.05)",
                    }}
                  >
                    <Typography variant="body2">
                      Enter a Semantic Scholar Paper ID to fetch its references. Depth 1 will fetch direct references of
                      the paper, while Depth 2 will also fetch the references of each reference.
                    </Typography>
                  </Alert>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      backgroundColor: "#10B981",
                      "&:hover": {
                        backgroundColor: "#059669",
                      },
                    }}
                  >
                    Fetch References
                  </Button>
                </Box>
              </form>
            </CardContent>
          </ContentCard>
        </Container>
      </GradientBackground>
    </ThemeProvider>
  )
}

