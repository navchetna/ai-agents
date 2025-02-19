"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark, X } from "lucide-react"
import { usePageTitle } from "../contexts/PageTitleContext"
import axios from "axios"

interface Circular {
  circular_id: string;
  title: string;
  tags: string[];
  date: string;
  url: string;
  bookmark: boolean;
  references: string[];
}


export default function BookmarksPage() {
  const { setPageTitle } = usePageTitle()
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const router = useRouter()

  useEffect(() => {
    setPageTitle("Bookmarks")
    axios.post<Circular[]>("http://10.235.124.11:6016/v1/circular/get", 
      { bookmark: true }, 
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => setCirculars(response.data))
      .catch((error) => console.error("Error fetching circulars:", error));
  }, [setPageTitle])

  const removeBookmark = async (id: string) => {
    const updatedCirculars = circulars.filter(circular => circular.circular_id !== id)
    await axios.post("http://10.235.124.11:6016/v1/circular/update", 
      {
        circular_id: id,
        bookmark: false,
      }, 
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      }
    );    
    setCirculars(updatedCirculars)
  }

  const handleCircularClick = (id: string) => {
    router.push(`/circular/${id}`)
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {circulars.map((circular) => {
          return (
            <li key={circular.circular_id} className="flex items-center justify-between border p-2 rounded">
              <div className="cursor-pointer" onClick={() => handleCircularClick(circular.circular_id)}>
                <Bookmark className="inline-block mr-2" size={16} />
                <span className="font-semibold">{circular.title}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeBookmark(circular.circular_id)}>
                <X size={16} />
              </Button>
            </li>
          )
        })}
      </ul>
      {circulars.length === 0 && (
        <p className="text-muted-foreground">No bookmarks yet. Add some from the circular pages!</p>
      )}
    </div>
  )
}

