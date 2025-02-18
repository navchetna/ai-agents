import type { Paper } from "../types"

interface PaperDetailsProps {
  paper: Paper
}

export default function PaperDetails({ paper }: PaperDetailsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Paper Details</h2>
      <h3 className="text-lg font-medium mb-2">{paper.title}</h3>
      <p className="text-sm text-gray-600 mb-2">
        URL:{" "}
        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {paper.url}
        </a>
      </p>
      <p>{paper.snippet}</p>
    </div>
  )
}

