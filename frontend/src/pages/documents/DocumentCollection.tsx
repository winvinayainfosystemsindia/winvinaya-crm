import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Alert, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import {
  fetchCandidateById,
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  clearError
} from '../../store/slices/candidateSlice';
import authService from '../../services/authService';
import { documentService } from '../../services/candidateService';
import { REQUIRED_DOCUMENTS, type RequiredDocument } from '../../components/documents/forms/documentConfig';
import type { CandidateDocument } from '../../models/candidate';

// Modular Components
import DocumentHeader from '../../components/documents/forms/DocumentHeader';
import DocumentProgressBar from '../../components/documents/progress/DocumentProgressBar';
import DocumentCard from '../../components/documents/forms/DocumentCard';

const DocumentCollection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();

  const { selectedCandidate: candidate, error } = useSelector((state: RootState) => state.candidates);
  const documents = candidate?.documents || [];
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchCandidateById({ publicId: id }));
      dispatch(fetchDocuments(id));
    }
  }, [id, dispatch]);

  // Logic: File Filter (Required vs Uploaded)
  const filteredRequiredDocs = REQUIRED_DOCUMENTS.filter((doc: RequiredDocument) => {
    if (doc.roles?.includes('disabled') && candidate?.disability_details?.disability_type === 'None') return false;
    return true;
  });

  const uploadedCount = filteredRequiredDocs.filter((req: RequiredDocument) => {
    if (req.type === 'trainer_resume') {
      return documents.some((d: CandidateDocument) => d.document_type === 'resume' && d.document_source === 'trainer');
    }
    if (req.type === 'resume') {
      return documents.some((d: CandidateDocument) => d.document_type === 'resume' && d.document_source === 'candidate');
    }
    return documents.some((d: CandidateDocument) => d.document_type === req.type);
  }).length;

  // Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file && id) {
      setUploading(type);
      try {
        const documentSource = type === 'trainer_resume' ? 'trainer' : 'candidate';
        // Note: For 'trainer_resume' type in UI, we still want it to be stored as 'resume' in backend but with 'trainer' source
        const backendType = type === 'trainer_resume' ? 'resume' : type;
        
        await dispatch(uploadDocument({ 
          publicId: id, 
          documentType: backendType as any, 
          file, 
          documentSource 
        })).unwrap();
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setUploading(null);
      }
    }
  };

  const handleDelete = async (documentId: number) => {
    if (window.confirm('Are you sure you want to delete this document?') && id) {
      try {
        await dispatch(deleteDocument({ publicId: id, documentId })).unwrap();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handlePreview = (documentId: number) => {
    const token = authService.getAccessToken();
    const url = documentService.getPreviewUrl(documentId, token);
    if (url) window.open(url, '_blank');
  };

  const handleDownload = (documentId: number) => {
    const token = authService.getAccessToken();
    const url = documentService.getDownloadUrl(documentId, token);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDocumentForType = (type: string) => {
    if (type === 'trainer_resume') {
      return documents.find((d: CandidateDocument) => d.document_type === 'resume' && d.document_source === 'trainer');
    }
    if (type === 'resume') {
      return documents.find((d: CandidateDocument) => d.document_type === 'resume' && d.document_source === 'candidate');
    }
    return documents.find((d: CandidateDocument) => d.document_type === type);
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <DocumentHeader candidate={candidate} onBack={() => navigate(-1)}>
        <DocumentProgressBar
          uploadedCount={uploadedCount}
          totalRequired={filteredRequiredDocs.length}
        />
      </DocumentHeader>

      <Box sx={{ mt: -5, px: isMobile ? 2 : 4, pb: 6 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: '#fef2f2' }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {filteredRequiredDocs.map((docType: RequiredDocument) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={docType.type}>
                <DocumentCard
                  docType={docType}
                  existingDoc={getDocumentForType(docType.type)}
                  uploading={uploading}
                  onUpload={handleFileUpload}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentCollection;
