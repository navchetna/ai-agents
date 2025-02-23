"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Video } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Resource = {
  id: string
  title: string
  subject: string
  type: "past_paper" | "notes" | "video"
  grade: number
  url: string
  year?: number
}

const resources: Resource[] = [
  { id: "1", title: "Math Exam 2022", subject: "Mathematics", type: "past_paper", grade: 10, url: "#", year: 2022 },
  { id: "2", title: "Physics Notes: Mechanics", subject: "Physics", type: "notes", grade: 11, url: "#" },
  { id: "3", title: "History: World War II", subject: "History", type: "video", grade: 9, url: "#" },
  { id: "4", title: "English Literature: Shakespeare", subject: "English", type: "notes", grade: 10, url: "#" },
  { id: "5", title: "Chemistry Lab Report Guide", subject: "Chemistry", type: "notes", grade: 11, url: "#" },
  { id: "6", title: "Biology Exam 2023", subject: "Biology", type: "past_paper", grade: 9, url: "#", year: 2023 },
  { id: "7", title: "Math Exam 2021", subject: "Mathematics", type: "past_paper", grade: 10, url: "#", year: 2021 },
  { id: "8", title: "Physics Exam 2022", subject: "Physics", type: "past_paper", grade: 11, url: "#", year: 2022 },
]

const subjects = Array.from(new Set(resources.map((r) => r.subject)))
const years = Array.from(new Set(resources.filter((r) => r.year).map((r) => r.year as number))).sort((a, b) => b - a)
const grades = Array.from(new Set(resources.map((r) => r.grade))).sort((a, b) => a - b)

export default function ResourceLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !selectedSubject || resource.subject === selectedSubject
    const matchesYear = !selectedYear || resource.year === selectedYear
    const matchesGrade = !selectedGrade || resource.grade === selectedGrade
    return matchesSearch && matchesSubject && matchesYear && matchesGrade
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Resource Library</h1>
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={selectedSubject || "all"}
          onValueChange={(value) => setSelectedSubject(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedYear?.toString() || "all"}
          onValueChange={(value) => setSelectedYear(value === "all" ? null : Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedGrade?.toString() || "all"}
          onValueChange={(value) => setSelectedGrade(value === "all" ? null : Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade.toString()}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="past_papers">Past Papers</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ResourceGrid resources={filteredResources} />
        </TabsContent>
        <TabsContent value="past_papers">
          <ResourceGrid resources={filteredResources.filter((r) => r.type === "past_paper")} />
        </TabsContent>
        <TabsContent value="notes">
          <ResourceGrid resources={filteredResources.filter((r) => r.type === "notes")} />
        </TabsContent>
        <TabsContent value="videos">
          <ResourceGrid resources={filteredResources.filter((r) => r.type === "video")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ResourceGrid({ resources }: { resources: Resource[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <a
          key={resource.id}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform hover:scale-105"
        >
          <Card className="h-full overflow-hidden">
            <div className={`h-full ${getGradientClass(resource.subject)}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                  <span>{resource.title}</span>
                  {resource.type === "past_paper" && <FileText className="h-5 w-5" />}
                  {resource.type === "notes" && <FileText className="h-5 w-5" />}
                  {resource.type === "video" && <Video className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary" className="bg-white/20 text-gray-900 dark:text-gray-100">
                    {resource.subject}
                  </Badge>
                  <span className="text-sm text-gray-800 dark:text-gray-200">Grade {resource.grade}</span>
                  {resource.year && (
                    <Badge variant="outline" className="bg-white/10 text-gray-900 dark:text-gray-100 border-gray-500">
                      {resource.year}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </a>
      ))}
    </div>
  )
}

function getGradientClass(subject: string): string {
  const gradients: { [key: string]: string } = {
    Mathematics: "from-blue-400/80 to-blue-300/80",
    Physics: "from-teal-400/80 to-teal-300/80",
    History: "from-amber-400/80 to-amber-300/80",
    English: "from-green-400/80 to-green-300/80",
    Chemistry: "from-pink-400/80 to-pink-300/80",
    Biology: "from-emerald-400/80 to-emerald-300/80",
  }
  return `bg-gradient-to-br ${gradients[subject] || "from-gray-400/80 to-gray-300/80"}`
}

