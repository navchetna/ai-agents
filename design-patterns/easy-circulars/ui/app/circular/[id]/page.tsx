"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send, ExternalLink, Bookmark } from "lucide-react"
import Link from "next/link"

// Enhanced mock data for circulars with more detailed content
const mockCirculars = [
  {
    id: 1,
    title: "Circular on Digital Payments",
    content: `This circular outlines comprehensive guidelines for digital payments in India, effective from June 1, 2023. Key points include:

1. Unified Payments Interface (UPI):
   - Increased transaction limits for UPI payments to Rs. 5 lakhs for specific merchant categories.
   - Mandatory implementation of UPI AutoPay for recurring payments up to Rs. 15,000.

2. Mobile Banking:
   - Enhanced security measures, including mandatory two-factor authentication for high-value transactions.
   - Standardization of mobile banking interfaces across all banks to improve user experience.

3. Internet Banking:
   - Implementation of AI-based fraud detection systems for real-time transaction monitoring.
   - Mandatory annual security audits for all internet banking platforms.

4. Customer Protection:
   - Introduction of a 'zero liability' policy for customers in cases of unauthorized electronic transactions.
   - Establishment of a 24/7 dedicated helpline for reporting and resolving digital payment issues.

5. Regulatory Compliance:
   - Quarterly reporting requirements for banks on digital transaction volumes, fraud cases, and resolution times.
   - Penalties for non-compliance with these guidelines, including fines up to Rs. 1 crore for severe violations.

Banks and financial institutions are required to implement these guidelines within 6 months from the date of this circular.`,
    references: [2, 3],
  },
  {
    id: 2,
    title: "Circular on KYC Norms",
    content: `This circular updates the Know Your Customer (KYC) norms for all regulated entities, effective from July 1, 2023. The key updates include:

1. Customer Due Diligence (CDD):
   - Introduction of risk-based KYC approach, categorizing customers into low, medium, and high-risk categories.
   - Mandatory video KYC for opening accounts of high-risk customers.

2. Periodic KYC Updates:
   - Annual KYC update for high-risk customers, biennial for medium-risk, and every five years for low-risk customers.
   - Simplified process for KYC updates of low-risk customers, allowing self-certification for address changes.

3. Officially Valid Documents (OVDs):
   - Expansion of OVD list to include Aadhaar, PAN, Passport, Driving License, and NREGA Job Card.
   - Introduction of e-KYC using Aadhaar-based biometric authentication.

4. Digital KYC:
   - Guidelines for accepting digital signatures and electronically verified documents.
   - Protocols for secure storage and retrieval of digital KYC records.

5. Beneficial Ownership:
   - Enhanced due diligence requirements for identifying beneficial owners of legal entities.
   - Mandatory declaration of beneficial ownership for all account openings.

6. Non-face-to-face Customer Onboarding:
   - Detailed procedures for remote customer onboarding, including additional verification steps.
   - Limits on transaction values for accounts opened through non-face-to-face channels.

All regulated entities must ensure compliance with these updated KYC norms within 3 months from the date of this circular.`,
    references: [3],
  },
  {
    id: 3,
    title: "Circular on Foreign Exchange Transactions",
    content: `This circular provides comprehensive regulations on foreign exchange transactions for both individuals and businesses, effective from August 1, 2023. Key provisions include:

1. Remittance Limits:
   - Increase in the Liberalised Remittance Scheme (LRS) limit to USD 300,000 per financial year for residents.
   - Special provisions for students studying abroad, allowing additional remittances for tuition and living expenses.

2. Documentation Requirements:
   - Simplified documentation for small-value forex transactions up to USD 10,000.
   - Introduction of a standardized forex transaction declaration form for all remittances above USD 10,000.

3. FEMA Compliance:
   - Updated guidelines on External Commercial Borrowings (ECBs), including new all-in-cost ceilings and minimum average maturities.
   - Revised norms for overseas direct investments by Indian entities, including enhanced reporting requirements.

4. Trade-Related Remittances:
   - Liberalization of import payment norms, allowing advance remittance up to USD 500,000 without bank guarantee.
   - Simplified procedures for export realizations, including extension of realization period to 12 months for certain sectors.

5. Forex Derivatives:
   - New guidelines on over-the-counter (OTC) forex derivatives, including mandatory central clearing for certain products.
   - Introduction of forex options on exchanges for retail participants, subject to position limits.

6. Non-Resident Accounts:
   - Revisions to the operation of NRE, NRO, and FCNR accounts, including interest rate liberalization for FCNR deposits.
   - New facilities for Non-Resident Indians (NRIs) to invest in Indian capital markets.

7. Reporting Requirements:
   - Enhanced reporting framework for banks on forex transactions, including daily reporting of large value transactions.
   - Quarterly compliance certification by bank boards on adherence to forex regulations.

All Authorized Dealer banks must ensure strict compliance with these regulations and update their internal policies accordingly.`,
    references: [1],
  },
  {
    id: 4,
    title: "Circular on Cybersecurity Framework",
    content: `This circular establishes a comprehensive cybersecurity framework for banks and financial institutions, to be implemented by December 31, 2023. The framework includes:

1. Governance:
   - Mandatory appointment of a Chief Information Security Officer (CISO) reporting directly to the CEO.
   - Establishment of a board-level IT Strategy Committee to oversee cybersecurity initiatives.

2. Network Security:
   - Implementation of Next-Generation Firewalls (NGFW) and Intrusion Prevention Systems (IPS) at all network boundaries.
   - Mandatory encryption of all data in transit and at rest, using industry-standard encryption algorithms.

3. Data Protection:
   - Implementation of Data Loss Prevention (DLP) solutions to prevent unauthorized data exfiltration.
   - Mandatory data classification and access controls based on the principle of least privilege.

4. Incident Response:
   - Development and regular testing of a Cyber Crisis Management Plan (CCMP).
   - Establishment of a 24/7 Security Operations Center (SOC) for real-time threat monitoring and response.

5. Vendor Risk Management:
   - Enhanced due diligence process for third-party vendors with access to bank systems or data.
   - Regular security assessments of critical vendors and cloud service providers.

6. Employee Training:
   - Mandatory annual cybersecurity awareness training for all employees.
   - Specialized training for IT and security personnel on emerging threats and mitigation techniques.

7. Regulatory Reporting:
   - Quarterly submission of cybersecurity preparedness indicators to the RBI.
   - Immediate reporting of all significant cybersecurity incidents within 6 hours of detection.

8. Penetration Testing and Vulnerability Assessment:
   - Mandatory quarterly vulnerability assessments and annual penetration testing of all critical systems.
   - Participation in industry-wide cyber drills conducted by the RBI.

9. Emerging Technologies:
   - Guidelines for secure adoption of cloud computing, artificial intelligence, and blockchain technologies.
   - Specific security controls for mobile banking applications and internet-facing services.

Banks and financial institutions must submit a board-approved implementation plan within 30 days from the date of this circular.`,
    references: [1, 2],
  },
]

interface Message {
  role: "user" | "bot"
  content: string
}

export default function CircularPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [circular, setCircular] = useState(mockCirculars.find((c) => c.id === id))
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [references, setReferences] = useState<typeof mockCirculars>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    const newCircular = mockCirculars.find((c) => c.id === id)
    if (newCircular) {
      setCircular(newCircular)
      setReferences(mockCirculars.filter((c) => newCircular.references.includes(c.id)))
      setMessages([])
    }
  }, [id])

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]")
    setIsBookmarked(bookmarks.includes(id))
  }, [id])

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]")
    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter((bookmarkId: number) => bookmarkId !== id)
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks))
    } else {
      bookmarks.push(id)
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
    }
    setIsBookmarked(!isBookmarked)
  }

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

  const handleReferenceClick = (refId: number) => {
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
            <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
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
              <ScrollArea className="h-[60vh]">
                <div className="whitespace-pre-wrap">{circular.content}</div>
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
                    key={ref.id}
                    className="bg-muted text-sm p-2 mb-2 rounded cursor-pointer hover:bg-muted/80"
                    onClick={() => handleReferenceClick(ref.id)}
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

