"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

type PageTitleContextType = {
  pageTitle: string
  setPageTitle: (title: string) => void
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined)

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState("Home")

  return <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>{children}</PageTitleContext.Provider>
}

export function usePageTitle() {
  const context = useContext(PageTitleContext)
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider")
  }
  return context
}

