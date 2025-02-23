"use client"

import { useEffect, useRef } from "react"
import { ForceGraph2D } from "react-force-graph"

// Mock data for circular relationships
const mockData = {
  nodes: [
    { id: "Circular1", group: 1 },
    { id: "Circular2", group: 1 },
    { id: "Circular3", group: 2 },
    { id: "Circular4", group: 2 },
    { id: "Circular5", group: 3 },
  ],
  links: [
    { source: "Circular1", target: "Circular2" },
    { source: "Circular1", target: "Circular3" },
    { source: "Circular2", target: "Circular4" },
    { source: "Circular3", target: "Circular4" },
    { source: "Circular4", target: "Circular5" },
  ],
}

export default function VisualizePage() {
  const graphRef = useRef<any>()

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge").strength(-120)
    }
  }, [])

  return (
    <div className="h-full">
      <div style={{ height: "calc(100vh - 2rem)" }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={mockData}
          nodeAutoColorBy="group"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id as string
            const fontSize = 12 / globalScale
            ctx.font = `${fontSize}px Sans-Serif`
            const textWidth = ctx.measureText(label).width
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = "white"
            ctx.fillRect(node.x - textWidth / 2, node.y - fontSize / 2, textWidth, fontSize)
            ctx.fillStyle = "black"
            ctx.fillText(label, node.x, node.y)
          }}
          linkDirectionalParticles={2}
        />
      </div>
    </div>
  )
}

