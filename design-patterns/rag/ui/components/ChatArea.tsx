import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
  Button,
  Collapse,
  Fade,
  Paper,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { CHAT_QNA_URL } from '@/lib/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quality?: 'good' | 'bad';
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
  onContextChange: (context: string) => void;
}

import SecurityIcon from '@mui/icons-material/Security';
import BiotechIcon from '@mui/icons-material/Biotech';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MemoryIcon from '@mui/icons-material/Memory';
import CloudIcon from '@mui/icons-material/Cloud';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

export const topics = [
  {
    name: 'Cybersecurity',
    icon: <SecurityIcon />,
    color: '#e91e63'
  },
  {
    name: 'Biotechnology',
    icon: <BiotechIcon />,
    color: '#4caf50'
  },
  {
    name: 'Neurology',
    icon: <PsychologyIcon />,
    color: '#ff9800'
  },
  {
    name: 'Artificial Intelligence',
    icon: <MemoryIcon />,
    color: '#2196f3'
  },
  {
    name: 'Cloud Computing',
    icon: <CloudIcon />,
    color: '#03a9f4'
  },
  {
    name: 'Robotics',
    icon: <PrecisionManufacturingIcon />,
    color: '#9c27b0'
  }
];

export default function ChatArea({
  conversationId,
  onTogglePDFViewer,
  isPDFViewerOpen,
  isCollapsed,
  onContextChange,
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [showNewChatPrompt, setShowNewChatPrompt] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
      loadConversation(conversationId);
      setShowWelcome(false);
    } else {
      setShowNewChatPrompt(true);
      setMessages([]);
      setShowWelcome(true);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${CHAT_QNA_URL}/conversation/${id}`);
      if (!response.ok) throw new Error('Failed to load conversation');

      const data = await response.json();
      const formattedMessages = data.history.flatMap((turn: any) => [
        {
          id: `${turn.question.timestamp}-user`,
          role: 'user',
          content: turn.question.content,
          timestamp: turn.question.timestamp,
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

  const handleTopicSelect = (topicName: string) => {
    onContextChange(topicName);
    const welcomeMessage = `You are now in ${topicName} context. How can I help you?`;
    setInput(welcomeMessage);
    handleSubmit(welcomeMessage);
  };

  const startNewConversation = async () => {
    setIsLoading(true);
    setShowNewChatPrompt(false);
    try {
      const response = await fetch(`${CHAT_QNA_URL}/conversation/new`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      const data = await response.json();
      setCurrentConversationId(data.conversation_id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      setShowNewChatPrompt(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | string) => {
    if (typeof e !== 'string' && e?.preventDefault) {
      e.preventDefault();
    }
    const messageContent = typeof e === 'string' ? e : input;

    if (!messageContent.trim() || isLoading) return;

    setShowWelcome(false);

    if (!currentConversationId) {
      await startNewConversation();
      if (!currentConversationId) return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${CHAT_QNA_URL}/conversation/${currentConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageContent.trim(),
          max_tokens: 1024,
          temperature: 0.1
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

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

  const handleQualityChange = (messageId: string, newQuality: 'good' | 'bad') => {
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.id === messageId
          ? { ...message, quality: newQuality }
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
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    handleSubmit(prompt);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: '#0071C5',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#ffffff',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1000px',
          width: '100%',
          mx: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            px: { xs: 2, sm: 4 },
            pt: 4, // Added 32px of space at the top
            pb: 2,
            gap: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#bbb',
              borderRadius: '4px',
              '&:hover': {
                background: '#999',
              },
            },
            paddingBottom: '100px'
          }}
        >
          {showWelcome ? (
            <Fade in>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '60vh',
                  gap: 3,
                  textAlign: 'center',
                  p: 2
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 48, color: '#0071C5' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                  Select a Topic to Begin
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 460, mb: 4 }}>
                  Choose your area of interest:
                </Typography>

                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  justifyContent: 'center',
                  maxWidth: 600,
                  mx: 'auto'
                }}>
                  {topics.map((topic) => (
                    <Chip
                      key={topic.name}
                      icon={topic.icon}
                      label={topic.name}
                      onClick={() => handleTopicSelect(topic.name)}
                      sx={{
                        bgcolor: `${topic.color}15`,
                        color: topic.color,
                        border: `1px solid ${topic.color}30`,
                        p: 2,
                        fontSize: '1rem',
                        '& .MuiChip-icon': {
                          color: topic.color
                        },
                        '&:hover': {
                          bgcolor: `${topic.color}25`,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Fade>
          ) : (
            <>
              {messages.map((message) => (
                <Fade in key={message.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                    }}
                  >
                    {message.role === 'user' ? (
                      <AccountCircleIcon
                        sx={{
                          fontSize: 32,
                          color: '#00C7FD',
                          alignSelf: 'flex-start',
                          mt: 2  // Added margin top to align with the message padding
                        }}
                      />
                    ) : (
                      <AutoAwesomeIcon
                        sx={{
                          fontSize: 32,
                          color: '#0071C5',
                          alignSelf: 'flex-start',
                          mt: 2
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        width: '95%',
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: message.role === 'user' ? '#00C7FD' : '#f8f9fa',
                          borderRadius: 2,
                          p: 2,
                          maxWidth: '100%',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          position: 'relative',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: message.role === 'user' ? '#ffffff' : '#2c2c2c',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {message.content}
                        </Typography>

                        {message.role === 'assistant' && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                            <Tooltip title="Copy response">
                              <IconButton
                                onClick={() => handleCopyContent(message.content, message.id)}
                                size="small"
                                sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Helpful">
                                <IconButton
                                  size="small"
                                  onClick={() => handleQualityChange(message.id, 'good')}
                                  sx={{
                                    opacity: message.quality === 'good' ? 1 : 0.6,
                                    '&:hover': { opacity: 1 },
                                    color: message.quality === 'good' ? '#2e7d32' : 'inherit',
                                  }}
                                >
                                  <ThumbUpIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Not helpful">
                                <IconButton
                                  size="small"
                                  onClick={() => handleQualityChange(message.id, 'bad')}
                                  sx={{
                                    opacity: message.quality === 'bad' ? 1 : 0.6,
                                    '&:hover': { opacity: 1 },
                                    color: message.quality === 'bad' ? '#d32f2f' : 'inherit',
                                  }}
                                >
                                  <ThumbDownIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            {message.sources && message.sources.length > 0 && (
                              <Tooltip title="View sources">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleReferences(message.id)}
                                  sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                                >
                                  <DescriptionIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </Box>

                      <Typography
                        variant="caption"
                        sx={{
                          color: '#666',
                          mt: 1,
                          ml: 2,
                        }}
                      >
                        {formatTimestamp(message.timestamp)}
                      </Typography>

                      {message.role === 'assistant' && message.sources && (
                        <Collapse in={showReferences[message.id]} sx={{ mt: 1, maxWidth: '100%' }}>
                          <Box
                            sx={{
                              backgroundColor: '#f8f9fa',
                              borderRadius: 2,
                              p: 2,
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#2c2c2c' }}>
                              Sources
                            </Typography>
                            {message.sources?.map((source, index) => (
                              <Box key={index} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    color: '#1976d2',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    mb: 0.5
                                  }}
                                >
                                  {source.source} (Score: {source.relevance_score.toFixed(2)})
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#666',
                                    fontSize: '0.8rem',
                                    lineHeight: 1.4
                                  }}
                                >
                                  {source.content}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      )}
                    </Box>
                  </Box>
                </Fade>
              ))}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#0071C5' }} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            backgroundColor: '#ffffff',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            gap: 2,
            alignItems: 'flex-end',
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Please wait..." : "Type your message..."}
            variant="outlined"
            multiline
            maxRows={4}
            fullWidth
            disabled={isLoading}
            sx={{
              backgroundColor: '#ffffff',
              maxWidth: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.95rem',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0071C5',
                },
              },
            }}
          />
          <Tooltip title="Send message" arrow>
            <IconButton
              type="submit"
              disabled={isLoading || !input.trim()}
              sx={{
                backgroundColor: '#0071C5',
                color: 'white',
                width: 44,
                height: 44,
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: '#00C7FD',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'black',
                },
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