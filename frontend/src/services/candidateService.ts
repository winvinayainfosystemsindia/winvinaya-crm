import api from './api';
import type {
	Candidate,
	CandidateListItem,
	CandidateCreate,
	CandidateUpdate,
	CandidateProfile,
	CandidateProfileCreate,
	CandidateDocument,
	CandidateDocumentCreate,
	CandidateCounseling,
	CandidateCounselingCreate
} from '../models/candidate';

// ======================
// CANDIDATE SERVICE
// ======================
const candidateService = {
	/**
	 * Get all candidates (simplified list)
	 */
	getAll: async (skip = 0, limit = 100): Promise<CandidateListItem[]> => {
		const response = await api.get<CandidateListItem[]>(`/candidates/?skip=${skip}&limit=${limit}`);
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
	delete: async (publicId: string): Promise<void> => {
		await api.delete(`/candidates/${publicId}`);
	}
};

// ======================
// PROFILE SERVICE
// ======================
export const profileService = {
	/**
	 * Create profile for a candidate
	 */
	create: async (publicId: string, profile: CandidateProfileCreate): Promise<CandidateProfile> => {
		const response = await api.post<CandidateProfile>(`/candidates/${publicId}/profile`, profile);
		return response.data;
	},

	/**
	 * Update candidate profile
	 */
	update: async (publicId: string, profile: Partial<CandidateProfileCreate>): Promise<CandidateProfile> => {
		const response = await api.put<CandidateProfile>(`/candidates/${publicId}/profile`, profile);
		return response.data;
	},

	/**
	 * Delete candidate profile
	 */
	delete: async (publicId: string): Promise<void> => {
		await api.delete(`/candidates/${publicId}/profile`);
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
		documentType: 'resume' | 'disability_certificate' | 'other',
		file: File,
		description?: string
	): Promise<CandidateDocument> => {
		const formData = new FormData();
		formData.append('document_type', documentType);
		formData.append('file', file);
		if (description) {
			formData.append('description', description);
		}

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

