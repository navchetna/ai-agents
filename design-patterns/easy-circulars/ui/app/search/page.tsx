"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { usePageTitle } from "../contexts/PageTitleContext"

// Mock data for circulars
const mockCirculars = [
  { id: 1, title: "Circular on Digital Payments", tags: ["digital", "payments"], date: "2023-05-15" },
  { id: 2, title: "Circular on KYC Norms", tags: ["kyc", "compliance"], date: "2023-06-01" },
  { id: 3, title: "Circular on Foreign Exchange", tags: ["forex", "trade"], date: "2023-07-01" },
]

export default function SearchPage() {
  const { setPageTitle } = usePageTitle()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    setPageTitle("Search Circulars")
  }, [setPageTitle])

  const filteredCirculars = mockCirculars.filter(
    (circular) =>
      (circular.title.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === "") &&
      (selectedTags.length === 0 || selectedTags.some((tag) => circular.tags.includes(tag))),
  )

  const allTags = Array.from(new Set(mockCirculars.flatMap((c) => c.tags)))

  const handleCircularClick = (id: number) => {
    router.push(`/circular/${id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search circulars..."
            className="pl-8 bg-background text-foreground"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Search</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={`cursor-pointer ${
              selectedTags.includes(tag) ? "bg-emerald-green text-white" : "text-emerald-green"
            }`}
            onClick={() =>
              setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
            }
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="space-y-4">
        {filteredCirculars.map((circular) => (
          <Card key={circular.id} className="cursor-pointer" onClick={() => handleCircularClick(circular.id)}>
            <CardHeader>
              <CardTitle className="text-foreground">{circular.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Date: {circular.date}</p>
              <div className="flex gap-2">
                {circular.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-emerald-green text-white hover:bg-emerald-green hover:text-white"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

