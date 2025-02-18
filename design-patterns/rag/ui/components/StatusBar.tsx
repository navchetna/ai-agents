import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface StatusBarProps {
  tokensPerSecond: number;
  latency: number;
  responseMetrics: {
    good: number;
    bad: number;
    ok: number;
  };
  inputTokens: number;
  outputTokens: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  tokensPerSecond,
  latency,
  responseMetrics,
  inputTokens,
  outputTokens
}) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        backgroundColor: '#DDD700',
        padding: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <Box>
        <Typography variant="body2" color="text.primary">
          Tokens/Second: {tokensPerSecond.toFixed(2)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" color="text.primary">
          Latency: {latency.toFixed(2)}ms
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" color="text.primary">
          Response Metrics: Good {responseMetrics.good}, Bad {responseMetrics.bad}, Ok {responseMetrics.ok}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" color="text.primary">
          Input Tokens: {inputTokens}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" color="text.primary">
          Output Tokens: {outputTokens}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatusBar;

