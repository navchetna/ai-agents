import React, { useState } from 'react';
import { Paper, Typography, Tabs, Tab, Box } from '@mui/material';

interface Document {
  name: string;
  url: string;
}

interface PDFViewerProps {
  documents: Document[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({ documents }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substr(0, maxLength - 3) + '...';
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="PDF document tabs"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {documents.map((doc, index) => (
          <Tab key={index} label={truncateName(doc.name, 12)} />
        ))}
      </Tabs>
      <Box sx={{ flexGrow: 1 }}>
        {documents.length > 0 ? (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(documents[selectedTab].url)}&embedded=true`}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <Typography variant="h6" sx={{ p: 2 }}>No documents available</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default PDFViewer;

