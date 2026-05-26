import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  type SelectChangeEvent,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const REPORTS = {
  sourcing: "https://app.powerbi.com/view?r=eyJrIjoiYWVjYTkyNWMtOWUzYS00YTE2LWJhMTMtOWQ5ZWY1NmUyMmYxIiwidCI6ImNkMzY0NTJmLWFjMzQtNDRhNS1iZTMzLThiYWE4MDFhM2ZmZCJ9",
  timesheet: "https://app.powerbi.com/view?r=eyJrIjoiOWFmMDU0NjMtZmMxNC00NGJiLWIwOGMtMDIxYzdlYWNjOTQ0IiwidCI6ImNkMzY0NTJmLWFjMzQtNDRhNS1iZTMzLThiYWE4MDFhM2ZmZCJ9"
} as const;

type ReportType = keyof typeof REPORTS;

const BIReport: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('sourcing');
  const [loading, setLoading] = useState<boolean>(true);

  const handleReportChange = useCallback((event: SelectChangeEvent) => {
    setReportType(event.target.value as ReportType);
    setLoading(true);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleFullscreen = useCallback(() => {
    window.open(REPORTS[reportType], '_blank');
  }, [reportType]);

  return (
    <Paper
      elevation={0}
      variant="outlined"
      component="section"
      aria-labelledby="bi-report-title"
      sx={{
        width: '100%',
        mb: 2,
        borderRadius: 1.5,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '500px'
      }}
    >
      {/* Enterprise-style Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon sx={{ color: 'text.secondary' }} fontSize="small" />
          <Typography
            variant="subtitle1"
            id="bi-report-title"
            component="h2"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1rem',
            }}
          >
            Business Intelligence
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper' }}>
            <Select
              value={reportType}
              onChange={handleReportChange}
              inputProps={{ 'aria-label': 'Select Report Type' }}
              sx={{
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'text.primary',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="sourcing">MIS Analytics</MenuItem>
              <MenuItem value="timesheet">Timesheet Analytics</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Open in Fullscreen">
            <IconButton
              size="small"
              onClick={handleFullscreen}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'action.hover'
                }
              }}
            >
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content Area with Loading Overlay */}
      <Box sx={{ flexGrow: 1, width: '100%', position: 'relative', bgcolor: 'background.default', minHeight: '450px' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(2px)',
              zIndex: 1,
            }}
          >
            <CircularProgress size={40} sx={{ color: 'primary.main' }} />
          </Box>
        )}
        <iframe
          title={`${reportType} PowerBI Dashboard`}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '450px', display: 'block', position: 'absolute', top: 0, left: 0 }}
          src={REPORTS[reportType]}
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      </Box>
    </Paper>
  );
};

export default BIReport;
