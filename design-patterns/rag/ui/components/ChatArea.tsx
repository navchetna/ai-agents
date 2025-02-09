import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  Tooltip, 
  CircularProgress, 
  ToggleButtonGroup, 
  ToggleButton, 
  Collapse,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PanToolIcon from '@mui/icons-material/PanTool';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { API_BASE_URL } from '@/lib/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quality?: 'good' | 'bad' | 'ok';
  isPinned?: boolean;
  sources?: Array<{
    source: string;
    relevance_score: number;
    content: string;
  }>;
}

interface ChatAreaProps {
  conversationId: string | null;
  onTogglePDFViewer: () => void;
  isPDFViewerOpen: boolean;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

export default function ChatArea({
  conversationId: initialConversationId,
  onTogglePDFViewer,
  isPDFViewerOpen,
  isCollapsed,
  onCollapseChange
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReferences, setShowReferences] = useState<{ [key: string]: boolean }>({});
  const [copyPopup, setCopyPopup] = useState<{ open: boolean; messageId: string | null }>({ 
    open: false, 
    messageId: null 
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialConversationId);
  const [showNewChatPrompt, setShowNewChatPrompt] = useState(false);

  useEffect(() => {
    if (initialConversationId) {
      setCurrentConversationId(initialConversationId);
      loadConversation(initialConversationId);
    } else {
      setShowNewChatPrompt(true);
      setMessages([]);
    }
  }, [initialConversationId]);

  const startNewConversation = async () => {
    setIsLoading(true);
    setShowNewChatPrompt(false);
    try {
      const response = await fetch(`${API_BASE_URL}/conversation/new`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      const data = await response.json();
      setCurrentConversationId(data.conversation_id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating new conversation:', error);
      setShowNewChatPrompt(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/conversation/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      
      const formattedMessages = data.history.flatMap((turn: any) => [
        {
          id: `${turn.question.timestamp}-user`,
          role: 'user',
          content: turn.question.content,
          timestamp: turn.question.timestamp,
          isPinned: false
        },
        {
          id: `${turn.answer.timestamp}-assistant`,
          role: 'assistant',
          content: turn.answer.content,
          timestamp: turn.answer.timestamp,
          sources: turn.context
        }
      ]);
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!currentConversationId) {
      await startNewConversation();
      if (!currentConversationId) return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      isPinned: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${currentConversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input.trim(),
          max_tokens: 1024,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityChange = (messageId: string, newQuality: 'good' | 'bad' | 'ok' | null) => {
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.id === messageId
          ? { ...message, quality: newQuality as 'good' | 'bad' | 'ok' }
          : message
      )
    );
  };

  const handlePinToggle = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.id === messageId
          ? { ...message, isPinned: !message.isPinned }
          : message
      )
    );
  };

  const toggleReferences = (messageId: string) => {
    setShowReferences(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleCopyContent = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyPopup({ open: true, messageId });
      setTimeout(() => setCopyPopup({ open: false, messageId: null }), 2000);
    }).catch(err => {
      console.error('Failed to copy content:', err);
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
    }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        height: '100%',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          mb: 2,
          backgroundColor: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          p: 3,
          maxWidth: '1000px',
          mx: 'auto',
        }}>
          {showNewChatPrompt ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              textAlign: 'center',
              p: 3
            }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Welcome! Start a new conversation to begin.
              </Typography>
              <Button
                variant="contained"
                onClick={startNewConversation}
                sx={{
                  backgroundColor: '#E4D96F',
                  color: 'grey',
                  '&:hover': {
                    backgroundColor: '#D6CB61',
                  },
                }}
              >
                Start New Chat
              </Button>
            </Box>
          ) : (
            <>
              {messages.map((message) => (
                <Paper 
                  key={message.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    position: 'relative',
                    backgroundColor: message.role === 'assistant' ? '#f8f9fa' : '#ffffff'
                  }} 
                  elevation={1}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ mb: 1, color: 'text.secondary' }}
                      >
                        {message.role === 'user' ? 'You' : 'Assistant'} • {formatTimestamp(message.timestamp)}
                      </Typography>
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 2 }}>
                      {message.role === 'assistant' && (
                        <Tooltip title="Copy response">
                          <IconButton
                            onClick={() => handleCopyContent(message.content, message.id)}
                            size="small"
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {message.role === 'user' && (
                        <IconButton
                          onClick={() => handlePinToggle(message.id)}
                          size="small"
                          color={message.isPinned ? 'primary' : 'default'}
                        >
                          {message.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {message.role === 'assistant' && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ToggleButtonGroup
                          value={message.quality}
                          exclusive
                          onChange={(_, newQuality) => handleQualityChange(message.id, newQuality)}
                          size="small"
                        >
                          <ToggleButton value="good">
                            <Tooltip title="Good">
                              <ThumbUpIcon fontSize="small" />
                            </Tooltip>
                          </ToggleButton>
                          <ToggleButton value="ok">
                            <Tooltip title="Okay">
                              <PanToolIcon fontSize="small" />
                            </Tooltip>
                          </ToggleButton>
                          <ToggleButton value="bad">
                            <Tooltip title="Bad">
                              <ThumbDownIcon fontSize="small" />
                            </Tooltip>
                          </ToggleButton>
                        </ToggleButtonGroup>
                        
                        {message.sources && message.sources.length > 0 && (
                          <Tooltip title="Show Sources">
                            <IconButton
                              onClick={() => toggleReferences(message.id)}
                              size="small"
                            >
                              <DescriptionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>

                      <Collapse in={showReferences[message.id]}>
                        <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Sources:
                          </Typography>
                          {message.sources?.map((source, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="primary">
                                {source.source} (Score: {source.relevance_score.toFixed(2)})
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {source.content}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  )}

                  {copyPopup.open && copyPopup.messageId === message.id && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: '#686868',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        zIndex: 9999,
                      }}
                    >
                      Copied!
                    </Box>
                  )}
                </Paper>
              ))}

              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}
        </Box>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            position: 'fixed',
            bottom: 0,
            left: isCollapsed ? '100px' : '500px',
            right: 0,
            transition: 'left 0.3s ease-in-out',
            p: 3,
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: 2,
            maxWidth: '1000px',
            mx: 'auto',
            zIndex: 1100,
          }}
        >
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Please wait..." : "Type your message..."}
            variant="outlined"
            disabled={isLoading}
            multiline
            maxRows={4}
            fullWidth
            sx={{
              backgroundColor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: '#BDBDBD',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#9E9E9E',
                },
              },
            }}
          />
          <Tooltip title="Send" arrow>
            <IconButton
              type="submit"
              disabled={isLoading || !input.trim()}
              sx={{
                backgroundColor: '#E4D96F',
                color: 'grey',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: '#D6CB61',
                },
                '&:disabled': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}