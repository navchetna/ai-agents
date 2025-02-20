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
import axios from "axios"

interface Message {
  question: string;
  answer: string;
  sources: string[];
  timestamp: string;
}

interface Conversation {
  conversation_id: string;
  created_at: string;
  last_updated: string;
  history: Message[];
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
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("")
  const [references, setReferences] = useState<Circular[]>([])
  const [activeTab, setActiveTab] = useState("content")

  const fetchCircular = async (id: string) => {
    try {
      const response = await axios.get(
        "http://localhost:9001/circular/get",
        {
          params: { circular_id: id },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );      
  
      const data = response.data;
      setCircular(data.circular);
      setReferences(data.references);
  
      let conversationId = data.circular.conversation_id;
  
      if (!conversationId) {
        conversationId = await createNewConversation();
        if (conversationId) {
          await updateCircularConversation(id, conversationId);
        }
      }
  
      if (conversationId) {
        await fetchConversation(conversationId);
      }
    } catch (error) {
      console.error("Error fetching circulars:", error);
    }
  };
  
  const fetchConversation = async (conversationId: string) => {
    try {
      const response = await axios.get(`http://localhost:9001/conversation/${conversationId}`, {
        params: { db_name: "easy_circulars" },
      });
      setConversation(response.data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };
  
  
  const createNewConversation = async (): Promise<string | null> => {
    try {
      const response = await axios.post("http://localhost:9001/conversation/new", {
        db_name: "easy_circulars",
      }, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });
  
      const data = response.data;
      console.log("New conversation created:", data);
      return data.conversation_id || null;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      return null;
    }
  };
  
  const updateCircularConversation = async (circularId: string, conversationId: string) => {
    try {
      const response = await axios.patch(
        "http://localhost:9001/circular/update",
        { 
          circular_id: circularId, 
          conversation_id: conversationId,
        }, 
        {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );      
  
      const data = response.data;
      console.log("Circular updated with new conversation ID:", data);
    } catch (error) {
      console.error("Error updating circular:", error);
    }
  };
  
  
  useEffect(() => {
    if (id) {
      fetchCircular(id);
    }
  }, [id]);  

  const toggleBookmark = async () => {
    if (circular) {
      const updatedCircular = { ...circular, bookmark: !circular.bookmark };

      await axios.patch(
        "http://localhost:9001/circular/update",
        { 
          circular_id: circular.circular_id,
          bookmark: updatedCircular.bookmark,
        }, 
        {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );      
      setCircular(updatedCircular);
    }
  };

  const handleSend = async () => {
    if (input.trim() && conversation) {
      const newMessage: Message = {
        question: input,
        answer: "",
        sources: [],
        timestamp: new Date().toISOString(),
      };
  
      setInput("");
  
      try {
        console.log(input)
        const response = await axios.post(
          `http://localhost:9001/conversation/${conversation.conversation_id}`,
          { db_name: "easy_circulars", question: input },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log(response)
  
        const botResponse: Message = {
          question: input,
          answer: response.data.answer,
          sources: response.data.sources || [],
          timestamp: new Date().toISOString(),
        };

        setConversation((prev) =>
          prev
            ? {
                ...prev,
                history: [...prev.history, botResponse],
                last_updated: new Date().toISOString(),
              }
            : null
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };  

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
                {conversation?.history.map((message, index) => (
                  <>
                    <div key={index} className="mb-4 text-right">
                      <div
                        className="inline-block p-2 rounded-lg bg-primary text-primary-foreground"
                      >
                        {message.question}
                      </div>
                    </div>
                    <div key={index} className="mb-4 text-left">
                      <div
                        className="inline-block p-2 rounded-lg bg-muted"
                      >
                        {message.answer}
                      </div>
                    </div>
                  </>
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

