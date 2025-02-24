"use client"

import { useEffect, useRef } from "react"
import { styled } from "@mui/material/styles"

const BackgroundCanvas = styled("canvas")({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 0,
})

interface Doodle {
  x: number
  y: number
  size: number
  rotation: number
  speed: number
  type: "book" | "magnifier" | "citation" | "cap"
  opacity: number
  opacityDirection: 1 | -1
}

export default function DoodleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const doodlesRef = useRef<Doodle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener("resize", updateSize)

    // Initialize doodles
    const doodleTypes: Doodle["type"][] = ["book", "magnifier", "citation", "cap"]
    doodlesRef.current = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 40 + 20, // 20-60px
      rotation: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.2,
      type: doodleTypes[Math.floor(Math.random() * doodleTypes.length)],
      opacity: Math.random() * 0.3 + 0.1,
      opacityDirection: 1,
    }))

    const drawBook = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath()
      // Book cover
      ctx.moveTo(-size / 2, -size / 3)
      ctx.lineTo(size / 2, -size / 3)
      ctx.lineTo(size / 2, size / 3)
      ctx.lineTo(-size / 2, size / 3)
      ctx.closePath()
      ctx.stroke()
      // Book spine
      ctx.beginPath()
      ctx.moveTo(-size / 2, -size / 3)
      ctx.quadraticCurveTo(-size / 2 - size / 10, 0, -size / 2, size / 3)
      ctx.stroke()
      // Book pages
      ctx.beginPath()
      ctx.moveTo(-size / 2 + 5, -size / 3 + 5)
      ctx.lineTo(size / 2 - 5, -size / 3 + 5)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-size / 2 + 5, 0)
      ctx.lineTo(size / 2 - 5, 0)
      ctx.stroke()
    }

    const drawMagnifier = (ctx: CanvasRenderingContext2D, size: number) => {
      // Handle
      ctx.beginPath()
      ctx.moveTo(size / 4, size / 4)
      ctx.lineTo(size / 2, size / 2)
      ctx.stroke()
      // Glass
      ctx.beginPath()
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2)
      ctx.stroke()
      // Reflection
      ctx.beginPath()
      ctx.moveTo(-size / 6, -size / 6)
      ctx.lineTo(-size / 12, -size / 12)
      ctx.stroke()
    }

    const drawCitation = (ctx: CanvasRenderingContext2D, size: number) => {
      // Opening quote
      ctx.beginPath()
      ctx.moveTo(-size / 3, -size / 4)
      ctx.lineTo(-size / 6, -size / 4)
      ctx.lineTo(-size / 6, size / 4)
      ctx.lineTo(-size / 3, size / 4)
      ctx.stroke()
      // Closing quote
      ctx.beginPath()
      ctx.moveTo(size / 3, -size / 4)
      ctx.lineTo(size / 6, -size / 4)
      ctx.lineTo(size / 6, size / 4)
      ctx.lineTo(size / 3, size / 4)
      ctx.stroke()
    }

    const drawCap = (ctx: CanvasRenderingContext2D, size: number) => {
      // Cap top
      ctx.beginPath()
      ctx.moveTo(-size / 2, size / 6)
      ctx.quadraticCurveTo(0, -size / 2, size / 2, size / 6)
      ctx.stroke()
      // Cap base
      ctx.beginPath()
      ctx.moveTo(-size / 2, size / 6)
      ctx.lineTo(size / 2, size / 6)
      ctx.stroke()
      // Tassel
      ctx.beginPath()
      ctx.moveTo(0, -size / 2)
      ctx.quadraticCurveTo(size / 3, -size / 4, size / 3, size / 6)
      ctx.stroke()
    }

    const drawDoodle = (doodle: Doodle) => {
      if (!ctx) return

      ctx.save()
      ctx.translate(doodle.x, doodle.y)
      ctx.rotate(doodle.rotation)
      ctx.strokeStyle = `rgba(255, 255, 255, ${doodle.opacity})`
      ctx.lineWidth = 2

      switch (doodle.type) {
        case "book":
          drawBook(ctx, doodle.size)
          break
        case "magnifier":
          drawMagnifier(ctx, doodle.size)
          break
        case "citation":
          drawCitation(ctx, doodle.size)
          break
        case "cap":
          drawCap(ctx, doodle.size)
          break
      }

      ctx.restore()
    }

    let animationFrameId: number
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      doodlesRef.current.forEach((doodle) => {
        // Update position
        doodle.x += Math.cos(doodle.rotation) * doodle.speed
        doodle.y += Math.sin(doodle.rotation) * doodle.speed

        // Wrap around screen edges
        if (doodle.x < -doodle.size) doodle.x = canvas.width + doodle.size
        if (doodle.x > canvas.width + doodle.size) doodle.x = -doodle.size
        if (doodle.y < -doodle.size) doodle.y = canvas.height + doodle.size
        if (doodle.y > canvas.height + doodle.size) doodle.y = -doodle.size

        // Update rotation
        doodle.rotation += doodle.speed * 0.1

        // Update opacity for fade effect
        doodle.opacity += 0.002 * doodle.opacityDirection
        if (doodle.opacity >= 0.4) {
          doodle.opacityDirection = -1
        } else if (doodle.opacity <= 0.1) {
          doodle.opacityDirection = 1
        }

        // Draw the doodle
        drawDoodle(doodle)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", updateSize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <BackgroundCanvas ref={canvasRef} />
}

