'use client'

import React, { useState, useEffect } from 'react'
import { TextField, IconButton, Paper, Typography, Tooltip, CircularProgress, ToggleButtonGroup, ToggleButton, Collapse, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import PanToolIcon from '@mui/icons-material/PanTool'
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined'
import PushPinIcon from '@mui/icons-material/PushPin'
import DescriptionIcon from '@mui/icons-material/Description'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PDFViewer from './PDFViewer'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  quality?: 'good' | 'bad' | 'ok'
  isPinned?: boolean
  references?: string[]
}

interface ChatAreaProps {
  conversationId: string | null
  onTogglePDFViewer: () => void
  isPDFViewerOpen: boolean
}

interface CopyPopupState {
  open: boolean
  messageId: string | null
}

const contextOptions = [
  'General',
  'Scientific Research',
  'Literature Review',
  'Data Analysis',
  'Technical Writing',
  'Academic Writing',
]

export default function ChatArea({ conversationId, onTogglePDFViewer, isPDFViewerOpen }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showReferences, setShowReferences] = useState<{ [key: string]: boolean }>({})
  const [copyPopup, setCopyPopup] = useState<CopyPopupState>({ open: false, messageId: null })
  const [selectedContext, setSelectedContext] = useState(contextOptions[0])
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({
    'General': [],
  })
  const [pdfDocuments, setPdfDocuments] = useState<{ name: string; url: string }[]>([
    { name: 'Sample Document', url: 'https://example.com/sample.pdf' },
    { name: 'Another Document', url: 'https://example.com/another.pdf' },
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleContextChange = (event: React.ChangeEvent<{ value: string }>) => {
    setSelectedContext(event.target.value as string)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
        isPinned: false,
      }
      setConversations(prev => ({
        ...prev,
        [selectedContext]: [...(prev[selectedContext] || []), newMessage],
      }))
      setInput('')
      setIsLoading(true)
    }
  }

  const handleQualityChange = (messageId: string, newQuality: 'good' | 'bad' | 'ok' | null) => {
    setConversations(prevConversations => {
      const updatedConversations = {...prevConversations}
      updatedConversations[selectedContext] = updatedConversations[selectedContext]?.map((message) =>
        message.id === messageId
          ? { ...message, quality: newQuality as 'good' | 'bad' | 'ok' }
          : message
      ) || []
      return updatedConversations
    })
  }

  const handlePinToggle = (messageId: string) => {
    setConversations(prevConversations => {
      const updatedConversations = {...prevConversations}
      updatedConversations[selectedContext] = updatedConversations[selectedContext]?.map((message) =>
        message.id === messageId
          ? { ...message, isPinned: !message.isPinned }
          : message
      ) || []
      return updatedConversations
    })
  }

  const toggleReferences = (messageId: string) => {
    setShowReferences((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }

  const handleCopyContent = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyPopup({ open: true, messageId })
      setTimeout(() => setCopyPopup({ open: false, messageId: null }), 2000)
    }).catch(err => {
      console.error('Failed to copy content: ', err)
    })
  }

  useEffect(() => {
    setMessages(conversations[selectedContext] || [])
  }, [selectedContext, conversations])

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        const dummyResponse: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `This is a dummy response from the AI assistant in the ${selectedContext} context.`,
          references: ['Source 1: Example Document', 'Source 2: Another Reference'],
        }
        setConversations(prev => ({
          ...prev,
          [selectedContext]: [...(prev[selectedContext] || []), dummyResponse],
        }))
        setIsLoading(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isLoading, selectedContext])

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', p: 2 }}>
        {!isPDFViewerOpen && (
          <FormControl variant="outlined" sx={{ mb: 2, width: '100%' }} size="small">
            <InputLabel id="context-select-label">Conversation Context</InputLabel>
            <Select
              labelId="context-select-label"
              id="context-select"
              value={selectedContext}
              onChange={(e: React.ChangeEvent<{ value: string }>) => handleContextChange(e)}
              label="Conversation Context"
              sx={{
                fontSize: '0.875rem',
                backgroundColor: '#FFFFFF',
                width: '100%',
                '& .MuiSelect-select': {
                  padding: '0.5rem',
                },
              }}
            >
              {contextOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
          {isPDFViewerOpen ? (
            <PDFViewer documents={pdfDocuments} />
          ) : (
            <>
              {conversations[selectedContext]?.map((message) => (
                <Paper key={message.id} sx={{ p: 1, mb: 1, position: 'relative' }} elevation={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      <strong>{message.role === 'user' ? 'You' : 'AI'}:</strong> {message.content}
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      {message.role === 'assistant' && (
                        <Tooltip title="Copy response" arrow>
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
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ToggleButtonGroup
                          value={message.quality}
                          exclusive
                          onChange={(_, newQuality) => handleQualityChange(message.id, newQuality)}
                          aria-label="response quality"
                          size="small"
                        >
                          <ToggleButton value="good" aria-label="good response">
                            <Tooltip title="Good">
                              <ThumbUpIcon fontSize="small" />
                            </Tooltip>
                          </ToggleButton>
                          <ToggleButton value="ok" aria-label="okay response">
                            <Tooltip title="Okay">
                              <PanToolIcon fontSize="small" />
                            </Tooltip>
                          </ToggleButton>
                          <ToggleButton value="bad" aria-label="bad response">
                            <Tooltip title="Bad">
                              <ThumbDownIcon fontSize="small" />
                            </Tooltip>
                          </ToggleButton>
                        </ToggleButtonGroup>
                        {message.references && message.references.length > 0 && (
                          <Tooltip title="Show References">
                            <IconButton
                              onClick={() => toggleReferences(message.id)}
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              <DescriptionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Collapse in={showReferences[message.id]}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                          References:
                          <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                            {message.references?.map((ref, index) => (
                              <li key={index}>{ref}</li>
                            ))}
                          </ul>
                        </Typography>
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
                        opacity: 1,
                        transition: 'opacity 0.15s ease-in-out',
                      }}
                    >
                      Copied
                    </Box>
                  )}
                </Paper>
              ))}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}
        </Box>
        {!isPDFViewerOpen && (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', width: '100%' }}>
            <TextField
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              variant="outlined"
              fullWidth
              sx={{
                mr: 1,
                flexGrow: 1,
                backgroundColor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
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
                sx={{
                  backgroundColor: '#E4D96F',
                  color: 'grey',
                  borderRadius: 0,
                  width: '2.5rem',
                  height: '2.5rem',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: '#D6CB61',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  )
}

