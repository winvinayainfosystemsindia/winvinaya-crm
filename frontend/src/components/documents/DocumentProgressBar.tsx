import React from 'react';
import { Box, Stack, Typography, LinearProgress } from '@mui/material';

interface DocumentProgressBarProps {
  uploadedCount: number;
  totalRequired: number;
}

const DocumentProgressBar: React.FC<DocumentProgressBarProps> = ({ uploadedCount, totalRequired }) => {
  const progressPercent = totalRequired > 0 ? (uploadedCount / totalRequired) * 100 : 0;

  return (
    <Box sx={{ minWidth: { xs: '100%', md: 300 } }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>
          Collection Progress
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'accent.main' }}>
          {uploadedCount} / {totalRequired} Collected
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: 'accent.main' }
        }}
      />
    </Box>
  );
};

export default DocumentProgressBar;
