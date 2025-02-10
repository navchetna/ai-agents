"use client"

import type React from "react"
import { useState, useCallback } from "react"

interface Reference {
  paperId: string
  title: string
  url: string
  abstract: string
  year: number
  references?: Reference[]
}

export default function References() {
  const [paperId, setPaperId] = useState("")
  const [depth, setDepth] = useState(1)
  const [references, setReferences] = useState<Reference[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferences = useCallback(async () => {
    if (!paperId) {
      setError("Please enter a paper ID")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:8000/snowballing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paper_id: paperId,
          depth: depth,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch references: ${response.status}`)
      }

      const data = await response.json()
      setReferences(data.references)
    } catch (err) {
      console.error("Error fetching references:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch references")
    } finally {
      setIsLoading(false)
    }
  }, [paperId, depth])

  const handlePaperIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaperId(e.target.value)
  }

  const handleDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepth(Number(e.target.value))
  }

  const renderReferences = (refs: Reference[], level = 0) => {
    return (
      <ul className={`pl-${level * 4}`}>
        {refs.map((ref) => (
          <li key={ref.paperId} className="mb-4">
            <h3 className="font-semibold">{ref.title}</h3>
            <p className="text-sm text-gray-600">
              {ref.url} ({ref.year})
            </p>
            <p className="mt-1">{ref.abstract}</p>
            {ref.references && (
              <div className="mt-2">
                <h4 className="font-medium">Nested References:</h4>
                {renderReferences(ref.references, level + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">References Snowballing (Semantic Scholar)</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={paperId}
          onChange={handlePaperIdChange}
          placeholder="Enter Semantic Scholar Paper ID"
        />
        <select
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={depth}
          onChange={handleDepthChange}
        >
          <option value={1}>Depth 1</option>
          <option value={2}>Depth 2</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          onClick={fetchReferences}
          disabled={isLoading}
        >
          {isLoading ? "Fetching..." : "Fetch References"}
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {references.length > 0 && renderReferences(references)}
    </div>
  )
}

