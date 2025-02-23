"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Bookmark,
  GitCompareArrowsIcon as CompareArrows,
  BarChartIcon as BubbleChart,
  Home,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { PageTitleProvider } from "./contexts/PageTitleContext"
import "./globals.css"

function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search Circulars" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/compare", icon: CompareArrows, label: "Compare Circulars" },
    { href: "/visualize", icon: BubbleChart, label: "Visualize" },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 transition-all duration-300 ease-in-out border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <span className="font-bold text-lg">RBI</span>
            </div>
            <span className="font-heading font-semibold text-lg text-header">RBI Assistant</span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="space-y-2 p-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={`w-full justify-start hover:bg-transparent ${
                    pathname === item.href
                      ? "bg-intel-blue text-white hover:bg-intel-blue hover:text-white"
                      : "hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageTitleProvider>
          <LayoutContent>{children}</LayoutContent>
        </PageTitleProvider>
      </body>
    </html>
  )
}

