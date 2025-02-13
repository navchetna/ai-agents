import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItemButton,
  IconButton, 
  Paper, 
  Tooltip,
  Typography,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { topics } from './ChatArea';
import { CHAT_QNA_URL } from '@/lib/constants';

interface Conversation {
  conversation_id: string;
  created_at: string;
  last_updated: string;
  context?: string;
  history: Array<{
    question: { content: string; timestamp: string };
    answer: { content: string; timestamp: string };
  }>;
}

interface LeftSidebarProps {
  onSelectConversation: (id: string) => void;
  selectedConversation: string | null;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

export default function LeftSidebar({ 
  onSelectConversation, 
  selectedConversation, 
  isCollapsed, 
  onCollapseChange 
}: LeftSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${CHAT_QNA_URL}/conversations`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${CHAT_QNA_URL}/conversation/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.conversation_id !== id)
      );
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const getConversationPreview = (conversation: Conversation) => {
    if (conversation.history && conversation.history.length > 0) {
      const lastMessage = conversation.history[conversation.history.length - 1];
      return {
        context: conversation.context || 'General',
        question: lastMessage.question.content
      };
    }
    return {
      context: 'General',
      question: 'Empty conversation'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Paper 
      elevation={3}
      sx={{
        width: isCollapsed ? 60 : 300,
        transition: 'width 0.3s ease-in-out',
        backgroundColor: '#f8f9fa',
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: '64px',
        overflow: 'hidden',
        borderRadius: 0,
        zIndex: 1200,
      }}
    >
      <IconButton
        onClick={() => onCollapseChange(!isCollapsed)}
        sx={{
          position: 'absolute',
          right: -1,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
          zIndex: 10,
          width: '20px',
          height: '40px',
        }}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        opacity: isCollapsed ? 0 : 1,
        transition: 'opacity 0.2s',
        visibility: isCollapsed ? 'hidden' : 'visible',
      }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          {/* <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
            Conversations
          </Typography> */}
          <Tooltip title="New Chat" arrow>
            <IconButton 
              onClick={() => onSelectConversation('')}
              sx={{ 
                backgroundColor: '#0071C5',
                color: 'white',
                width: '100%',
                borderRadius: '8px',
                py: 1,
                '&:hover': {
                  backgroundColor: '#0071C5',
                },
              }}
            >
              <AddIcon /> <Typography sx={{ ml: 1 }}>New Chat</Typography>
            </IconButton>
          </Tooltip>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, color: 'error.main' }}>
            {error}
          </Box>
        ) : (
          <List sx={{ 
            overflow: 'auto',
            flexGrow: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}>
            {conversations.map((conversation) => {
              const preview = getConversationPreview(conversation);
              const topic = topics.find(t => t.name === preview.context);

              return (
                <ListItemButton
                  key={conversation.conversation_id}
                  selected={selectedConversation === conversation.conversation_id}
                  onClick={() => onSelectConversation(conversation.conversation_id)}
                  sx={{
                    borderRadius: '8px',
                    mx: 1,
                    mb: 1,
                    p: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    minHeight: '60px',
                    maxHeight: '80px',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#E4D96F15',
                      borderColor: '#E4D96F',
                      '&:hover': {
                        backgroundColor: '#E4D96F25',
                      }
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%',
                    gap: 1,
                    mb: 0.5
                  }}>
                    <Typography 
                      sx={{ 
                        fontSize: '0.75rem',
                        color: '#666',
                        flexShrink: 0,
                      }}
                    >
                      {formatDate(conversation.created_at)}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: topic ? `${topic.color}10` : '#f5f5f5',
                        color: topic ? topic.color : '#666',
                        borderRadius: '12px',
                        px: 1,
                        py: 0.25,
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ 
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                      }}>
                        {preview.context}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.conversation_id, e);
                      }}
                      size="small"
                      sx={{
                        ml: 'auto',
                        opacity: 0,
                        padding: 0.5,
                        transition: 'opacity 0.2s',
                        flexShrink: 0,
                        '.MuiListItemButton-root:hover &': {
                          opacity: 1,
                        }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Box>
                  
                  <Typography
                    sx={{ 
                      fontSize: '0.85rem',
                      color: '#333',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}
                  >
                    {preview.question}
                  </Typography>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>

      {isCollapsed && (
        <Box sx={{ 
          position: 'absolute',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 2,
          gap: 2
        }}>
          <Tooltip title="New Chat" arrow placement="right">
            <IconButton
              onClick={() => {
                onCollapseChange(false);
                onSelectConversation('');
              }}
              sx={{ 
                backgroundColor: '#0071C5',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#D6CB61',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
}