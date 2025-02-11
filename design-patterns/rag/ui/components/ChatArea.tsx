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
  Avatar,
  Fade
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { API_BASE_URL } from '@/lib/constants';

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
}

export default function ChatArea({
  conversationId,
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [showNewChatPrompt, setShowNewChatPrompt] = useState(false);
  
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
    } else {
      setShowNewChatPrompt(true);
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/conversation/${id}`);
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

  const startNewConversation = async () => {
    setIsLoading(true);
    setShowNewChatPrompt(false);
    try {
      const response = await fetch(`${API_BASE_URL}/conversation/new`, {
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
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${currentConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input.trim(),
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

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        pt: '64px',
        pb: '80px', // Add padding for input area
        pr: '76px', // Add padding for right sidebar
        backgroundColor: '#f5f5f5',
      }}
    >
      <Box 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          px: 4,
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
        }}
      >
        {showNewChatPrompt ? (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 3,
              textAlign: 'center',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 48, color: '#E4D96F' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
              Start a New Conversation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 460 }}>
              Begin your journey with our AI assistant. Ask questions, get insights, and explore your data.
            </Typography>
            <Button
              variant="contained"
              onClick={startNewConversation}
              sx={{
                mt: 2,
                backgroundColor: '#E4D96F',
                color: '#2c2c2c',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#D6CB61',
                },
              }}
            >
              Start Chat
            </Button>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <Fade in key={message.id}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 0.5 }}>
                    {message.role === 'assistant' && (
                      <Avatar
                        sx={{
                          bgcolor: '#E4D96F',
                          width: 32,
                          height: 32,
                        }}
                      >
                        <AutoAwesomeIcon sx={{ color: '#2c2c2c', fontSize: 20 }} />
                      </Avatar>
                    )}
                    <Box
                      sx={{
                        backgroundColor: message.role === 'user' ? '#E4D96F' : '#ffffff',
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
                          color: message.role === 'user' ? '#2c2c2c' : '#2c2c2c',
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

                      {copyPopup.open && copyPopup.messageId === message.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -30,
                            right: 0,
                            backgroundColor: '#2c2c2c',
                            color: '#fff',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                          }}
                        >
                          Copied!
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      ml: message.role === 'assistant' ? 6 : 0,
                      mr: message.role === 'user' ? 0 : 6,
                    }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>

                  {message.role === 'assistant' && (
                    <Collapse in={showReferences[message.id]} sx={{ ml: 6, mt: 1, maxWidth: '100%' }}>
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
              </Fade>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} sx={{ color: '#E4D96F' }} />
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
          position: 'fixed',
          bottom: 0,
          left: isCollapsed ? '100px' : '500px',
          right: '76px', // Account for right sidebar width
          p: 3,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: 2,
          alignItems: 'flex-end',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1200,
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
                borderColor: '#E4D96F',
              },
            },
          }}
        />
        <Tooltip title="Send message" arrow>
          <IconButton
            type="submit"
            disabled={isLoading || !input.trim()}
            sx={{
              backgroundColor: '#E4D96F',
              color: '#2c2c2c',
              width: 44,
              height: 44,
              '&:hover': {
                backgroundColor: '#D6CB61',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Box, 
//   TextField, 
//   IconButton, 
//   Typography, 
//   Tooltip, 
//   CircularProgress, 
//   Button,
//   Collapse,
//   Avatar,
//   Fade
// } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// import ThumbDownIcon from '@mui/icons-material/ThumbDown';
// import DescriptionIcon from '@mui/icons-material/Description';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// import { API_BASE_URL } from '@/lib/constants';

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
//   quality?: 'good' | 'bad';
//   sources?: Array<{
//     source: string;
//     relevance_score: number;
//     content: string;
//   }>;
// }

// interface ChatAreaProps {
//   conversationId: string | null;
//   onTogglePDFViewer: () => void;
//   isPDFViewerOpen: boolean;
//   isCollapsed: boolean;
//   onCollapseChange: (collapsed: boolean) => void;
// }

// export default function ChatArea({
//   conversationId,
//   onTogglePDFViewer,
//   isPDFViewerOpen,
//   isCollapsed,
//   onCollapseChange
// }: ChatAreaProps) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showReferences, setShowReferences] = useState<{ [key: string]: boolean }>({});
//   const [copyPopup, setCopyPopup] = useState<{ open: boolean; messageId: string | null }>({ 
//     open: false, 
//     messageId: null 
//   });
//   const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
//   const [showNewChatPrompt, setShowNewChatPrompt] = useState(false);
  
//   const messagesEndRef = useRef<null | HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (conversationId) {
//       setCurrentConversationId(conversationId);
//       loadConversation(conversationId);
//     } else {
//       setShowNewChatPrompt(true);
//       setMessages([]);
//     }
//   }, [conversationId]);

//   const loadConversation = async (id: string) => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`${API_BASE_URL}/conversation/${id}`);
//       if (!response.ok) throw new Error('Failed to load conversation');
      
//       const data = await response.json();
//       const formattedMessages = data.history.flatMap((turn: any) => [
//         {
//           id: `${turn.question.timestamp}-user`,
//           role: 'user',
//           content: turn.question.content,
//           timestamp: turn.question.timestamp,
//         },
//         {
//           id: `${turn.answer.timestamp}-assistant`,
//           role: 'assistant',
//           content: turn.answer.content,
//           timestamp: turn.answer.timestamp,
//           sources: turn.context
//         }
//       ]);
      
//       setMessages(formattedMessages);
//     } catch (error) {
//       console.error('Error loading conversation:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startNewConversation = async () => {
//     setIsLoading(true);
//     setShowNewChatPrompt(false);
//     try {
//       const response = await fetch(`${API_BASE_URL}/conversation/new`, {
//         method: 'POST'
//       });
//       if (!response.ok) throw new Error('Failed to create conversation');
//       const data = await response.json();
//       setCurrentConversationId(data.conversation_id);
//       setMessages([]);
//     } catch (error) {
//       console.error('Error creating conversation:', error);
//       setShowNewChatPrompt(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;

//     if (!currentConversationId) {
//       await startNewConversation();
//       if (!currentConversationId) return;
//     }

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: input.trim(),
//       timestamp: new Date().toISOString(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/conversation/${currentConversationId}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           question: input.trim(),
//           max_tokens: 1024,
//           temperature: 0.1
//         })
//       });

//       if (!response.ok) throw new Error('Failed to send message');

//       const data = await response.json();
//       const assistantMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         role: 'assistant',
//         content: data.answer,
//         timestamp: new Date().toISOString(),
//         sources: data.sources
//       };

//       setMessages(prev => [...prev, assistantMessage]);
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleQualityChange = (messageId: string, newQuality: 'good' | 'bad') => {
//     setMessages(prevMessages =>
//       prevMessages.map(message =>
//         message.id === messageId
//           ? { ...message, quality: newQuality }
//           : message
//       )
//     );
//   };

//   const toggleReferences = (messageId: string) => {
//     setShowReferences(prev => ({
//       ...prev,
//       [messageId]: !prev[messageId],
//     }));
//   };

//   const handleCopyContent = (content: string, messageId: string) => {
//     navigator.clipboard.writeText(content).then(() => {
//       setCopyPopup({ open: true, messageId });
//       setTimeout(() => setCopyPopup({ open: false, messageId: null }), 2000);
//     });
//   };

//   const formatTimestamp = (timestamp: string) => {
//     return new Date(timestamp).toLocaleTimeString(undefined, {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <Box 
//       sx={{ 
//         display: 'flex',
//         flexDirection: 'column',
//         height: 'calc(100vh - 64px)',
//         pt: '64px',
//         pb: '80px', // Add padding for input area
//         pr: '76px', // Add padding for right sidebar
//         backgroundColor: '#f5f5f5',
//       }}
//     >
//       <Box 
//         sx={{ 
//           flexGrow: 1,
//           display: 'flex',
//           flexDirection: 'column',
//           overflowY: 'auto',
//           px: 4,
//           pb: 2,
//           gap: 2,
//           '&::-webkit-scrollbar': {
//             width: '8px',
//           },
//           '&::-webkit-scrollbar-track': {
//             background: 'transparent',
//           },
//           '&::-webkit-scrollbar-thumb': {
//             background: '#bbb',
//             borderRadius: '4px',
//             '&:hover': {
//               background: '#999',
//             },
//           },
//         }}
//       >
//         {showNewChatPrompt ? (
//           <Box 
//             sx={{ 
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               minHeight: '60vh',
//               gap: 3,
//               textAlign: 'center',
//             }}
//           >
//             <AutoAwesomeIcon sx={{ fontSize: 48, color: '#E4D96F' }} />
//             <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
//               Start a New Conversation
//             </Typography>
//             <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 460 }}>
//               Begin your journey with our AI assistant. Ask questions, get insights, and explore your data.
//             </Typography>
//             <Button
//               variant="contained"
//               onClick={startNewConversation}
//               sx={{
//                 mt: 2,
//                 backgroundColor: '#E4D96F',
//                 color: '#2c2c2c',
//                 px: 4,
//                 py: 1.5,
//                 borderRadius: 2,
//                 '&:hover': {
//                   backgroundColor: '#D6CB61',
//                 },
//               }}
//             >
//               Start Chat
//             </Button>
//           </Box>
//         ) : (
//           <>
//             {messages.length === 0 ? (
//               <Box sx={{ 
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 minHeight: '50vh',
//                 gap: 4,
//                 maxWidth: '800px',
//                 mx: 'auto',
//                 px: 3,
//               }}>
//                 <Box sx={{ 
//                   position: 'relative', 
//                   mb: 2,
//                   animation: 'pulse 2s infinite'
//                 }}>
//                   <AutoAwesomeIcon 
//                     sx={{ 
//                       fontSize: 40, 
//                       color: '#E4D96F',
//                       '@keyframes pulse': {
//                         '0%': {
//                           opacity: 1,
//                           transform: 'scale(1)',
//                         },
//                         '50%': {
//                           opacity: 0.7,
//                           transform: 'scale(1.1)',
//                         },
//                         '100%': {
//                           opacity: 1,
//                           transform: 'scale(1)',
//                         },
//                       },
//                     }} 
//                   />
//                 </Box>

//                 <Box sx={{ 
//                   display: 'flex', 
//                   flexDirection: 'column', 
//                   gap: 3,
//                   maxWidth: '600px',
//                   width: '100%',
//                 }}>
//                   <Typography variant="h6" sx={{ textAlign: 'center', color: '#2c2c2c', fontWeight: 500 }}>
//                     I'm ready to help! Here are some things you can ask me:
//                   </Typography>

//                   {[
//                     {
//                       title: "Analyze your data",
//                       description: "Upload your data files and I can help you analyze patterns, trends, and insights.",
//                       example: "Can you help me analyze this dataset and identify key trends?"
//                     },
//                     {
//                       title: "Summarize documents",
//                       description: "Share your documents and I'll help you extract the main points and key information.",
//                       example: "Could you summarize the main findings from this research paper?"
//                     },
//                     {
//                       title: "Answer questions",
//                       description: "Ask me anything about your documents or research, and I'll provide detailed answers.",
//                       example: "What are the key methodologies used in this study?"
//                     }
//                   ].map((item, index) => (
//                     <Paper
//                       key={index}
//                       sx={{
//                         p: 2.5,
//                         borderRadius: 2,
//                         cursor: 'pointer',
//                         transition: 'all 0.2s ease',
//                         '&:hover': {
//                           transform: 'translateY(-2px)',
//                           boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//                           bgcolor: '#fafafa'
//                         },
//                       }}
//                       onClick={() => setInput(item.example)}
//                     >
//                       <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 1 }}>
//                         {item.title}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                         {item.description}
//                       </Typography>
//                       <Typography 
//                         variant="body2" 
//                         sx={{ 
//                           color: '#1976d2', 
//                           fontStyle: 'italic',
//                           '&:hover': { textDecoration: 'underline' }
//                         }}
//                       >
//                         "{item.example}"
//                       </Typography>
//                     </Paper>
//                   ))}
//                 </Box>

//                 <Typography 
//                   variant="body2" 
//                   color="text.secondary" 
//                   sx={{ 
//                     mt: 2, 
//                     textAlign: 'center',
//                     maxWidth: '500px',
//                     fontStyle: 'italic'
//                   }}
//                 >
//                   Click on any suggestion to start, or type your own question in the input box below
//                 </Typography>
//               </Box>
//             ) : (
//               <>
//                 {messages.map((message) => (
//               <Fade in key={message.id}>
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
//                     maxWidth: '88%',
//                     alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
//                   }}
//                 >
//                   <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 0.5 }}>
//                     {message.role === 'assistant' && (
//                       <Avatar
//                         sx={{
//                           bgcolor: '#E4D96F',
//                           width: 32,
//                           height: 32,
//                         }}
//                       >
//                         <AutoAwesomeIcon sx={{ color: '#2c2c2c', fontSize: 20 }} />
//                       </Avatar>
//                     )}
//                     <Box
//                       sx={{
//                         backgroundColor: message.role === 'user' ? '#E4D96F' : '#ffffff',
//                         borderRadius: 2,
//                         p: 2,
//                         maxWidth: '100%',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         position: 'relative',
//                       }}
//                     >
//                       <Typography
//                         variant="body1"
//                         sx={{
//                           color: message.role === 'user' ? '#2c2c2c' : '#2c2c2c',
//                           lineHeight: 1.5,
//                           whiteSpace: 'pre-wrap',
//                         }}
//                       >
//                         {message.content}
//                       </Typography>

//                       {message.role === 'assistant' && (
//                         <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
//                           <Tooltip title="Copy response">
//                             <IconButton
//                               onClick={() => handleCopyContent(message.content, message.id)}
//                               size="small"
//                               sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
//                             >
//                               <ContentCopyIcon fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                           <Box sx={{ display: 'flex', gap: 0.5 }}>
//                             <Tooltip title="Helpful">
//                               <IconButton
//                                 size="small"
//                                 onClick={() => handleQualityChange(message.id, 'good')}
//                                 sx={{
//                                   opacity: message.quality === 'good' ? 1 : 0.6,
//                                   '&:hover': { opacity: 1 },
//                                   color: message.quality === 'good' ? '#2e7d32' : 'inherit',
//                                 }}
//                               >
//                                 <ThumbUpIcon fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                             <Tooltip title="Not helpful">
//                               <IconButton
//                                 size="small"
//                                 onClick={() => handleQualityChange(message.id, 'bad')}
//                                 sx={{
//                                   opacity: message.quality === 'bad' ? 1 : 0.6,
//                                   '&:hover': { opacity: 1 },
//                                   color: message.quality === 'bad' ? '#d32f2f' : 'inherit',
//                                 }}
//                               >
//                                 <ThumbDownIcon fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                           </Box>
//                           {message.sources && message.sources.length > 0 && (
//                             <Tooltip title="View sources">
//                               <IconButton
//                                 size="small"
//                                 onClick={() => toggleReferences(message.id)}
//                                 sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
//                               >
//                                 <DescriptionIcon fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                           )}
//                         </Box>
//                       )}

//                       {copyPopup.open && copyPopup.messageId === message.id && (
//                         <Box
//                           sx={{
//                             position: 'absolute',
//                             bottom: -30,
//                             right: 0,
//                             backgroundColor: '#2c2c2c',
//                             color: '#fff',
//                             px: 2,
//                             py: 0.5,
//                             borderRadius: 1,
//                             fontSize: '0.75rem',
//                           }}
//                         >
//                           Copied!
//                         </Box>
//                       )}
//                     </Box>
//                   </Box>

//                   <Typography
//                     variant="caption"
//                     sx={{
//                       color: '#666',
//                       ml: message.role === 'assistant' ? 6 : 0,
//                       mr: message.role === 'user' ? 0 : 6,
//                     }}
//                   >
//                     {formatTimestamp(message.timestamp)}
//                   </Typography>

//                   {message.role === 'assistant' && (
//                     <Collapse in={showReferences[message.id]} sx={{ ml: 6, mt: 1, maxWidth: '100%' }}>
//                       <Box
//                         sx={{
//                           backgroundColor: '#f8f9fa',
//                           borderRadius: 2,
//                           p: 2,
//                           border: '1px solid #e0e0e0',
//                         }}
//                       >
//                         <Typography variant="subtitle2" sx={{ mb: 1, color: '#2c2c2c' }}>
//                           Sources
//                         </Typography>
//                         {message.sources?.map((source, index) => (
//                           <Box key={index} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
//                             <Typography
//                               variant="subtitle2"
//                               sx={{ 
//                                 color: '#1976d2',
//                                 fontSize: '0.8rem',
//                                 fontWeight: 600,
//                                 mb: 0.5
//                               }}
//                             >
//                               {source.source} (Score: {source.relevance_score.toFixed(2)})
//                             </Typography>
//                             <Typography
//                               variant="body2"
//                               sx={{
//                                 color: '#666',
//                                 fontSize: '0.8rem',
//                                 lineHeight: 1.4
//                               }}
//                             >
//                               {source.content}
//                             </Typography>
//                           </Box>
//                         ))}
//                       </Box>
//                     </Collapse>
//                   )}
//                 </Box>
//               </Fade>
//             ))}
//             {isLoading && (
//               <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
//                 <CircularProgress size={24} sx={{ color: '#E4D96F' }} />
//               </Box>
//             )}
//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </Box>

//       <Box
//         component="form"
//         onSubmit={handleSubmit}
//         sx={{
//           position: 'fixed',
//           bottom: 0,
//           left: isCollapsed ? '100px' : '500px',
//           right: '76px', // Account for right sidebar width
//           p: 3,
//           backgroundColor: '#f5f5f5',
//           borderTop: '1px solid rgba(0, 0, 0, 0.1)',
//           display: 'flex',
//           gap: 2,
//           alignItems: 'flex-end',
//           transition: 'left 0.3s ease-in-out',
//           zIndex: 1200,
//         }}
//       >
//         <TextField
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder={isLoading ? "Please wait..." : "Type your message..."}
//           variant="outlined"
//           multiline
//           maxRows={4}
//           fullWidth
//           disabled={isLoading}
//           sx={{
//             backgroundColor: '#ffffff',
//             '& .MuiOutlinedInput-root': {
//               borderRadius: 2,
//               fontSize: '0.95rem',
//               '& fieldset': {
//                 borderColor: 'rgba(0, 0, 0, 0.1)',
//               },
//               '&:hover fieldset': {
//                 borderColor: 'rgba(0, 0, 0, 0.2)',
//               },
//               '&.Mui-focused fieldset': {
//                 borderColor: '#E4D96F',
//               },
//             },
//           }}
//         />
//         <Tooltip title="Send message" arrow>
//           <IconButton
//             type="submit"
//             disabled={isLoading || !input.trim()}
//             sx={{
//               backgroundColor: '#E4D96F',
//               color: '#2c2c2c',
//               width: 44,
//               height: 44,
//               '&:hover': {
//                 backgroundColor: '#D6CB61',
//               },
//               '&.Mui-disabled': {
//                 backgroundColor: 'rgba(0, 0, 0, 0.12)',
//                 color: 'rgba(0, 0, 0, 0.26)',
//               },
//             }}
//           >
//             <SendIcon />
//           </IconButton>
//         </Tooltip>
//       </Box>
//     </Box>
//   );
// }