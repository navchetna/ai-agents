import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat, useCompletion } from "ai/react";
import { Upload, X, Loader2 } from "lucide-react";

export default function AICoach() {
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
  } = useChat();

  const {
    completion,
    input: noteInput,
    handleInputChange: handleNoteInputChange,
    handleSubmit: handleNoteSubmit,
    isLoading: isNoteGenerating,
  } = useCompletion({
    api: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let imageData = null;
    if (image) {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });
      imageData = base64Image.split(",")[1]; // Remove the data URL prefix
    }

    const fullQuestion = `Subject: ${subject}

Question: ${input}`;
    handleSubmit(e, {
      options: {
        body: {
          image: imageData,
        },
      },
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
                    value={input}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1"
                    placeholder="Type your question here..."
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="image-upload">Upload Image (optional)</Label>
                  <div className="mt-1 flex items-center">
                    <Input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 inline-block mr-2" />
                      Upload Image
                    </Label>
                  </div>
                  {imagePreview && (
                    <div className="mt-2 relative">
                      {/* <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-w-xs rounded"
                      /> */}
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={isChatLoading}>
                  {isChatLoading ? (
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
            {messages.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle>
                    {m.role === "user" ? "You" : "AI Coach"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="note-generation">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Generate Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNoteSubmit}>
                <div className="mb-4">
                  <Label htmlFor="note-topic">Topic</Label>
                  <Input
                    type="text"
                    id="note-topic"
                    value={noteInput}
                    onChange={handleNoteInputChange}
                    className="mt-1"
                    placeholder="e.g., Photosynthesis, World War II, Quadratic Equations"
                  />
                </div>
                <Button type="submit" disabled={isNoteGenerating}>
                  {isNoteGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Notes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          {completion && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: completion }} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
