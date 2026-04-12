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
  useMediaQuery,
  LinearProgress,
  Stack,
  Avatar,
  Divider,
  Grid,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Badge as IDIcon,
  School as EducationIcon,
  Article as ResumeIcon,
  Verified as VerifiedIcon,
  Preview as PreviewIcon,
  HistoryEdu as MetaIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateById, fetchDocuments, uploadDocument, deleteDocument, clearError } from '../../store/slices/candidateSlice';
import authService from '../../services/authService';


const REQUIRED_DOCUMENTS = [
  { type: 'resume', label: 'Resume', description: 'Updated CV/Resume', icon: <ResumeIcon sx={{ color: '#007eb9' }} /> },
  { type: '10th_certificate', label: '10th Certificate', description: 'Class 10 Marksheet', icon: <EducationIcon sx={{ color: '#1a73e8' }} /> },
  { type: '12th_certificate', label: '12th Certificate', description: 'Class 12 Marksheet', icon: <EducationIcon sx={{ color: '#1a73e8' }} /> },
  { type: 'degree_certificate', label: 'Degree Certificate', description: 'UG/PG Degree Certificate', icon: <EducationIcon sx={{ color: '#1a73e8' }} /> },
  { type: 'pan_card', label: 'PAN Card', description: 'PAN Card for ID proof', icon: <IDIcon sx={{ color: '#6b7280' }} /> },
  { type: 'aadhar_card', label: 'Aadhar Card', description: 'Aadhar Card for ID/Address', icon: <IDIcon sx={{ color: '#6b7280' }} /> },
  { type: 'disability_certificate', label: 'Disability Certificate', description: 'Authorized Medical Certificate', icon: <VerifiedIcon sx={{ color: '#059669' }} /> }
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
    if (!doc) return (
      <Chip
        label="Pending"
        size="small"
        variant="outlined"
        sx={{
          bgcolor: '#fff7ed',
          color: '#c2410c',
          borderColor: '#fdba74',
          fontWeight: 800,
          fontSize: '0.65rem',
          height: 20
        }}
      />
    );

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Chip
            icon={<CheckCircleIcon style={{ fontSize: 14, color: '#059669' }} />}
            label="Verified Upload"
            size="small"
            sx={{
              bgcolor: '#f0fdf4',
              color: '#15803d',
              borderColor: '#bbf7d0',
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 20
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
            {new Date(doc.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
          </Typography>
        </Box>
        <Paper elevation={0} sx={{
          p: 1.25,
          bgcolor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1
        }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 0.75, bgcolor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex' }}>
              <FileIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
            </Box>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '0.8rem' }}>
                {doc.document_name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                {(doc.file_size ? (doc.file_size / 1024).toFixed(0) + ' KB' : 'PDF Document')}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => handlePreview(doc.id)}
              sx={{ color: 'primary.main', '&:hover': { bgcolor: 'rgba(0,126,185,0.08)' } }}
            >
              <PreviewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(doc.id)}
              sx={{ '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
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

  const filteredRequiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.type !== 'disability_certificate' || !!candidate?.disability_details?.is_disabled);
  const uploadedCount = filteredRequiredDocs.filter(d => !!getDocumentForType(d.type)).length;
  const progressPercent = (uploadedCount / filteredRequiredDocs.length) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* ENTERPRISE DARK HEADER */}
      <Box sx={{ bgcolor: 'secondary.main', pt: 4, pb: 8, px: isMobile ? 2 : 4, color: '#fff' }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/candidates/documents')}
            sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, textTransform: 'none', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Back to Candidates
          </Button>

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 800 }}>
                {candidate.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
                  Document Verification
                </Typography>
                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.9rem' }}>{candidate.name}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.9rem' }}>{candidate.email}</Typography>
                </Stack>
              </Box>
            </Stack>

            <Box sx={{ minWidth: { xs: '100%', md: 300 } }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Collection Progress</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'primary.main' }}>{uploadedCount} / {filteredRequiredDocs.length} Collected</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: 'primary.main' }
                }}
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* DOCUMENT GRID AREA */}
      <Box sx={{ mt: -5, px: isMobile ? 2 : 4, pb: 6 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: '#fef2f2' }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {filteredRequiredDocs.map((docType) => {
              const existingDoc = getDocumentForType(docType.type);

              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={docType.type}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                        <Box sx={{
                          p: 1.5,
                          bgcolor: '#f1f5f9',
                          borderRadius: '12px',
                          display: 'flex',
                          color: 'secondary.main'
                        }}>
                          {docType.icon}
                        </Box>
                        {getDocumentStatus(docType.type)}
                      </Stack>

                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'secondary.main', mb: 0.5 }}>
                        {docType.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                        {docType.description}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      {!existingDoc ? (
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={uploading === docType.type ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
                          disabled={uploading === docType.type}
                          fullWidth
                          sx={{
                            borderRadius: '10px',
                            py: 1.25,
                            fontWeight: 800,
                            textTransform: 'none',
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          {uploading === docType.type ? 'Uploading...' : `Upload ${docType.label}`}
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, docType.type)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<MetaIcon />}
                          onClick={() => handleDownload(existingDoc.id)}
                          sx={{
                            borderRadius: '10px',
                            py: 1.25,
                            fontWeight: 700,
                            textTransform: 'none',
                            color: 'text.secondary',
                            borderColor: '#e2e8f0'
                          }}
                        >
                          Download Receipt
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentCollection;
