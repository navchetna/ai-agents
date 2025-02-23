"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "bot" }>>([])
  const [input, setInput] = useState("")
  const [references, setReferences] = useState<string[]>([])

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }])
      // Here you would typically call an API to get the bot's response
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: "This is a simulated response about RBI circulars.", sender: "bot" }])
        setReferences(["Circular No. 123", "Circular No. 456"])
      }, 1000)
      setInput("")
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 mr-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Chat with RBI Circulars</h2>
        <ScrollArea className="h-[calc(100vh-200px)] mb-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block p-2 rounded-lg ${message.sender === "user" ? "bg-blue-100" : "bg-green-100"}`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about RBI circulars..." />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
      <div className="w-64 p-4 border-l">
        <h3 className="font-semibold mb-2">References</h3>
        {references.map((ref, index) => (
          <div key={index} className="bg-muted text-sm p-1 mb-1 rounded">
            {ref}
          </div>
        ))}
      </div>
    </div>
  )
}

