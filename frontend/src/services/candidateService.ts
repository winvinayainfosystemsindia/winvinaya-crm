import api from './api';
import type {
	Candidate,
	CandidateCreate,
	CandidateUpdate,
	CandidateScreening,
	CandidateScreeningCreate,
	CandidateDocument,
	CandidateDocumentCreate,
	CandidateCounseling,
	CandidateCounselingCreate,
	CandidateStats,
	CandidatePaginatedResponse
} from '../models/candidate';

// ======================
// CANDIDATE SERVICE
// ======================
const candidateService = {
	/**
	 * Get all candidates (simplified list)
	 */
	getAll: async (skip = 0, limit = 100, search?: string): Promise<CandidatePaginatedResponse> => {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await api.get<CandidatePaginatedResponse>(`/candidates/?skip=${skip}&limit=${limit}${searchParam}`);
		return response.data;
	},

	/**
	 * Get candidate statistics
	 */
	getStats: async (): Promise<CandidateStats> => {
		const response = await api.get<CandidateStats>('/candidates/stats');
		return response.data;
	},

	/**
	 * Get candidate by public_id (UUID)
	 * @param publicId - UUID of the candidate
	 * @param withDetails - Include profile, documents, and counseling data
	 */
	getById: async (publicId: string, withDetails = true): Promise<Candidate> => {
		const response = await api.get<Candidate>(`/candidates/${publicId}?with_details=${withDetails}`);
		return response.data;
	},

	/**
	 * Register new candidate (public endpoint)
	 */
	create: async (candidate: CandidateCreate): Promise<Candidate> => {
		const response = await api.post<Candidate>('/candidates/', candidate);
		return response.data;
	},

	/**
	 * Update candidate by public_id (UUID)
	 */
	update: async (publicId: string, candidate: CandidateUpdate): Promise<Candidate> => {
		const response = await api.put<Candidate>(`/candidates/${publicId}`, candidate);
		return response.data;
	},

	/**
	 * Delete candidate by public_id (UUID)
	 */
	delete: async (public_id: string): Promise<void> => {
		await api.delete(`/candidates/${public_id}`);
	},

	/**
	 * Get unscreened candidates
	 */
	getUnscreened: async (skip = 0, limit = 100, search?: string): Promise<CandidatePaginatedResponse> => {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await api.get<CandidatePaginatedResponse>(`/candidates/unscreened?skip=${skip}&limit=${limit}${searchParam}`);
		return response.data;
	},

	/**
	 * Get screened candidates (with screening data)
	 */
	getScreened: async (skip = 0, limit = 100, counselingStatus?: string, search?: string): Promise<CandidatePaginatedResponse> => {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await api.get<CandidatePaginatedResponse>(`/candidates/screened?skip=${skip}&limit=${limit}${counselingStatus ? `&counseling_status=${counselingStatus}` : ''}${searchParam}`);
		return response.data;
	},

	/**
	 * Get profiled candidates (alias for getScreened for backward compatibility)
	 */
	getProfiled: async (skip = 0, limit = 100, counselingStatus?: string): Promise<CandidatePaginatedResponse> => {
		return candidateService.getScreened(skip, limit, counselingStatus);
	}
};

// ======================
// SCREENING SERVICE
// ======================
export const screeningService = {
	/**
	 * Create screening for a candidate
	 */
	create: async (publicId: string, screening: CandidateScreeningCreate): Promise<CandidateScreening> => {
		const response = await api.post<CandidateScreening>(`/candidates/${publicId}/screening`, screening);
		return response.data;
	},

	/**
	 * Update candidate screening
	 */
	update: async (publicId: string, screening: Partial<CandidateScreeningCreate>): Promise<CandidateScreening> => {
		const response = await api.put<CandidateScreening>(`/candidates/${publicId}/screening`, screening);
		return response.data;
	},

	/**
	 * Delete candidate screening
	 */
	delete: async (publicId: string): Promise<void> => {
		await api.delete(`/candidates/${publicId}/screening`);
	}
};

// ======================
// DOCUMENT SERVICE
// ======================
export const documentService = {
	/**
	 * Upload document file for a candidate
	 */
	upload: async (
		publicId: string,
		documentType: string,
		file: File,
		description?: string
	): Promise<CandidateDocument> => {
		const formData = new FormData();
		formData.append('document_type', documentType);
		formData.append('file', file);
		if (description) {
			formData.append('description', description);
		}

		// Use multipart/form-data for file uploads.
		// Axios will automatically add the boundary if we provide the header.
		const response = await api.post<CandidateDocument>(
			`/candidates/${publicId}/documents/upload`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	},

	/**
	 * Create document with manual file path
	 */
	create: async (publicId: string, document: CandidateDocumentCreate): Promise<CandidateDocument> => {
		const response = await api.post<CandidateDocument>(`/candidates/${publicId}/documents`, document);
		return response.data;
	},

	/**
	 * Get all documents for a candidate
	 */
	getAll: async (publicId: string): Promise<CandidateDocument[]> => {
		const response = await api.get<CandidateDocument[]>(`/candidates/${publicId}/documents`);
		return response.data;
	},

	/**
	 * Update document metadata
	 */
	update: async (documentId: number, document: Partial<CandidateDocumentCreate>): Promise<CandidateDocument> => {
		const response = await api.put<CandidateDocument>(`/candidates/documents/${documentId}`, document);
		return response.data;
	},

	/**
	 * Download document file
	 */
	download: async (documentId: number): Promise<Blob> => {
		const response = await api.get(`/candidates/documents/${documentId}/download`, {
			responseType: 'blob',
		});
		return response.data;
	},

	/**
	 * Delete document and its file
	 */
	delete: async (documentId: number): Promise<void> => {
		await api.delete(`/candidates/documents/${documentId}`);
	}
};

// ======================
// COUNSELING SERVICE
// ======================
export const counselingService = {
	/**
	 * Create counseling record for a candidate
	 */
	create: async (publicId: string, counseling: CandidateCounselingCreate): Promise<CandidateCounseling> => {
		const response = await api.post<CandidateCounseling>(`/candidates/${publicId}/counseling`, counseling);
		return response.data;
	},

	/**
	 * Update counseling record
	 */
	update: async (publicId: string, counseling: Partial<CandidateCounselingCreate>): Promise<CandidateCounseling> => {
		const response = await api.put<CandidateCounseling>(`/candidates/${publicId}/counseling`, counseling);
		return response.data;
	},

	/**
	 * Delete counseling record
	 */
	delete: async (publicId: string): Promise<void> => {
		await api.delete(`/candidates/${publicId}/counseling`);
	}
};

export default candidateService;

