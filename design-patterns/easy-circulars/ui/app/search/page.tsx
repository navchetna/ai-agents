"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { usePageTitle } from "../contexts/PageTitleContext"

interface Circular {
  id: number;
  title: string;
  tags: string[];
  date: string;
}

export default function SearchPage() {
  const { setPageTitle } = usePageTitle()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const router = useRouter()

  useEffect(() => {
    setPageTitle("Search Circulars")
    fetch('http://localhost:6016/v1/circular/get', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
      .then(response => response.json())
      .then((data: Circular[]) => setCirculars(data))
      .catch(error => console.error('Error fetching circulars:', error));
  }, [setPageTitle])

  const filteredCirculars = circulars.filter(
    (circular) =>
      (circular.title.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === "") &&
      (selectedTags.length === 0 || selectedTags.some((tag) => circular.tags.includes(tag))),
  )

  const allTags = Array.from(new Set(circulars.flatMap((c) => c.tags)))

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

