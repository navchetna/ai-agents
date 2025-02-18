"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send, ExternalLink, Bookmark } from "lucide-react"
import { Viewer, Worker } from "@react-pdf-viewer/core";
import Link from "next/link"

interface Message {
  role: "user" | "bot"
  content: string
}

interface Circular {
  circular_id: string;
  title: string;
  tags: string[];
  date: string;
  url: string;
  bookmark: boolean;
  references: string[];
}

export default function CircularPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)

  const [circular, setCircular] = useState<Circular | null>(null);
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [references, setReferences] = useState<Circular[]>([])
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    if (!id) return;

    fetch("http://localhost:6016/v1/circular/get", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ circular_id: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        setCircular(data.circular);
        setReferences(data.references);
      })
      .catch((error) => {
        console.error("Error fetching circulars:", error);
      });
  }, [id]);

  const toggleBookmark = async () => {
    if (circular) {
      const updatedCircular = { ...circular, bookmark: !circular.bookmark };
  
      await fetch('http://10.235.124.11:6016/v1/circular/update', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circular_id: circular.circular_id,
          bookmark: updatedCircular.bookmark,
        }),
      });

      setCircular(updatedCircular);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { role: "user", content: input }])
      setInput("")

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: `This is a simulated response about ${circular?.title}.`,
          },
        ])
      }, 1000)
    }
  }

  const handleReferenceClick = (refId: string) => {
    setActiveTab("content")
    router.push(`/circular/${refId}`)
  }

  if (!circular) {
    return <div className="p-4">Circular not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/search">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button size="sm" onClick={toggleBookmark}>
            <Bookmark className={`h-4 w-4 mr-2 ${circular.bookmark ? "fill-current" : ""}`} />
            {circular.bookmark ? "Bookmarked" : "Bookmark"}
          </Button>
        </div>
      </div>
      <h2 className="text-3xl font-bold">{circular.title}</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[55vh] mb-4">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
                  <div>
                    <Viewer fileUrl={circular.url} />
                  </div>
                </Worker>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chat">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[50vh] mb-4">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this circular..."
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="references">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[50vh]">
                {references.map((ref) => (
                  <div
                    key={ref.circular_id}
                    className="bg-muted text-sm p-2 mb-2 rounded cursor-pointer hover:bg-muted/80"
                    onClick={() => handleReferenceClick(ref.circular_id)}
                  >
                    <div className="font-medium hover:underline flex items-center">
                      {ref.title}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

