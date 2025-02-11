// import React, { useState } from 'react'
// import { Paper, IconButton, Typography, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Button, Menu, MenuItem, Box } from '@mui/material'
// import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined'
// import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
// import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
// import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined'
// import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

// interface RightSidebarProps {
//   messages: { role: string; content: string }[];
//   currentContext: string;
//   onContextChange: (context: string) => void;
//   onTogglePDFViewer: () => void;
//   isPDFViewerOpen: boolean;
// }

// const contextOptions = [
//   'General',
//   'Scientific Research',
//   'Literature Review',
//   'Data Analysis',
//   'Technical Writing',
//   'Academic Writing',
// ]

// export default function RightSidebar({ messages, currentContext, onContextChange, onTogglePDFViewer, isPDFViewerOpen }: RightSidebarProps) {
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
//   const [isSummaryOpen, setIsSummaryOpen] = useState(false)
//   const [summary, setSummary] = useState("")
//   const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null)

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)])
//     }
//   }

//   const generateSummary = () => {
//     const userMessages = messages.filter(m => m.role === 'user').map(m => m.content)
//     const summary = userMessages.join(' ').slice(0, 200) + '...' // First 200 characters of user messages
//     setSummary(summary)
//     setIsSummaryOpen(true)
//   }

//   const handleContextMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
//     setContextMenuAnchor(event.currentTarget)
//   }

//   const handleContextMenuClose = () => {
//     setContextMenuAnchor(null)
//   }

//   const handleContextChange = (context: string) => {
//     onContextChange(context)
//     handleContextMenuClose()
//   }

//   return (
//     <Paper 
//       elevation={8}
//       sx={{
//         width: isCollapsed ? 20 : 76,
//         transition: 'width 0.3s ease-in-out',
//         backgroundColor: '#C0C0C0',
//         borderRadius: '16px 0 0 16px',
//         display: 'flex',
//         flexDirection: 'column',
//         position: 'relative',
//         overflow: 'hidden',
//         height: '100%',
//       }}
//     >
//       <IconButton
//         onClick={() => setIsCollapsed(!isCollapsed)}
//         sx={{
//           position: 'absolute',
//           left: 0,
//           top: '50%',
//           transform: 'translateY(-50%)',
//           backgroundColor: '#C0C0C0',
//           '&:hover': {
//             backgroundColor: '#B0B0B0',
//           },
//           color: 'grey',
//           zIndex: 1,
//         }}
//       >
//         {isCollapsed ? <ChevronLeftOutlinedIcon /> : <ChevronRightOutlinedIcon />}
//       </IconButton>
      
//       <Box sx={{ 
//         p: 1, 
//         display: 'flex', 
//         flexDirection: 'column', 
//         alignItems:'center',
//         height: '100%',
//         justifyContent: 'flex-start',
//         visibility: isCollapsed ? 'hidden' : 'visible',
//         opacity: isCollapsed ? 0 : 1,
//         transition: 'visibility 0.3s, opacity 0.3s',
//       }}>
//         <IconButton
//           onClick={() => document.getElementById('file-upload')?.click()}
//           sx={{
//             backgroundColor: '#E4D96F',
//             color: 'grey',
//             borderRadius: '8px',
//             width: '3rem',
//             height: '3rem',
//             mb: 2,
//             transition: 'all 0.3s ease',
//             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//             '&:hover': {
//               backgroundColor: '#D6CB61',
//               transform: 'translateY(-2px)',
//               boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
//             },
//             '&:active': {
//               transform: 'translateY(1px)',
//               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//             },
//           }}
//         >
//           <CloudUploadOutlinedIcon />
//         </IconButton>
//         <IconButton
//           onClick={generateSummary}
//           sx={{
//             backgroundColor: '#E4D96F',
//             color: 'grey',
//             borderRadius: '8px',
//             width: '3rem',
//             height: '3rem',
//             mb: 2,
//             transition: 'all 0.3s ease',
//             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//             '&:hover': {
//               backgroundColor: '#D6CB61',
//               transform: 'translateY(-2px)',
//               boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
//             },
//             '&:active': {
//               transform: 'translateY(1px)',
//               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//             },
//           }}
//         >
//           <SummarizeOutlinedIcon />
//         </IconButton>
//         <IconButton
//           onClick={handleContextMenuOpen}
//           sx={{
//             backgroundColor: '#E4D96F',
//             color: 'grey',
//             borderRadius: '8px',
//             width: '3rem',
//             height: '3rem',
//             mb: 2,
//             transition: 'all 0.3s ease',
//             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//             '&:hover': {
//               backgroundColor: '#D6CB61',
//               transform: 'translateY(-2px)',
//               boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
//             },
//             '&:active': {
//               transform: 'translateY(1px)',
//               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//             },
//           }}
//         >
//           <SettingsOutlinedIcon />
//         </IconButton>
//         <IconButton
//           onClick={onTogglePDFViewer}
//           sx={{
//             backgroundColor: isPDFViewerOpen ? '#D6CB61' : '#E4D96F',
//             color: 'grey',
//             borderRadius: '8px',
//             width: '3rem',
//             height: '3rem',
//             mb: 2,
//             transition: 'all 0.3s ease',
//             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//             '&:hover': {
//               backgroundColor: isPDFViewerOpen ? '#C8BE54' : '#D6CB61',
//               transform: 'translateY(-2px)',
//               boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
//             },
//             '&:active': {
//               transform: 'translateY(1px)',
//               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//             },
//           }}
//         >
//           <PictureAsPdfIcon />
//         </IconButton>
//         <input
//           type="file"
//           onChange={handleFileChange}
//           style={{ display: 'none' }}
//           id="file-upload"
//           multiple
//         />
//       </Box>
//       <List sx={{ overflow: 'auto', flexGrow: 1, maxHeight: '30%', width: '100%', mt: 2, fontSize: '0.75rem' }}>
//         {uploadedFiles.map((file, index) => (
//           <ListItem key={index}>
//             <ListItemText 
//               primary={file.name} 
//               secondary={`${(file.size / 1024).toFixed(2)} KB`}
//               primaryTypographyProps={{ sx: { fontSize: '0.75rem' } }}
//               secondaryTypographyProps={{ sx: { fontSize: '0.6rem' } }}
//             />
//           </ListItem>
//         ))}
//       </List>
//       <Dialog open={isSummaryOpen} onClose={() => setIsSummaryOpen(false)}>
//         <DialogTitle>Conversation Summary</DialogTitle>
//         <DialogContent>
//           <Typography>{summary}</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setIsSummaryOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//       <Menu
//         anchorEl={contextMenuAnchor}
//         open={Boolean(contextMenuAnchor)}
//         onClose={handleContextMenuClose}
//       >
//         <MenuItem disabled>
//           <Typography variant="subtitle2">Current Context: {currentContext}</Typography>
//         </MenuItem>
//         {contextOptions.map((context) => (
//           <MenuItem 
//             key={context} 
//             onClick={() => handleContextChange(context)}
//             selected={context === currentContext}
//           >
//             {context}
//           </MenuItem>
//         ))}
//       </Menu>
//     </Paper>
//   )
// }




import React, { useState } from 'react';
import { 
  Paper, 
  IconButton, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Menu, 
  MenuItem, 
  Box 
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface RightSidebarProps {
  messages: { role: string; content: string }[];
  currentContext: string;
  onContextChange: (context: string) => void;
  onTogglePDFViewer: () => void;
  isPDFViewerOpen: boolean;
}

const contextOptions = [
  'General',
  'Scientific Research',
  'Literature Review',
  'Data Analysis',
  'Technical Writing',
  'Academic Writing',
];

export default function RightSidebar({ 
  messages, 
  currentContext, 
  onContextChange, 
  onTogglePDFViewer, 
  isPDFViewerOpen 
}: RightSidebarProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  const generateSummary = () => {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    const summary = userMessages.join(' ').slice(0, 200) + '...';
    setSummary(summary);
    setIsSummaryOpen(true);
  };

  const handleContextMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setContextMenuAnchor(event.currentTarget);
  };

  const handleContextMenuClose = () => {
    setContextMenuAnchor(null);
  };

  const handleContextChange = (context: string) => {
    onContextChange(context);
    handleContextMenuClose();
  };

  return (
    <Paper 
      elevation={8}
      sx={{
        width: 76,
        backgroundColor: '#C0C0C0',
        borderRadius: '16px 0 0 16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        right: 0,
        top: 64,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 1100,
        transform: 'translateZ(0)', // Prevent layout shifts
        willChange: 'transform', // Optimize for animations
        '&:hover': {
          '& .MuiIconButton-root': {
            transform: 'none', // Prevent button hover animations from affecting parent
          }
        }
      }}
    >
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-start',
      }}>
        <IconButton
          onClick={() => document.getElementById('file-upload')?.click()}
          sx={{
            backgroundColor: '#E4D96F',
            color: 'grey',
            borderRadius: '8px',
            width: '3rem',
            height: '3rem',
            mb: 2,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#D6CB61',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <CloudUploadOutlinedIcon />
        </IconButton>
        <IconButton
          onClick={generateSummary}
          sx={{
            backgroundColor: '#E4D96F',
            color: 'grey',
            borderRadius: '8px',
            width: '3rem',
            height: '3rem',
            mb: 2,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#D6CB61',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <SummarizeOutlinedIcon />
        </IconButton>
        <IconButton
          onClick={handleContextMenuOpen}
          sx={{
            backgroundColor: '#E4D96F',
            color: 'grey',
            borderRadius: '8px',
            width: '3rem',
            height: '3rem',
            mb: 2,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#D6CB61',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton
          onClick={onTogglePDFViewer}
          sx={{
            backgroundColor: isPDFViewerOpen ? '#D6CB61' : '#E4D96F',
            color: 'grey',
            borderRadius: '8px',
            width: '3rem',
            height: '3rem',
            mb: 2,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: isPDFViewerOpen ? '#C8BE54' : '#D6CB61',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <PictureAsPdfIcon />
        </IconButton>
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
          multiple
        />

        <List sx={{ 
          overflow: 'auto', 
          flexGrow: 1, 
          maxHeight: '30%', 
          width: '100%', 
          mt: 2, 
          fontSize: '0.75rem',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
        }}>
          {uploadedFiles.map((file, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={file.name} 
                secondary={`${(file.size / 1024).toFixed(2)} KB`}
                primaryTypographyProps={{ sx: { fontSize: '0.75rem' } }}
                secondaryTypographyProps={{ sx: { fontSize: '0.6rem' } }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Dialog open={isSummaryOpen} onClose={() => setIsSummaryOpen(false)}>
        <DialogTitle>Conversation Summary</DialogTitle>
        <DialogContent>
          <Typography>{summary}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSummaryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={handleContextMenuClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Current Context: {currentContext}</Typography>
        </MenuItem>
        {contextOptions.map((context) => (
          <MenuItem 
            key={context} 
            onClick={() => handleContextChange(context)}
            selected={context === currentContext}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(228, 217, 111, 0.1)',
              },
              '&:hover': {
                backgroundColor: 'rgba(228, 217, 111, 0.2)',
              }
            }}
          >
            {context}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}