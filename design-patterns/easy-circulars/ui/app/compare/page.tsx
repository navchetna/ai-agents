"use client"

import { useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePageTitle } from "../contexts/PageTitleContext"

// Mock data for circulars
const mockCirculars = [
  { id: 1, title: "Digital Payments Circular 2022", content: "Old content about digital payments...", version: "2022" },
  {
    id: 2,
    title: "Digital Payments Circular 2023",
    content: "Updated content about digital payments...",
    version: "2023",
  },
  { id: 3, title: "KYC Norms 2022", content: "Old KYC norms...", version: "2022" },
  { id: 4, title: "KYC Norms 2023", content: "Updated KYC norms...", version: "2023" },
  {
    id: 5,
    title: "Foreign Exchange Regulations 2021",
    content: "Old foreign exchange regulations...",
    version: "2021",
  },
  {
    id: 6,
    title: "Foreign Exchange Regulations 2023",
    content: "Updated foreign exchange regulations...",
    version: "2023",
  },
]

type CircularGroup = {
  title: string
  versions: typeof mockCirculars
}

export default function ComparePage() {
  const { setPageTitle } = usePageTitle()
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [oldCircular, setOldCircular] = useState<string>("")
  const [newCircular, setNewCircular] = useState<string>("")

  useEffect(() => {
    setPageTitle("Compare Circulars")
  }, [setPageTitle])

  const circularGroups = useMemo(() => {
    const groups: { [key: string]: CircularGroup } = {}
    mockCirculars.forEach((circular) => {
      const title = circular.title.split(" ").slice(0, -1).join(" ")
      if (!groups[title]) {
        groups[title] = { title, versions: [] }
      }
      groups[title].versions.push(circular)
    })
    return Object.values(groups).filter((group) => group.versions.length > 1)
  }, [])

  const selectedVersions = useMemo(() => {
    return circularGroups.find((group) => group.title === selectedGroup)?.versions || []
  }, [selectedGroup, circularGroups])

  const handleCompare = () => {
    // Here you would typically implement the comparison logic
    console.log("Comparing", oldCircular, "with", newCircular)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="circular-group" className="block text-sm font-medium text-gray-700 mb-1">
          Select Circular Group
        </label>
        <Select
          value={selectedGroup}
          onValueChange={(value) => {
            setSelectedGroup(value)
            setOldCircular("")
            setNewCircular("")
          }}
        >
          <SelectTrigger id="circular-group" className="w-[300px]">
            <SelectValue placeholder="Select Circular Group" />
          </SelectTrigger>
          <SelectContent>
            {circularGroups.map((group) => (
              <SelectItem key={group.title} value={group.title}>
                {group.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGroup && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="old-circular" className="block text-sm font-medium text-gray-700 mb-1">
              Select Old Version
            </label>
            <Select value={oldCircular} onValueChange={setOldCircular}>
              <SelectTrigger id="old-circular" className="w-full">
                <SelectValue placeholder="Select Old Circular" />
              </SelectTrigger>
              <SelectContent>
                {selectedVersions.map((circular) => (
                  <SelectItem key={circular.id} value={circular.id.toString()}>
                    {circular.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label htmlFor="new-circular" className="block text-sm font-medium text-gray-700 mb-1">
              Select New Version
            </label>
            <Select value={newCircular} onValueChange={setNewCircular}>
              <SelectTrigger id="new-circular" className="w-full">
                <SelectValue placeholder="Select New Circular" />
              </SelectTrigger>
              <SelectContent>
                {selectedVersions.map((circular) => (
                  <SelectItem key={circular.id} value={circular.id.toString()}>
                    {circular.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Button onClick={handleCompare} disabled={!oldCircular || !newCircular}>
        Compare
      </Button>

      {oldCircular && newCircular && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Old Circular</h3>
            <ScrollArea className="h-[400px]">
              <p>{mockCirculars.find((c) => c.id === Number(oldCircular))?.content}</p>
            </ScrollArea>
          </div>
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">New Circular</h3>
            <ScrollArea className="h-[400px]">
              <p>{mockCirculars.find((c) => c.id === Number(newCircular))?.content}</p>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}

