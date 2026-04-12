import React from 'react';
import { Box, Paper, Typography, Stack, IconButton } from '@mui/material';
import {
  Description as FileIcon,
  Visibility as PreviewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { CandidateDocument } from '../../models/candidate';

interface FileStatusBoxProps {
  document: CandidateDocument;
  onPreview: (id: number) => void;
  onDelete: (id: number) => void;
}

const FileStatusBox: React.FC<FileStatusBoxProps> = ({ document, onPreview, onDelete }) => {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>
          UPLOADED ON {new Date(document.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
        </Typography>
      </Box>
      <Paper elevation={0} sx={{
        p: 1.25,
        bgcolor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #f1f5f9',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 1.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: '#f1f5f9',
          borderColor: '#e2e8f0'
        }
      }}>
        {/* FILE ICON */}
        <Box sx={{ p: 0.75, bgcolor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexShrink: 0 }}>
          <FileIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
        </Box>

        {/* FILENAME & SIZE */}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 700, 
            color: 'secondary.main', 
            fontSize: '0.8rem',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word'
          }}>
            {document.document_name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mt: 0.25 }}>
            {(document.file_size ? (document.file_size / 1024).toFixed(0) + ' KB' : 'PDF Document')}
          </Typography>
        </Box>

        {/* ACTIONS */}
        <Stack direction="row" spacing={0.25} sx={{ borderLeft: '1px solid #e2e8f0', pl: 1, ml: 0.5, flexShrink: 0 }}>
          <IconButton
            size="small"
            onClick={() => onPreview(document.id)}
            sx={{ color: 'primary.main', p: 0.5, '&:hover': { bgcolor: 'rgba(0,126,185,0.08)' } }}
          >
            <PreviewIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(document.id)}
            sx={{ p: 0.5, '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
};

export default FileStatusBox;
