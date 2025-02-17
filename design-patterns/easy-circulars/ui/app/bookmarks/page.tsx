"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark, X } from "lucide-react"
import { usePageTitle } from "../contexts/PageTitleContext"

// Mock data for circulars (you should replace this with your actual data source)
const mockCirculars = [
  { id: 1, title: "Circular on Digital Payments", date: "2023-05-15" },
  { id: 2, title: "Updated KYC Norms", date: "2023-06-01" },
  { id: 3, title: "Circular on Foreign Exchange Transactions", date: "2023-07-01" },
  { id: 4, title: "Circular on Cybersecurity Framework", date: "2023-08-01" },
]

export default function BookmarksPage() {
  const { setPageTitle } = usePageTitle()
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    setPageTitle("Bookmarks")
  }, [setPageTitle])

  useEffect(() => {
    const storedBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]")
    setBookmarks(storedBookmarks)
  }, [])

  const removeBookmark = (id: number) => {
    const updatedBookmarks = bookmarks.filter((bookmarkId) => bookmarkId !== id)
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks))
    setBookmarks(updatedBookmarks)
  }

  const handleCircularClick = (id: number) => {
    router.push(`/circular/${id}`)
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {bookmarks.map((id) => {
          const circular = mockCirculars.find((c) => c.id === id)
          if (!circular) return null
          return (
            <li key={circular.id} className="flex items-center justify-between border p-2 rounded">
              <div className="cursor-pointer" onClick={() => handleCircularClick(circular.id)}>
                <Bookmark className="inline-block mr-2" size={16} />
                <span className="font-semibold">{circular.title}</span>
                <p className="text-sm text-muted-foreground">Bookmarked on: {circular.date}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeBookmark(circular.id)}>
                <X size={16} />
              </Button>
            </li>
          )
        })}
      </ul>
      {bookmarks.length === 0 && (
        <p className="text-muted-foreground">No bookmarks yet. Add some from the circular pages!</p>
      )}
    </div>
  )
}

