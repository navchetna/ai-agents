import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItemButton,
  IconButton,
  Paper,
  Tooltip,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChatIcon from "@mui/icons-material/Chat";
import { topics } from "./ChatArea";
import { CHAT_QNA_URL } from "@/lib/constants";

interface Conversation {
  conversation_id: string;
  created_at: string;
  last_updated: string;
  context?: string;
  history:
    | Array<{
        question: { content: string; timestamp: string };
        answer: { content: string; timestamp: string };
      }>
    | Array<any>;
}

interface LeftSidebarProps {
  onSelectConversation: (id: string) => void;
  selectedConversation: string | null;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  refreshTrigger?: number;
}

export default function LeftSidebar({
  onSelectConversation,
  selectedConversation,
  isCollapsed,
  onCollapseChange,
  refreshTrigger = 0,
}: LeftSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [deletePreview, setDeletePreview] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [selectedConversation, refreshTrigger]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${CHAT_QNA_URL}/conversations?db_name=rag_db`
      );

      const data = await response.data;
      console.log("Fetched conversations:", data);
      setConversations(data.conversations || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
      console.error("Error fetching conversations:", err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const conversation = conversations.find(
      (conv) => conv.conversation_id === id
    );
    if (conversation) {
      const preview = getConversationPreview(conversation);
      setDeletePreview(preview.question);
    }

    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
    setDeletePreview("");
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${CHAT_QNA_URL}/conversations/${conversationToDelete}?db_name=rag_db`
      );

      setConversations((prevConversations) =>
        prevConversations.filter(
          (conv) => conv.conversation_id !== conversationToDelete
        )
      );

      if (selectedConversation === conversationToDelete) {
        onSelectConversation("");
      }

      closeDeleteDialog();
    } catch (err) {
      console.error("Error deleting conversation:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getConversationPreview = (conversation: Conversation) => {
    if (
      !conversation.history ||
      !Array.isArray(conversation.history) ||
      conversation.history.length === 0
    ) {
      return {
        context: "General",
        question: "Empty conversation",
      };
    }

    const lastTurn = conversation.history[conversation.history.length - 1];

    const questionContent =
      lastTurn.question?.content ||
      (typeof lastTurn.question === "string" ? lastTurn.question : "") ||
      "Empty question";

    return {
      context: conversation.context || "General",
      question: questionContent,
    };
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const renderEmptyState = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        p: 3,
        textAlign: "center",
        gap: 2,
      }}
    >
      <ChatIcon sx={{ fontSize: 48, color: "#0071C5", opacity: 0.6 }} />
      <Typography variant="body1" sx={{ color: "#666" }}>
        No conversation history found
      </Typography>
      <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
        Start a new chat to begin
      </Typography>
    </Box>
  );

  const hasConversations = conversations.length > 0;

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          width: isCollapsed ? 60 : 300,
          transition: "width 0.3s ease-in-out",
          backgroundColor: "#f8f9fa",
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: "64px",
          overflow: "hidden",
          borderRadius: 0,
          zIndex: 1200,
        }}
      >
        <IconButton
          onClick={() => onCollapseChange(!isCollapsed)}
          sx={{
            position: "absolute",
            right: -1,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#f8f9fa",
            border: "1px solid #e0e0e0",
            borderLeft: "none",
            borderRadius: "0 8px 8px 0",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
            zIndex: 10,
            width: "20px",
            height: "40px",
          }}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            opacity: isCollapsed ? 0 : 1,
            transition: "opacity 0.2s",
            visibility: isCollapsed ? "hidden" : "visible",
          }}
        >
          {hasConversations && (
            <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
              <Tooltip title="Start a new chat" arrow>
                <IconButton
                  onClick={() => onSelectConversation("")}
                  sx={{
                    backgroundColor: "#0071C5",
                    color: "white",
                    width: "100%",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    py: 1,
                    "&:hover": {
                      backgroundColor: "#00C7FD",
                    },
                  }}
                >
                  <AddIcon /> <Typography sx={{ ml: 1 }}>New Chat</Typography>
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                {error}
              </Alert>
              <Button
                variant="outlined"
                onClick={fetchConversations}
                sx={{
                  mb: 2,
                  mx: "auto",
                  display: "block",
                  borderColor: "#0071C5",
                  color: "#0071C5",
                }}
              >
                Try Again
              </Button>
              {renderEmptyState()}
            </Box>
          ) : conversations.length === 0 ? (
            renderEmptyState()
          ) : (
            <List
              sx={{
                overflow: "auto",
                flexGrow: 1,
                pt: 2,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#555",
                },
              }}
            >
              {conversations.map((conversation) => {
                const preview = getConversationPreview(conversation);
                const topic = topics.find((t) => t.name === preview.context);

                return (
                  <ListItemButton
                    key={conversation.conversation_id}
                    selected={
                      selectedConversation === conversation.conversation_id
                    }
                    onClick={() =>
                      onSelectConversation(conversation.conversation_id)
                    }
                    sx={{
                      borderRadius: "8px",
                      mx: 1,
                      mb: 1,
                      p: 1.5,
                      flexDirection: "column",
                      alignItems: "flex-start",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#ffffff",
                      transition: "all 0.2s ease",
                      minHeight: "60px",
                      maxHeight: "80px",
                      "&:hover": {
                        backgroundColor: "aliceblue",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "aliceblue",
                        borderColor: "#0071C5",
                        "&:hover": {
                          backgroundColor: "aliceblue",
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#666",
                          flexShrink: 0,
                        }}
                      >
                        {formatDate(conversation.created_at)}
                      </Typography>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          backgroundColor: topic
                            ? `${topic.color}10`
                            : "#f5f5f5",
                          color: topic ? topic.color : "#666",
                          borderRadius: "12px",
                          px: 1,
                          py: 0.25,
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.65rem",
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {preview.context}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) =>
                          openDeleteDialog(conversation.conversation_id, e)
                        }
                        size="small"
                        sx={{
                          ml: "auto",
                          opacity: 0,
                          padding: 0.5,
                          transition: "opacity 0.2s",
                          flexShrink: 0,
                          ".MuiListItemButton-root:hover &": {
                            opacity: 1,
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: "0.9rem" }} />
                      </IconButton>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: "#333",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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
          <Box
            sx={{
              position: "absolute",
              top: "64px",
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pt: 2,
              gap: 2,
            }}
          >
            <Tooltip title="Start a new chat" arrow placement="right">
              <IconButton
                onClick={() => {
                  onCollapseChange(false);
                  onSelectConversation("");
                }}
                sx={{
                  backgroundColor: "#0071C5",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#00C7FD",
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={!isDeleting ? closeDeleteDialog : undefined}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Conversation?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this conversation? This action
            cannot be undone.
            {deletePreview && (
              <Box sx={{ mt: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    color: "#555",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  "{deletePreview}"
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            color="primary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
