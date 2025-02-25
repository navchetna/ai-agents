import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Worker,
  Viewer,
  SpecialZoomLevel,
  type PdfJs,
} from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { highlightPlugin, Trigger } from "@react-pdf-viewer/highlight";
import { searchPlugin } from "@react-pdf-viewer/search";
import type {
  HighlightArea,
  RenderHighlightTargetProps,
} from "@react-pdf-viewer/highlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Scissors,
  Highlighter,
  StickyNote,
  Square,
  Search,
  MessageSquare,
  Send,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

type Note = {
  id: string;
  content: string;
  position: { pageIndex: number; boundingRect: HighlightArea };
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const PdfViewer: React.FC<{
  fileUrl: string | null;
  onError?: (error: Error) => void;
}> = ({ fileUrl, onError }) => {
  const { mode } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isTextFile, setIsTextFile] = useState(false);
  const viewerRef = useRef<PdfJs.PdfJsWrapper | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileUrl) {
      if (fileUrl.endsWith(".txt")) {
        setIsTextFile(true);
        fetch(fileUrl)
          .then((response) => response.text())
          .then((text) => setTextContent(text))
          .catch((error) => {
            console.error("Error fetching text file:", error);
            if (onError) {
              onError(error);
            }
          });
      } else {
        setIsTextFile(false);
        setTextContent(null);
      }
    } else {
      setIsTextFile(false);
      setTextContent(null);
    }
  }, [fileUrl, onError]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatScrollRef]); //Corrected dependency

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnail tab
      defaultTabs[1], // Bookmark tab
    ],
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            Download,
            EnterFullScreen,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            Print,
            ZoomIn,
            ZoomOut,
          } = slots;
          return (
            <div
              style={{
                alignItems: "center",
                display: "flex",
                width: "100%",
                backgroundColor: mode === "light" ? "#E6F4FE" : "#1A1E27",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              <div style={{ padding: "0px 2px" }}>
                <GoToPreviousPage />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <CurrentPageInput />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <NumberOfPages />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <GoToNextPage />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <ZoomOut />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <ZoomIn />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <EnterFullScreen />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <Download />
              </div>
              <div style={{ padding: "0px 2px" }}>
                <Print />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  const renderHighlightTarget = (props: RenderHighlightTargetProps) => (
    <div
      style={{
        background: "#eee",
        display: "flex",
        position: "absolute",
        left: `${props.selectionRegion.left}%`,
        top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
        transform: "translate(0, 8px)",
        zIndex: 1,
      }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Add note
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Textarea
            placeholder="Add your note here"
            onBlur={(e) => {
              const note: Note = {
                id: `note-${Date.now()}`,
                content: e.target.value,
                position: {
                  pageIndex: props.selectedText.pageIndex,
                  boundingRect: props.selectedText.boundingRect,
                },
              };
              setNotes([...notes, note]);
              props.onConfirm();
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderHighlightContent = ({ annotation }: { annotation: Note }) => (
    <div
      style={{
        background: "#fffe82",
        padding: "8px",
        position: "absolute",
        left: `${annotation.position.boundingRect.left}%`,
        top: `${annotation.position.boundingRect.top}%`,
        width: `${annotation.position.boundingRect.width}%`,
        height: `${annotation.position.boundingRect.height}%`,
        zIndex: 1,
      }}
    >
      {annotation.content}
    </div>
  );

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
    renderHighlightContent,
    trigger: Trigger.TextSelection,
    highlightColor: (props) => (mode === "light" ? "yellow" : "#FFA500"),
  });

  const searchPluginInstance = searchPlugin();

  const handleToolClick = useCallback((tool: string) => {
    setCurrentTool((prevTool) => (prevTool === tool ? null : tool));
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    // Here you would typically call your AI service
    // For demonstration, we'll just echo the message
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: `AI: ${chatInput}`,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleClip = useCallback(() => {
    if (viewerRef.current) {
      const viewer = viewerRef.current;
      const canvas = viewer.getPageCanvas(viewer.getCurrentPageIndex());
      if (canvas) {
        const dataUrl = canvas.toDataURL();
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "clipped-page.png";
        link.click();
      }
    }
  }, []);

  return (
    <div
      className="flex h-full"
      style={{ backgroundColor: mode === "light" ? "#E6F4FE" : "#13151C" }}
    >
      {/* Tool Section (Mid Left) */}
      <div
        className="w-16 flex flex-col items-center justify-center space-y-4 absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
        style={{
          backgroundColor:
            mode === "light"
              ? "rgba(230, 244, 254, 0.8)"
              : "rgba(26, 30, 39, 0.8)",
        }}
      >
        <Button
          variant={currentTool === "clip" ? "default" : "outline"}
          size="icon"
          onClick={() => {
            handleToolClick("clip");
            handleClip();
          }}
        >
          <Scissors className="h-4 w-4" />
        </Button>
        <Button
          variant={currentTool === "highlight" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("highlight")}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          variant={currentTool === "sticky" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("sticky")}
        >
          <StickyNote className="h-4 w-4" />
        </Button>
        <Button
          variant={currentTool === "rectangle" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("rectangle")}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={currentTool === "search" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("search")}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content (Center) */}
      <div className="flex-grow overflow-auto relative">
        {isTextFile && textContent ? (
          <div
            className="h-full overflow-auto p-4"
            style={{
              backgroundColor: mode === "light" ? "#E6F4FE" : "#13151C",
            }}
          >
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
              <pre
                className="whitespace-pre-wrap font-serif text-lg leading-relaxed p-8"
                style={{ color: mode === "light" ? "#333" : "#CCC" }}
              >
                {textContent}
              </pre>
            </div>
          </div>
        ) : fileUrl && !isTextFile ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div
              className="h-full"
              style={{
                backgroundColor: mode === "light" ? "#E6F4FE" : "#13151C",
              }}
            >
              <Viewer
                fileUrl={fileUrl}
                plugins={[
                  defaultLayoutPluginInstance,
                  highlightPluginInstance,
                  searchPluginInstance,
                ]}
                ref={viewerRef}
                onError={(error) => {
                  console.error("Error loading PDF:", error);
                  if (onError) {
                    onError(error);
                  }
                }}
                defaultScale={SpecialZoomLevel.PageFit}
                theme={mode === "light" ? "light" : "dark"}
                styles={{
                  viewer: {
                    backgroundColor: mode === "light" ? "#E6F4FE" : "#13151C",
                  },
                  pageContainer: {
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow:
                      mode === "light"
                        ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                        : "0 4px 6px rgba(255, 255, 255, 0.1)",
                  },
                }}
              />
            </div>
          </Worker>
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{
              backgroundColor: mode === "light" ? "#E6F4FE" : "#13151C",
            }}
          >
            <p>No file selected</p>
          </div>
        )}
      </div>

      {/* AI Chatbot (Right) */}
      <div
        className="w-80 flex flex-col"
        style={{ backgroundColor: mode === "light" ? "#E6F4FE" : "#1A1E27" }}
      >
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <ScrollArea className="flex-grow mb-4" ref={chatScrollRef}>
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-100 ml-4"
                      : "bg-gray-200 mr-4"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </ScrollArea>
            <form onSubmit={handleChatSubmit} className="flex items-center">
              <Input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow mr-2"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PdfViewer;
