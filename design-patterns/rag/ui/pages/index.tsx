'use client';

import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { Box } from '@mui/material';
import Navbar from '@/components/Navbar';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import ChatArea from '@/components/ChatArea';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: '/placeholder.svg',
};

export default function Home() {
  const [currentContext, setCurrentContext] = useState<string>('General');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { messages, isLoading, error } = useChat();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);

  const handleTogglePDFViewer = () => {
    setIsPDFViewerOpen(!isPDFViewerOpen);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const leftSidebarWidth = isSidebarCollapsed ? 60 : 300;
  const rightSidebarWidth = 76;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={mockUser} />
      <Box 
        sx={{ 
          backgroundColor: 'aliceblue',
          display: 'flex', 
          flexGrow: 1, 
          pt: '64px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <LeftSidebar
          onSelectConversation={setSelectedConversation}
          selectedConversation={selectedConversation}
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={handleSidebarCollapse}
        />
        <Box
          component="main"
          sx={{ 
            position: 'fixed',
            left: leftSidebarWidth,
            right: rightSidebarWidth,
            top: '64px',
            bottom: 0,
            transition: 'left 0.3s ease-in-out',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '800px',
              mx: 'auto',
              position: 'relative',
            }}
          >
            <ChatArea
              conversationId={selectedConversation}
              onTogglePDFViewer={handleTogglePDFViewer}
              isPDFViewerOpen={isPDFViewerOpen}
              isCollapsed={isSidebarCollapsed}
              onCollapseChange={handleSidebarCollapse}
              onContextChange={setCurrentContext}
            />
          </Box>
        </Box>
        <RightSidebar
          messages={messages}
          currentContext={selectedConversation || ''}
          onContextChange={setSelectedConversation}
          onTogglePDFViewer={handleTogglePDFViewer}
          isPDFViewerOpen={isPDFViewerOpen}
        />
      </Box>
    </Box>
  );
}