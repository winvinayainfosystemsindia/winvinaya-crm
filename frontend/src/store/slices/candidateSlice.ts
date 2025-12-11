import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import candidateService, { profileService, documentService, counselingService } from '../../services/candidateService';
import type {
	Candidate,
	CandidateListItem,
	CandidateCreate,
	CandidateUpdate,
	CandidateProfileCreate,
	CandidateCounselingCreate
} from '../../models/candidate';

interface CandidateState {
	list: CandidateListItem[];
	selectedCandidate: Candidate | null;
	loading: boolean;
	error: string | null;
}

const initialState: CandidateState = {
	list: [],
	selectedCandidate: null,
	loading: false,
	error: null,
};

// ======================
// CANDIDATE OPERATIONS
// ======================

export const fetchCandidates = createAsyncThunk(
	'candidates/fetchAll',
	async (_, { rejectWithValue }) => {
		try {
			const response = await candidateService.getAll();
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates');
		}
	}
);

export const fetchCandidateById = createAsyncThunk(
	'candidates/fetchById',
	async ({ publicId, withDetails = true }: { publicId: string; withDetails?: boolean }, { rejectWithValue }) => {
		try {
			const response = await candidateService.getById(publicId, withDetails);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidate');
		}
	}
);

export const createCandidate = createAsyncThunk(
	'candidates/create',
	async (candidate: CandidateCreate, { rejectWithValue }) => {
		try {
			const response = await candidateService.create(candidate);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create candidate');
		}
	}
);

export const updateCandidate = createAsyncThunk(
	'candidates/update',
	async ({ publicId, data }: { publicId: string; data: CandidateUpdate }, { rejectWithValue }) => {
		try {
			const response = await candidateService.update(publicId, data);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update candidate');
		}
	}
);

export const deleteCandidate = createAsyncThunk(
	'candidates/delete',
	async (publicId: string, { rejectWithValue }) => {
		try {
			await candidateService.delete(publicId);
			return publicId;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to delete candidate');
		}
	}
);

// ======================
// PROFILE OPERATIONS
// ======================

export const createProfile = createAsyncThunk(
	'candidates/createProfile',
	async ({ publicId, profile }: { publicId: string; profile: CandidateProfileCreate }, { rejectWithValue }) => {
		try {
			const response = await profileService.create(publicId, profile);
			return { publicId, profile: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create profile');
		}
	}
);

export const updateProfile = createAsyncThunk(
	'candidates/updateProfile',
	async ({ publicId, profile }: { publicId: string; profile: Partial<CandidateProfileCreate> }, { rejectWithValue }) => {
		try {
			const response = await profileService.update(publicId, profile);
			return { publicId, profile: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
		}
	}
);

// ======================
// DOCUMENT OPERATIONS
// ======================

export const uploadDocument = createAsyncThunk(
	'candidates/uploadDocument',
	async (
		{
			publicId,
			documentType,
			file,
			description,
		}: {
			publicId: string;
			documentType: 'resume' | 'disability_certificate' | 'other';
			file: File;
			description?: string;
		},
		{ rejectWithValue }
	) => {
		try {
			const response = await documentService.upload(publicId, documentType, file, description);
			return { publicId, document: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
		}
	}
);

export const fetchDocuments = createAsyncThunk(
	'candidates/fetchDocuments',
	async (publicId: string, { rejectWithValue }) => {
		try {
			const response = await documentService.getAll(publicId);
			return { publicId, documents: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
		}
	}
);

export const deleteDocument = createAsyncThunk(
	'candidates/deleteDocument',
	async ({ publicId, documentId }: { publicId: string; documentId: number }, { rejectWithValue }) => {
		try {
			await documentService.delete(documentId);
			return { publicId, documentId };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
		}
	}
);

// ======================
// COUNSELING OPERATIONS
// ======================

export const createCounseling = createAsyncThunk(
	'candidates/createCounseling',
	async ({ publicId, counseling }: { publicId: string; counseling: CandidateCounselingCreate }, { rejectWithValue }) => {
		try {
			const response = await counselingService.create(publicId, counseling);
			return { publicId, counseling: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create counseling record');
		}
	}
);

export const updateCounseling = createAsyncThunk(
	'candidates/updateCounseling',
	async ({ publicId, counseling }: { publicId: string; counseling: Partial<CandidateCounselingCreate> }, { rejectWithValue }) => {
		try {
			const response = await counselingService.update(publicId, counseling);
			return { publicId, counseling: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update counseling record');
		}
	}
);

// ======================
// SLICE
// ======================

const candidateSlice = createSlice({
	name: 'candidates',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		clearSelectedCandidate: (state) => {
			state.selectedCandidate = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch all candidates
			.addCase(fetchCandidates.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<CandidateListItem[]>) => {
				state.loading = false;
				state.list = action.payload;
			})
			.addCase(fetchCandidates.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch single candidate
			.addCase(fetchCandidateById.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCandidateById.fulfilled, (state, action: PayloadAction<Candidate>) => {
				state.loading = false;
				state.selectedCandidate = action.payload;
			})
			.addCase(fetchCandidateById.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create candidate
			.addCase(createCandidate.fulfilled, (state) => {
				state.loading = false;
				// Refresh list after creation
			})

			// Update candidate
			.addCase(updateCandidate.fulfilled, (state, action: PayloadAction<Candidate>) => {
				state.loading = false;
				if (state.selectedCandidate?.public_id === action.payload.public_id) {
					state.selectedCandidate = action.payload;
				}
			})

			// Delete candidate
			.addCase(deleteCandidate.fulfilled, (state, action: PayloadAction<string>) => {
				state.loading = false;
				state.list = state.list.filter(c => c.public_id !== action.payload);
			})

			// Profile operations
			.addCase(createProfile.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					state.selectedCandidate.profile = action.payload.profile;
				}
			})
			.addCase(updateProfile.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					state.selectedCandidate.profile = action.payload.profile;
				}
			})

			// Document operations
			.addCase(uploadDocument.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					if (!state.selectedCandidate.documents) {
						state.selectedCandidate.documents = [];
					}
					state.selectedCandidate.documents.push(action.payload.document);
				}
			})
			.addCase(fetchDocuments.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					state.selectedCandidate.documents = action.payload.documents;
				}
			})
			.addCase(deleteDocument.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId && state.selectedCandidate.documents) {
					state.selectedCandidate.documents = state.selectedCandidate.documents.filter(
						d => d.id !== action.payload.documentId
					);
				}
			})

			// Counseling operations
			.addCase(createCounseling.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					state.selectedCandidate.counseling = action.payload.counseling;
				}
			})
			.addCase(updateCounseling.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					state.selectedCandidate.counseling = action.payload.counseling;
				}
			});
	},
});

export const { clearError, clearSelectedCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;

