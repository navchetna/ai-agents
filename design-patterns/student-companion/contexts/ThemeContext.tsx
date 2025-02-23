"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles"
import type { PaletteMode } from "@mui/material"

type ScheduledTheme = {
  enabled: boolean
  mode: "sunset" | "custom"
  lightModeTime: string
  darkModeTime: string
}

type ThemeContextType = {
  mode: PaletteMode
  toggleColorMode: () => void
  scheduledTheme: ScheduledTheme
  updateScheduledTheme: (settings: Partial<ScheduledTheme>) => void
}

const defaultScheduledTheme: ScheduledTheme = {
  enabled: false,
  mode: "sunset",
  lightModeTime: "06:00",
  darkModeTime: "18:00",
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleColorMode: () => {},
  scheduledTheme: defaultScheduledTheme,
  updateScheduledTheme: () => {},
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>("light")
  const [scheduledTheme, setScheduledTheme] = useState<ScheduledTheme>(defaultScheduledTheme)

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
    if (scheduledTheme.enabled) {
      // Disable scheduled theme when manually toggling
      setScheduledTheme((prev) => ({ ...prev, enabled: false }))
    }
  }

  const updateScheduledTheme = (settings: Partial<ScheduledTheme>) => {
    setScheduledTheme((prev) => ({ ...prev, ...settings }))
  }

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#4169E1" },
                background: { default: "#E6F4FE", paper: "#ffffff" },
                text: { primary: "#333333", secondary: "#666666" },
              }
            : {
                primary: { main: "#90CAF9" },
                background: { default: "#0F1116", paper: "#13151C" },
                text: { primary: "#FFFFFF", secondary: "#9BA1AE" },
              }),
        },
        components: {
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "light" ? "#E6F4FE" : "#1A1E27",
                color: mode === "light" ? "#333333" : "#FFFFFF",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#FFFFFF" : "#13151C",
              },
            },
          },
        },
      }),
    [mode],
  )

  useEffect(() => {
    const savedMode = localStorage.getItem("colorMode") as PaletteMode | null
    if (savedMode) {
      setMode(savedMode)
    }
    const savedScheduledTheme = localStorage.getItem("scheduledTheme")
    if (savedScheduledTheme) {
      setScheduledTheme(JSON.parse(savedScheduledTheme))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("colorMode", mode)
    localStorage.setItem("scheduledTheme", JSON.stringify(scheduledTheme))
    document.documentElement.classList.toggle("dark", mode === "dark")
  }, [mode, scheduledTheme])

  useEffect(() => {
    const handleScheduledTheme = () => {
      if (scheduledTheme.enabled) {
        const now = new Date()
        const currentTime = now.getHours() * 60 + now.getMinutes()

        if (scheduledTheme.mode === "sunset") {
          // Simplified sunrise/sunset times (6 AM and 6 PM)
          const sunriseTime = 6 * 60
          const sunsetTime = 18 * 60

          setMode(currentTime >= sunriseTime && currentTime < sunsetTime ? "light" : "dark")
        } else {
          const [lightHours, lightMinutes] = scheduledTheme.lightModeTime.split(":").map(Number)
          const [darkHours, darkMinutes] = scheduledTheme.darkModeTime.split(":").map(Number)
          const lightModeTime = lightHours * 60 + lightMinutes
          const darkModeTime = darkHours * 60 + darkMinutes

          if (lightModeTime < darkModeTime) {
            setMode(currentTime >= lightModeTime && currentTime < darkModeTime ? "light" : "dark")
          } else {
            setMode(currentTime >= lightModeTime || currentTime < darkModeTime ? "light" : "dark")
          }
        }
      }
    }

    handleScheduledTheme()
    const interval = setInterval(handleScheduledTheme, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [scheduledTheme])

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, scheduledTheme, updateScheduledTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

