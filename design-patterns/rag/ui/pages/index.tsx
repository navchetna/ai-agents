'use client';

import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { Box } from '@mui/material';
import Navbar from '@/components/Navbar';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import ChatArea from '@/components/ChatArea';
import SearchLanding from '@/components/SearchLanding';
import SearchResults from '@/components/SearchResults';
import { ApiType } from '@/types/api';

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
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [selectedApi, setSelectedApi] = useState<ApiType>("semantic_scholar");
  const [searchQuery, setSearchQuery] = useState<string>("");


  const handleTogglePDFViewer = () => {
    setIsPDFViewerOpen(!isPDFViewerOpen);
  };

  const handleToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchResults(null);
    }
  };

  const handleSearch = (results: any[], api: ApiType, query: string) => {
    setSearchResults(results);
    setSelectedApi(api);
    setSearchQuery(query);
    setIsSearchOpen(true);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleConversationUpdated = () => {
    setRefreshCounter(prev => prev + 1);
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
        {!isSearchOpen && (
          <LeftSidebar
          onSelectConversation={setSelectedConversation}
          selectedConversation={selectedConversation}
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={handleSidebarCollapse}
          refreshTrigger={refreshCounter}
        />
      )}
        <Box
          component="main"
          sx={{
            position: 'fixed',
            left: isSearchOpen ? 0 : leftSidebarWidth,
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
              maxWidth: '1700px',
              mx: 'auto',
              position: 'relative',
            }}
          >
            {isSearchOpen ? (
              searchResults ? (
                <SearchResults 
                  results={searchResults} 
                  api={selectedApi}
                  query={searchQuery}
                  onSearch={handleSearch}
                />
              ) : (
                <SearchLanding onSearch={handleSearch} />
              )
            ) : (
              <ChatArea
              conversationId={selectedConversation}
              onTogglePDFViewer={handleTogglePDFViewer}
              isPDFViewerOpen={isPDFViewerOpen}
              isCollapsed={isSidebarCollapsed}
              onCollapseChange={handleSidebarCollapse}
              onContextChange={setCurrentContext}
              onSelectConversation={setSelectedConversation}
              onConversationUpdated={handleConversationUpdated}
            />
            )}
          </Box>
        </Box>
        <RightSidebar
          messages={messages}
          currentContext={selectedConversation || ''}
          onContextChange={setSelectedConversation}
          onTogglePDFViewer={handleTogglePDFViewer}
          isPDFViewerOpen={isPDFViewerOpen}
          onToggleSearch={handleToggleSearch}
          isSearchOpen={isSearchOpen}
        />
      </Box>
    </Box>
  );
}