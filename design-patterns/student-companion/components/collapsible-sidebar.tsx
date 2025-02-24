"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  AssignmentTurnedIn as AssignmentIcon,
  BarChart as BarChartIcon,
  Timer as TimerIcon,
  SmartToy as SmartToyIcon,
  LocalLibrary as LibraryIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material"
import { useTheme } from "@/contexts/ThemeContext"

const drawerWidth = 240
const collapsedDrawerWidth = 80 // Increased from 56 to accommodate twice the logo size

const menuItems = [
  // Dashboard (outside categories)
  { text: "Dashboard", icon: <DashboardIcon />, href: "/" },

  // Category 1: Learning & Study
  {
    category: "Learning & Study",
    items: [
      { text: "Courses", icon: <BookIcon />, href: "/courses" },
      { text: "Assignments", icon: <AssignmentIcon />, href: "/assignments" },
      { text: "Resource Library", icon: <LibraryIcon />, href: "/resource-library" },
    ],
  },

  // Category 2: Productivity Tools
  {
    category: "Productivity Tools",
    items: [
      { text: "Study Timer", icon: <TimerIcon />, href: "/study-timer" },
      { text: "AI Coach", icon: <SmartToyIcon />, href: "/ai-coach" },
    ],
  },

  // Category 3: Academic Performance
  {
    category: "Academic Performance",
    items: [
      { text: "Grades", icon: <BarChartIcon />, href: "/grades" },
      { text: "Schedule", icon: <CalendarIcon />, href: "/schedule" },
    ],
  },

  // Category 4: Settings & Support
  {
    category: "Settings & Support",
    items: [
      { text: "Support", icon: <HelpIcon />, href: "/support" },
      { text: "Settings", icon: <SettingsIcon />, href: "/settings" },
      { text: "Logout", icon: <LogoutIcon />, href: "/login" },
    ],
  },
]

export function CollapsibleSidebar() {
  const pathname = usePathname()
  const { mode, toggleColorMode } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Box
      component="nav"
      sx={{
        width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        transition: isCollapsed ? "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: mode === "light" ? "#E6F4FE" : "#1A1E27",
          color: mode === "light" ? "#333333" : "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ p: isCollapsed ? 1 : 2, display: "flex", justifyContent: "center", alignItems: "center", height: 120 }}
        >
          <Link href="/" style={{ display: "block", cursor: "pointer" }}>
            <Box
              sx={{
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Image
                src={
                  mode === "light"
                    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1h7AsPVzmFcMAVxvF5RDXRnnXO5VhM.png"
                    : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wt0xz484LuNz7HU6CqgwqvlCX2pJ31.png"
                }
                alt="Study Buddy Logo"
                width={isCollapsed ? 70 : 120}
                height={isCollapsed ? 70 : 120}
                style={{
                  objectFit: "contain",
                  transition: isCollapsed
                    ? "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    : "none",
                }}
              />
            </Box>
          </Link>
        </Box>
        <List sx={{ mb: 2 }}>
          {/* Dashboard */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/"
              selected={pathname === "/"}
              sx={{
                minHeight: 48,
                justifyContent: "center",
                px: isCollapsed ? 0 : 2.5,
                py: 1.5,
              }}
            >
              <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 3,
                    justifyContent: "center",
                    transition: isCollapsed ? "margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                  }}
                >
                  <DashboardIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                primary="Dashboard"
                sx={{
                  opacity: isCollapsed ? 0 : 1,
                  display: isCollapsed ? "none" : "block",
                  transition: isCollapsed ? "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Categories */}
          {menuItems.slice(1).map((category) => (
            <Box key={category.category}>
              {!isCollapsed && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 3,
                    py: 1.5,
                    display: "block",
                    color: "text.secondary",
                    fontWeight: "medium",
                  }}
                >
                  {category.category}
                </Typography>
              )}
              {category.items.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={pathname === item.href}
                    sx={{
                      minHeight: 48,
                      justifyContent: "center",
                      px: isCollapsed ? 0 : 2.5,
                      py: 1.5,
                    }}
                  >
                    <Tooltip title={isCollapsed ? item.text : ""} placement="right">
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: isCollapsed ? 0 : 3,
                          justifyContent: "center",
                          transition: isCollapsed ? "margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </Tooltip>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: isCollapsed ? 0 : 1,
                        display: isCollapsed ? "none" : "block",
                        transition: isCollapsed ? "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Box>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 1,
            borderTop: 1,
            borderColor: "divider",
            width: "100%",
          }}
        >
          <Box
            onClick={toggleCollapse}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              p: 1,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <IconButton color="inherit" sx={{ p: 0 }}>
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
          <Box
            onClick={toggleColorMode}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              p: 1,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <IconButton color="inherit" sx={{ p: 0 }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

