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
  Chip,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BoltIcon from '@mui/icons-material/Bolt';
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
  isPending?: boolean;
  isStreaming?: boolean;
}

interface ChatAreaProps {
  conversationId: string | null;
  onTogglePDFViewer: () => void;
  isPDFViewerOpen: boolean;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  onContextChange: (context: string) => void;
  onSelectConversation: (id: string) => void;
  onConversationUpdated?: () => void;
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
    name: 'AI Agents',
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
  onCollapseChange,
  onSelectConversation,
  onConversationUpdated
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayMessages = [...messages, ...localMessages];

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, streamedContent]);

  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
      loadConversation(conversationId);
      setShowWelcome(false);
      setLocalMessages([]);
    } else {
      setShowNewChatPrompt(true);
      setMessages([]);
      setShowWelcome(true);
      setCurrentConversationId(null);
      setLocalMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const response = await axios.get(`${CHAT_QNA_URL}/conversation/${id}?db_name=rag_db`);
      const data = response.data;
      console.log('Loaded conversation data:', data);
      
      if (!data.history || !Array.isArray(data.history) || data.history.length === 0) {
        console.warn('History is missing, empty, or not an array in conversation data', data);
        return;
      }
      
      const formattedMessages: Message[] = [];
      data.history.forEach((turn: any, index: number) => {
        if (turn.question) {
          const questionContent = typeof turn.question === 'string' 
            ? turn.question 
            : turn.question.content || '';
          
          const timestamp = turn.question.timestamp || 
                          turn.timestamp || 
                          new Date().toISOString();
          
          formattedMessages.push({
            id: `${timestamp}-user-${index}`,
            role: 'user',
            content: questionContent,
            timestamp: timestamp,
          });
        }
        
        if (turn.answer) {
          const answerContent = typeof turn.answer === 'string'
            ? turn.answer
            : turn.answer.content || '';
            
          const timestamp = turn.answer.timestamp || 
                          (Number(new Date(turn.timestamp || 0)) + 1).toString() || 
                          new Date().toISOString();
          
          formattedMessages.push({
            id: `${timestamp}-assistant-${index}`,
            role: 'assistant',
            content: answerContent,
            timestamp: timestamp,
            sources: turn.sources || turn.context || []
          });
        }
      });
  
      console.log('Formatted messages:', formattedMessages);
      
      if (formattedMessages.length > 0) {
        setMessages(formattedMessages);
      }
      
    } catch (error: unknown) {
      console.error('Error loading conversation:', error);
      let errorMessage = 'Error loading conversation data';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
      setShowErrorSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (topicName: string) => {
    onContextChange(topicName);
    const welcomeMessage = `You are now in ${topicName} context.`;
    setInput(welcomeMessage);
    handleSubmit(welcomeMessage);
  };

  const startNewConversation = async (userMessageContent: string) => {
    try {
      const response = await axios.post(`${CHAT_QNA_URL}/conversation/new?db_name=rag_db`)
      
      const data = await response.data;
      console.log('Created new conversation:', data);
      
      const newConversationId = data.conversation_id;
      setCurrentConversationId(newConversationId);
      onSelectConversation(newConversationId);
      
      if (onConversationUpdated) {
        onConversationUpdated();
      }
      
      await sendMessage(userMessageContent, newConversationId);
      
      return newConversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create a new conversation');
      setShowErrorSnackbar(true);
      setShowNewChatPrompt(true);
      
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.isPending ? { ...msg, isPending: false } : msg
        )
      );
      
      setIsLoading(false);
      return null;
    }
  };


  const sendMessage = async (messageContent: string, targetConversationId: string) => {
    if (streamingEnabled) {
      try {
        const streamingMessageId = Date.now().toString() + '-streaming';
        setStreamingMessageId(streamingMessageId);
        
        setLocalMessages(prev => [
          ...prev, 
          {
            id: streamingMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true
          }
        ]);
        
        setStreamedContent('');
        setIsLoading(true);
        
        console.log(`Sending streaming request to: ${CHAT_QNA_URL}/conversation/${targetConversationId}`);
        const response = await fetch(`${CHAT_QNA_URL}/conversation/${targetConversationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify({
            question: messageContent.trim(),
            max_tokens: 1024,
            temperature: 0.1,
            stream: true
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        if (!response.body) {
          throw new Error('ReadableStream not supported in this browser.');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream complete');
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          console.log('Received chunk:', chunk);
          
          let unprocessedBuffer = '';
          const lines = buffer.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith('data: ')) {
              const dataContent = line.substring(6).trim();
              
              if (dataContent === '[DONE]') {
                console.log('End of stream marker received');
                continue;
              }
              
              try {
                console.log('Processing data content:', dataContent);
                
                if (dataContent.startsWith("b'") && dataContent.endsWith("'")) {
                  const textContent = dataContent.substring(2, dataContent.length - 1);
                  console.log('Extracted text content from b\' format:', textContent);
                  
                  setStreamedContent(prev => {
                    const updatedContent = prev + textContent;
                    
                    setLocalMessages(messages => 
                      messages.map(msg => {
                        if (msg.id === streamingMessageId) {
                          return {
                            ...msg,
                            content: updatedContent
                          };
                        }
                        return msg;
                      })
                    );
                    
                    return updatedContent;
                  });
                } 
                else {
                  try {
                    const byteObj: unknown = JSON.parse(dataContent);
                    
                    let byteArray: number[];
                    if (Array.isArray(byteObj)) {
                      byteArray = byteObj as number[];
                    } else if (byteObj && typeof byteObj === 'object') {
                      byteArray = Object.values(byteObj as Record<string, number>);
                    } else {
                      console.warn('Unexpected data format:', byteObj);
                      byteArray = [];
                    }
                    
                    const textContent = new TextDecoder().decode(new Uint8Array(byteArray));
                    console.log('Decoded text content from JSON byte array:', textContent);
                    
                    setStreamedContent(prev => {
                      const updatedContent = prev + textContent;
                      
                      setLocalMessages(messages => 
                        messages.map(msg => {
                          if (msg.id === streamingMessageId) {
                            return {
                              ...msg,
                              content: updatedContent
                            };
                          }
                          return msg;
                        })
                      );
                      
                      return updatedContent;
                    });
                  } catch (jsonError) {
                    console.warn('Failed to parse as JSON:', jsonError);
                    
                    if (typeof dataContent === 'string' && 
                        !dataContent.startsWith('{') && 
                        !dataContent.startsWith('[') &&
                        dataContent.trim().length > 0) {
                      console.log('Using as plain text:', dataContent);
                      
                      setStreamedContent(prev => {
                        const updatedContent = prev + dataContent;
                        
                        setLocalMessages(messages => 
                          messages.map(msg => {
                            if (msg.id === streamingMessageId) {
                              return {
                                ...msg,
                                content: updatedContent
                              };
                            }
                            return msg;
                          })
                        );
                        
                        return updatedContent;
                      });
                    }
                  }
                }
              } catch (e) {
                console.error('Error processing streaming data:', e, dataContent);
              }
            } else if (line !== '') {
              unprocessedBuffer += line + '\n';
            }
          }
          
          buffer = unprocessedBuffer;
        }
        
        setLocalMessages(prev => 
          prev.map(msg => {
            if (msg.id === streamingMessageId) {
              return {
                ...msg,
                isStreaming: false,
                isPending: false
              };
            }
            return msg;
          })
        );
        
        setStreamingMessageId(null);
        setIsLoading(false);
        
        if (currentConversationId) {
          setTimeout(() => {
            loadConversation(currentConversationId as string);
          }, 1000);
        }
        
        if (onConversationUpdated) {
          onConversationUpdated();
        }
        
      } catch (error) {
        console.error('Streaming error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to stream response');
        setShowErrorSnackbar(true);
        
        if (streamingMessageId) {
          setLocalMessages(prev => 
            prev.map(msg => {
              if (msg.id === streamingMessageId) {
                return {
                  ...msg,
                  content: 'Sorry, there was an error streaming the response.',
                  isStreaming: false,
                  isPending: false
                };
              }
              return msg;
            })
          );
        }
        
        setStreamingMessageId(null);
        setIsLoading(false);
      }
    }
    else {
      try {
        
        const response = await axios.post(`${CHAT_QNA_URL}/conversation/${targetConversationId}`, {
          question: messageContent.trim(),
          max_tokens: 1024,
          temperature: 0.1,
          stream: false
        });

        const data = await response.data;
        console.log('Received non-streaming response:', data);
        
        if (targetConversationId) {
          await loadConversation(targetConversationId);
          setLocalMessages([]);
        }
        
        if (onConversationUpdated) {
          onConversationUpdated();
        }
        
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to get response');
        setShowErrorSnackbar(true);
        
        setLocalMessages(prev => {
          const errorAssistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your request. Please try again or start a new conversation.',
            timestamp: new Date().toISOString(),
          };
          
          return [...prev, errorAssistantMessage];
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | string) => {
    if (typeof e !== 'string' && e?.preventDefault) {
      e.preventDefault();
    }
    
    const messageContent = typeof e === 'string' ? e : input;
    if (!messageContent.trim() || isLoading) return;
  
    setShowWelcome(false);
    setErrorMessage(null);
    
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString(),
      isPending: false
    };
    
    setLocalMessages(prev => [...prev, userMessage]);
    setInput('');
    
    setIsLoading(true);
  
    try {
      if (currentConversationId) {
        await sendMessage(messageContent.trim(), currentConversationId);
      } else {
        setShowNewChatPrompt(false);
        await startNewConversation(messageContent.trim());
      }
    } catch (error) {
      console.error("Failed to handle submission:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message');
      setShowErrorSnackbar(true);
      setIsLoading(false);
    }
  };

  const handleQualityChange = (messageId: string, newQuality: 'good' | 'bad') => {
    const isLocal = localMessages.some(msg => msg.id === messageId);
    
    if (isLocal) {
      setLocalMessages(prevMessages =>
        prevMessages.map(message =>
          message.id === messageId
            ? { ...message, quality: newQuality }
            : message
        )
      );
    } else {
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.id === messageId
            ? { ...message, quality: newQuality }
            : message
        )
      );
    }
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
    try {
      return new Date(timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const toggleStreaming = () => {
    setStreamingEnabled(!streamingEnabled);
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

      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowErrorSnackbar(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

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
        {/* <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            p: 1,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            zIndex: 5,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={streamingEnabled}
                onChange={toggleStreaming}
                color="primary"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BoltIcon fontSize="small" color={streamingEnabled ? "primary" : "action"} />
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  Streaming Mode
                </Typography>
              </Box>
            }
          />
        </Box> */}

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            px: { xs: 2, sm: 4 },
            pt: 4,
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
          {errorMessage && !showWelcome && displayMessages.length === 0 && (
            <Fade in>
              <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ErrorOutlineIcon sx={{ fontSize: 48, color: '#d32f2f', mb: 2 }} />
                <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                  Something went wrong
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                  We couldn't load the conversation data. You can try again or start a new chat.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onSelectConversation('')}
                  sx={{ mt: 2 }}
                >
                  Start New Chat
                </Button>
              </Box>
            </Fade>
          )}
          
          {showWelcome && !currentConversationId && displayMessages.length === 0 ? (
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
              {displayMessages.map((message) => (
                <Fade in key={message.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      opacity: message.isPending ? 0.7 : 1,
                    }}
                  >
                    {message.role === 'user' ? (
                      <AccountCircleIcon
                        sx={{
                          fontSize: 32,
                          color: '#0071C5',
                          alignSelf: 'flex-start',
                          mt: 2
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
                          backgroundColor: message.role === 'user' ? '#0071C5' : '#f8f9fa',
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

                          {message.isStreaming && message.id === streamingMessageId 
                            ? streamedContent
                            : message.content}
                          
                          {message.isStreaming && (
                            <span style={{ display: 'inline-block', width: '0.7em', height: '1em', verticalAlign: 'text-bottom' }}>
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  width: '3px',
                                  height: '1em',
                                  backgroundColor: '#0071C5',
                                  animation: 'blink 1s step-end infinite',
                                  '@keyframes blink': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0 }
                                  },
                                }}
                              />
                            </span>
                          )}

                        </Typography>

                        {message.role === 'assistant' && !message.isStreaming && (
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
                        
                        {copyPopup.open && copyPopup.messageId === message.id && (
                          <Fade in>
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                marginBottom: '4px',
                              }}
                            >
                              Copied!
                            </Box>
                          </Fade>
                        )}
                      </Box>

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
              {isLoading && !streamingEnabled && !streamingMessageId && (
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