"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "ai/react";
import { Box, Container } from "@mui/material";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import ChatArea from "@/components/ChatArea";
import StatusBar from "@/components/StatusBar";

const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatarUrl: "/placeholder.svg",
};

export default function Home() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const { messages, isLoading, error } = useChat();

  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [latency, setLatency] = useState(0);
  const [responseMetrics, setResponseMetrics] = useState({
    good: 0,
    bad: 0,
    ok: 0,
  });
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);

  useEffect(() => {
    let startTime: number;
    let tokenCount = 0;

    const updateMetrics = () => {
      const currentTime = performance.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds

      setTokensPerSecond(tokenCount / elapsedTime);
      setLatency(elapsedTime * 1000); // Convert to ms

      // This is a placeholder logic for response metrics.
      setResponseMetrics((prevMetrics) => ({
        good: prevMetrics.good + 1,
        bad: prevMetrics.bad,
        ok: prevMetrics.ok,
      }));
    };

    if (isLoading) {
      startTime = performance.now();
      tokenCount = 0;
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      tokenCount = lastMessage.content.split(" ").length; // Simple token count estimation
      updateMetrics();
    }

    // Calculate input and output tokens
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    messages.forEach((message) => {
      if (message.role === "user") {
        totalInputTokens += message.content.split(" ").length;
      } else if (message.role === "assistant") {
        totalOutputTokens += message.content.split(" ").length;
      }
    });
    setInputTokens(totalInputTokens);
    setOutputTokens(totalOutputTokens);
  }, [isLoading, messages]);

  const handleTogglePDFViewer = () => {
    setIsPDFViewerOpen(!isPDFViewerOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar user={mockUser} />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <LeftSidebar
          onSelectConversation={setSelectedConversation}
          selectedConversation={selectedConversation}
        />
        <Box
          component="main"
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <ChatArea
            conversationId={selectedConversation}
            onTogglePDFViewer={handleTogglePDFViewer}
            isPDFViewerOpen={isPDFViewerOpen}
          />
        </Box>
        <RightSidebar
          messages={messages}
          currentContext={selectedConversation || ""}
          onContextChange={setSelectedConversation}
          onTogglePDFViewer={handleTogglePDFViewer}
          isPDFViewerOpen={isPDFViewerOpen}
        />
      </Box>
      <StatusBar
        tokensPerSecond={tokensPerSecond}
        latency={latency}
        responseMetrics={responseMetrics}
        inputTokens={inputTokens}
        outputTokens={outputTokens}
      />
    </Box>
  );
}
