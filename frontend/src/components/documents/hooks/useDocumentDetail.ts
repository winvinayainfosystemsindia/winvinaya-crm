import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
	fetchCandidateById, 
	fetchDocuments, 
	uploadDocument, 
	deleteDocument 
} from '../../../store/slices/candidateSlice';
import { REQUIRED_DOCUMENTS, type RequiredDocument } from '../forms/documentConfig';
import type { CandidateDocument } from '../../../models/candidate';

/**
 * useDocumentDetail - Modular hook for managing candidate document collection.
 * Powered by Redux store slices for state management, avoiding direct service dependencies.
 */
export const useDocumentDetail = (id?: string) => {
	const dispatch = useAppDispatch();
	
	// State from Candidate Slice
	const { selectedCandidate: candidate, error } = useAppSelector((state) => state.candidates);
	const documents = candidate?.documents || [];
	
	// State from Auth Slice for secure file access
	const { token } = useAppSelector((state) => state.auth);
	
	const [uploading, setUploading] = useState<string | null>(null);

	const fetchInitialData = useCallback(() => {
		if (id) {
			dispatch(fetchCandidateById({ publicId: id }));
			dispatch(fetchDocuments(id));
		}
	}, [id, dispatch]);

	useEffect(() => {
		fetchInitialData();
	}, [fetchInitialData]);

	// Logic: Compliance Filtering
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

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
		const file = event.target.files?.[0];
		if (file && id) {
			setUploading(type);
			try {
				const documentSource = type === 'trainer_resume' ? 'trainer' : 'candidate';
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

	/**
	 * handlePreview - Generates an authenticated preview URL using state-managed tokens.
	 */
	const handlePreview = (documentId: number) => {
		if (!token) return;
		const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
		const url = `${apiUrl}/api/v1/candidates/documents/${documentId}/download?token=${token}&disposition=inline`;
		window.open(url, '_blank');
	};

	/**
	 * handleDownload - Generates an authenticated download link using state-managed tokens.
	 */
	const handleDownload = (documentId: number) => {
		if (!token) return;
		const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
		const url = `${apiUrl}/api/v1/candidates/documents/${documentId}/download?token=${token}&disposition=attachment`;
		
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', '');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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

	return {
		candidate,
		error,
		uploading,
		filteredRequiredDocs,
		uploadedCount,
		handleFileUpload,
		handleDelete,
		handlePreview,
		handleDownload,
		getDocumentForType
	};
};
