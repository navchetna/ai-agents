import type React from "react";

import { useState } from "react";
import { Button } from "@/components/button";
import { Textarea } from "@/components/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { BACKEND_URL, DB_NAME } from "@/lib/utils";

export default function AICoach() {
  const [subject, setSubject] = useState("");
  const [conversation, setConversation] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let url = BACKEND_URL;
    let createConversationURL = url + "/api/conversations/new";
    setLoading(true);
    axios
      .post(createConversationURL, {
        db_name: DB_NAME,
      })
      .then((resp) => {
        type conversationI = {
          conversation_id: string;
        };
        let conversation = resp.data as conversationI;
        let id = conversation.conversation_id;
        let conversationURL = url + `/api/conversations/${id}`;
        axios
          .post(conversationURL, {
            db_name: DB_NAME,
            question: question,
          })
          .then((resp) => {
            type conversationResponseI = {
              conversation_id: string;
              answer: string;
              sources: string[];
            };
            setLoading(false);
            let conversationResponse = resp.data as conversationResponseI;
            setMessage(conversationResponse.answer);
          })
          .catch((err) => {
            setLoading(false);
            console.error(err);
          });
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Coach</h1>
      <Tabs defaultValue="doubt-solving">
        <TabsList className="mb-4">
          <TabsTrigger value="doubt-solving">Doubt Solving</TabsTrigger>
          <TabsTrigger value="note-generation">Note Generation</TabsTrigger>
        </TabsList>
        <TabsContent value="doubt-solving">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Ask Your Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuestionSubmit}>
                <div className="mb-4">
                  <Label htmlFor="conversation">Conversation Name</Label>
                  <Input
                    type="text"
                    id="converstation"
                    value={conversation}
                    onChange={(e) => setConversation(e.target.value)}
                    className="mt-1"
                    placeholder="Chemistry Notes"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., Mathematics, Physics, History"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={4}
                    className="mt-1"
                    placeholder="Type your question here..."
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Ask AI Coach"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {
              <Card>
                <CardHeader>
                  <CardTitle>AI Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{message}</p>
                </CardContent>
              </Card>
            }
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
