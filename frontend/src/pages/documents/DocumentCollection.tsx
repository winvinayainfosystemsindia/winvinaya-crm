import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateById, fetchDocuments, uploadDocument, deleteDocument, clearError } from '../../store/slices/candidateSlice';
import authService from '../../services/authService';


const REQUIRED_DOCUMENTS = [
  { type: 'resume', label: 'Resume', description: 'Updated CV/Resume' },
  { type: '10th_certificate', label: '10th Certificate', description: 'Class 10 Marksheet' },
  { type: '12th_certificate', label: '12th Certificate', description: 'Class 12 Marksheet' },
  { type: 'degree_certificate', label: 'Degree Certificate', description: 'UG/PG Degree Certificate' },
  { type: 'disability_certificate', label: 'Disability Certificate', description: 'Valid Disability Certificate' }
];

const DocumentCollection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { selectedCandidate: candidate, loading, error } = useAppSelector((state) => state.candidates);
  const documents = candidate?.documents || [];

  const [uploading, setUploading] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchCandidateById({ publicId: id, withDetails: true }));
      dispatch(fetchDocuments(id));
    }
  }, [id, dispatch]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploading(type);
      setLocalError(null);
      const docType = type as 'resume' | 'disability_certificate' | '10th_certificate' | '12th_certificate' | 'degree_certificate' | 'other';
      await dispatch(uploadDocument({ publicId: id, documentType: docType, file })).unwrap();
    } catch (err: any) {
      console.error('Upload error:', err);
      setLocalError(err || 'Failed to upload document. Please check file type and size.');
    } finally {
      setUploading(null);
      event.target.value = '';
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await dispatch(deleteDocument({ publicId: id!, documentId })).unwrap();
    } catch (err: any) {
      console.error('Delete error:', err);
      setLocalError(err || 'Failed to delete document');
    }
  };

  const getDocumentForType = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  const handlePreview = (docId: number) => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${apiUrl}/api/v1/candidates/documents/${docId}/download?token=${token}&disposition=inline`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error previewing document:', err);
    }
  };

  const handleDownload = (docId: number) => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      // Default disposition is attachment, so we don't strictly need to pass it, but being explicit is good
      const url = `${apiUrl}/api/v1/candidates/documents/${docId}/download?token=${token}&disposition=attachment`;

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ''); // Attribute helps some browsers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.document_type === type);
    if (!doc) return <Chip label="Pending" size="small" color="warning" variant="outlined" />;

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip icon={<CheckCircleIcon />} label="Uploaded" size="small" color="success" />
          <Typography variant="caption" color="text.secondary">
            {new Date(doc.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f8f9fa', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', minWidth: '150px' }}>
            <FileIcon color="action" fontSize="small" />
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" noWrap title={doc.document_name} sx={{ fontWeight: 500, maxWidth: '180px' }}>
                {doc.document_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(doc.file_size ? (doc.file_size / 1024).toFixed(0) + ' KB' : 'Unknown size')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              onClick={() => handlePreview(doc.id)}
              sx={{ minWidth: 0, px: 1 }}
              title="Preview"
            >
              Preview
            </Button>
            <Button
              size="small"
              onClick={() => handleDownload(doc.id)}
              sx={{ minWidth: 0, px: 1 }}
              title="Download"
            >
              <DownloadIcon fontSize="small" />
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => handleDelete(doc.id)}
              sx={{ minWidth: 0, px: 1 }}
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  };

  if (loading && !candidate) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!candidate) {
    return (
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {localError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>{localError}</Alert>}
        <Typography variant="h6">Candidate not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/candidates/documents')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/candidates/documents')}
          sx={{ mb: 2 }}
        >
          Back to Candidates
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 300,
            color: '#232f3e',
            mb: 0.5
          }}
        >
          Document Collection
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {candidate.name} ({candidate.email})
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {REQUIRED_DOCUMENTS.map((docType) => {
          const existingDoc = getDocumentForType(docType.type);

          return (
            <Box key={docType.type} sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'start' },
                    gap: 2,
                    mb: 2
                  }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {docType.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {docType.description}
                      </Typography>
                    </Box>
                    <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
                      {getDocumentStatus(docType.type)}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {!existingDoc && (
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={uploading === docType.type ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                      disabled={uploading === docType.type}
                      fullWidth
                    >
                      Upload {docType.label}
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileUpload(e, docType.type)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box >
  );
};

export default DocumentCollection;
