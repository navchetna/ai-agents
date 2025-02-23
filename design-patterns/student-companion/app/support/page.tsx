"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageSquare, Search } from "lucide-react"
import Link from "next/link"

// Mock data for FAQ
const faqData = [
  {
    question: "How do I browse books in the app?",
    answer:
      "You can browse books by navigating to the 'Library' section. Use filters to sort by subject, grade, or recently added. Click on a book cover to view more details or start reading.",
  },
  {
    question: "How does the study timer work?",
    answer:
      "The study timer uses the Pomodoro technique. By default, it sets 25-minute study sessions followed by 5-minute breaks. You can customize these durations in the Settings page.",
  },
  {
    question: "Can I highlight text in the books?",
    answer:
      "Yes, you can highlight text by selecting it and choosing the highlight option. Your highlights are saved automatically and can be reviewed in the 'My Notes' section.",
  },
  {
    question: "How do I use the translation feature?",
    answer:
      "Enable word-level translation in the Settings page. Once enabled, you can tap on any word while reading to see its translation in your chosen language.",
  },
  {
    question: "Where can I find my saved notes?",
    answer:
      "All your notes are stored in the 'My Notes' section. You can organize them by book, subject, or date created.",
  },
]

// Mock data for known issues
const knownIssues = [
  {
    issue: "Text-to-speech not working on some Android devices",
    status: "Under investigation",
  },
  {
    issue: "Occasional delay in syncing notes across devices",
    status: "Fix in progress, expected in next update",
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [issue, setIssue] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", { name, email, issue, file })
    // In a real app, you would send this data to your backend
    alert("Thank you for your message. We'll get back to you soon!")
  }

  const handleBugReport = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Bug report submitted:", { name, email, issue, file })
    // In a real app, you would send this data to your backend
    alert("Thank you for reporting this issue. We'll investigate and update you soon.")
  }

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Support</h1>
      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="community">Community & Resources</TabsTrigger>
          <TabsTrigger value="bug">Report a Bug</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQ"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue">Describe your issue</Label>
                  <Textarea id="issue" value={issue} onChange={(e) => setIssue(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Attach a file (optional)</Label>
                  <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit">Submit</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>Get instant support from our team</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
              <MessageSquare className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-semibold">Coming Soon!</p>
              <p className="text-center text-muted-foreground">
                We're working on bringing you real-time support through live chat. In the meantime, please use our
                contact form or check the FAQ.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Community & Resources</CardTitle>
              <CardDescription>Learn from others and explore our guides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Discussion Forums</h3>
                <p className="mb-2">Join our community to discuss study tips, app features, and more:</p>
                <Link href="#" className="text-blue-600 hover:underline">
                  Visit Student Forums
                </Link>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Tutorials</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <Link href="#" className="text-blue-600 hover:underline">
                      How to use Text-to-Speech
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-blue-600 hover:underline">
                      Mastering Note-Taking
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-blue-600 hover:underline">
                      Getting the Most Out of Study Timers
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Help Articles</h3>
                <Link href="#" className="text-blue-600 hover:underline block">
                  Browse All Help Articles
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bug">
          <Card>
            <CardHeader>
              <CardTitle>Report a Bug</CardTitle>
              <CardDescription>Help us improve by reporting technical issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBugReport} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bug-name">Name</Label>
                  <Input id="bug-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bug-email">Email</Label>
                  <Input
                    id="bug-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bug-description">Describe the bug</Label>
                  <Textarea id="bug-description" value={issue} onChange={(e) => setIssue(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bug-file">Attach a screenshot (optional)</Label>
                  <Input
                    id="bug-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit">Submit Bug Report</Button>
              </form>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Known Issues</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {knownIssues.map((issue, index) => (
                    <li key={index}>
                      <span className="font-medium">{issue.issue}</span>
                      <br />
                      <span className="text-sm text-muted-foreground">Status: {issue.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

