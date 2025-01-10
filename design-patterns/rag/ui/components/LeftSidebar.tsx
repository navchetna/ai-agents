import { useState } from 'react'
import { Box, List, ListItem, ListItemText, TextField, IconButton, Paper, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'

interface LeftSidebarProps {
  onSelectConversation: (id: string) => void
  selectedConversation: string | null
}

export default function LeftSidebar({ onSelectConversation, selectedConversation }: LeftSidebarProps) {
  const [conversations, setConversations] = useState<string[]>([])
  const [newConversation, setNewConversation] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleNewConversation = () => {
    if (newConversation.trim()) {
      setConversations([...conversations, newConversation])
      setNewConversation('')
    }
  }

  const handleDeleteConversation = (index: number) => {
    const updatedConversations = [...conversations]
    updatedConversations.splice(index, 1)
    setConversations(updatedConversations)
  }

  const handleLoadConversation = () => {
    // TODO: Implement loading entire conversation
    console.log('Loading entire conversation')
  }

  return (
    <Paper 
      elevation={8}
      sx={{
        width: isCollapsed ? 64 : 256,
        transition: 'width 0.3s ease-in-out',
        backgroundColor: '#C0C0C0',
        borderRadius: '0 16px 16px 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <IconButton
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: '#C0C0C0',
          '&:hover': {
            backgroundColor: '#B0B0B0',
          },
          color: 'grey',
        }}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', visibility: isCollapsed ? 'hidden' : 'visible' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
          <Tooltip title="Create" arrow>
            <IconButton 
              onClick={handleNewConversation} 
              sx={{ 
                backgroundColor: '#E4D96F',
                color: 'grey',
                borderRadius: 0,
                mb: 1,
                width: '2rem',
                height: '2rem',
                '&:hover': {
                  backgroundColor: '#D6CB61',
                },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              value={newConversation}
              onChange={(e) => setNewConversation(e.target.value)}
              placeholder="New conversation"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ 
                backgroundColor: '#F8F8F8',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E0E0E0',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#BDBDBD',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9E9E9E',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                },
              }}
            />
            <Tooltip title="Delete" arrow>
              <IconButton 
                onClick={() => handleDeleteConversation(conversations.length - 1)}
                sx={{ 
                  backgroundColor: '#E4D96F',
                  color: 'grey',
                  borderRadius: 0,
                  ml: 1,
                  width: '2rem',
                  height: '2rem',
                  '&:hover': {
                    backgroundColor: '#D6CB61',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Load Conversation" arrow>
              <IconButton 
                onClick={handleLoadConversation}
                sx={{ 
                  backgroundColor: '#E4D96F',
                  color: 'grey',
                  borderRadius: 0,
                  ml: 1,
                  width: '2rem',
                  height: '2rem',
                  '&:hover': {
                    backgroundColor: '#D6CB61',
                  },
                }}
              >
                <CloudDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <List sx={{ overflow: 'auto', flexGrow: 1 }}>
          {conversations.map((conv, index) => (
            <ListItem
              key={index}
              button
              selected={selectedConversation === conv}
              onClick={() => onSelectConversation(conv)}
            >
              <ListItemText 
                primary={conv} 
                primaryTypographyProps={{ 
                  sx: { 
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'black',
                  } 
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  )
}

