import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemText, 
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
import ChatIcon from '@mui/icons-material/Chat';
import { API_BASE_URL } from '@/lib/constants';

interface Conversation {
  conversation_id: string;
  created_at: string;
  last_updated: string;
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
      const response = await fetch(`${API_BASE_URL}/conversations`);
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
      const response = await fetch(`${API_BASE_URL}/conversation/${id}`, {
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
      return lastMessage.question.content;
    }
    return 'Empty conversation';
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
        width: isCollapsed ? 100 : 500,
        transition: 'width 0.3s ease-in-out',
        backgroundColor: '#f8f9fa',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
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
          <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
            Conversations
          </Typography>
          <Tooltip title="New Chat" arrow>
            <IconButton 
              onClick={() => onSelectConversation('')}
              sx={{ 
                backgroundColor: '#E4D96F',
                color: 'grey',
                width: '100%',
                borderRadius: '8px',
                py: 1,
                '&:hover': {
                  backgroundColor: '#D6CB61',
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
            {conversations.map((conversation) => (
              <ListItemButton
                key={conversation.conversation_id}
                selected={selectedConversation === conversation.conversation_id}
                onClick={() => onSelectConversation(conversation.conversation_id)}
                sx={{
                  borderRadius: '4px',
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: '#E4D96F33',
                    '&:hover': {
                      backgroundColor: '#E4D96F40',
                    }
                  }
                }}
              >
                <ChatIcon sx={{ mr: 2, color: 'grey' }} />
                <ListItemText 
                  primary={getConversationPreview(conversation)}
                  secondary={formatDate(conversation.created_at)}
                  primaryTypographyProps={{ 
                    sx: { 
                      fontSize: '0.9rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#333',
                    } 
                  }}
                />
                <Tooltip title="Delete" arrow>
                  <IconButton
                    onClick={(e) => handleDeleteConversation(conversation.conversation_id, e)}
                    size="small"
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '.MuiListItemButton-root:hover &': {
                        opacity: 1,
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      {isCollapsed && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
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
                backgroundColor: '#E4D96F',
                color: 'grey',
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