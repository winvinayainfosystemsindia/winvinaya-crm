import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import candidateService, { screeningService, documentService, counselingService } from '../../services/candidateService';
import type {
	Candidate,
	CandidateListItem,
	CandidateCreate,
	CandidateUpdate,
	CandidateScreeningCreate,
	CandidateCounselingCreate,
	CandidateStats,
	CandidatePaginatedResponse
} from '../../models/candidate';

interface CandidateState {
	list: CandidateListItem[];
	total: number;
	selectedCandidate: Candidate | null;
	stats: CandidateStats | null;
	loading: boolean;
	statsLoading: boolean;
	error: string | null;
	filterOptions: {
		disability_types: string[];
		education_levels: string[];
		cities: string[];
		counseling_statuses: string[];
		screening_statuses: string[];
		disability_percentages?: number[];
		screening_reasons?: string[];
	};
}

const initialState: CandidateState = {
	list: [],
	total: 0,
	selectedCandidate: null,
	stats: null,
	loading: false,
	statsLoading: false,
	error: null,
	filterOptions: {
		disability_types: [],
		education_levels: [],
		cities: [],
		counseling_statuses: [],
		screening_statuses: [],
		disability_percentages: [],
		screening_reasons: []
	}
};

// ======================
// CANDIDATE OPERATIONS
// ======================

export const fetchCandidateStats = createAsyncThunk(
	'candidates/fetchStats',
	async (params: { assigned_to_user_id?: number } | void = {}, { rejectWithValue }) => {
		try {
			const { assigned_to_user_id } = (params || {}) as any;
			const response = await candidateService.getStats(assigned_to_user_id);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch candidate stats');
		}
	}
);

export const fetchCandidates = createAsyncThunk(
	'candidates/fetchAll',
	async (
		params: {
			skip?: number;
			limit?: number;
			search?: string;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
			disability_types?: string;
			education_levels?: string;
			cities?: string;
			counseling_status?: string;
			screening_status?: string;
			is_experienced?: boolean;
			disability_percentages?: string;
			screening_reasons?: string;
			gender?: string;
			extraFilters?: Record<string, string>;
		} | void = {},
		{ rejectWithValue }
	) => {
		try {
			const {
				skip,
				limit,
				search,
				sortBy,
				sortOrder,
				disability_types,
				education_levels,
				cities,
				counseling_status,
				screening_status,
				is_experienced,
				disability_percentages,
				screening_reasons,
				gender,
				extraFilters
			} = (params || {}) as any;
			const response = await candidateService.getAll(
				skip,
				limit,
				search,
				sortBy,
				sortOrder,
				disability_types,
				education_levels,
				cities,
				counseling_status,
				screening_status,
				is_experienced,
				disability_percentages,
				screening_reasons,
				gender,
				extraFilters
			);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch candidates');
		}
	}
);

export const fetchUnscreenedCandidates = createAsyncThunk(
	'candidates/fetchUnscreened',
	async (
		params: {
			skip?: number;
			limit?: number;
			search?: string;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
			disability_types?: string;
			education_levels?: string;
			cities?: string;
			screening_status?: string;
			is_experienced?: boolean;
			counseling_status?: string;
		} | void = {},
		{ rejectWithValue }
	) => {
		try {
			const {
				skip,
				limit,
				search,
				sortBy,
				sortOrder,
				disability_types,
				education_levels,
				cities,
				screening_status,
				is_experienced,
				counseling_status
			} = params || {};
			const response = await candidateService.getUnscreened(
				skip,
				limit,
				search,
				sortBy,
				sortOrder,
				disability_types,
				education_levels,
				cities,
				screening_status,
				is_experienced,
				counseling_status
			);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch unscreened candidates');
		}
	}
);

export const fetchScreenedCandidates = createAsyncThunk(
	'candidates/fetchScreened',
	async (
		params: {
			skip?: number;
			limit?: number;
			counselingStatus?: string;
			search?: string;
			documentStatus?: string;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
			disability_types?: string;
			education_levels?: string;
			cities?: string;
			screening_status?: string;
			is_experienced?: boolean;
		} | void = {},
		{ rejectWithValue }
	) => {
		try {
			const {
				skip,
				limit,
				counselingStatus,
				search,
				documentStatus,
				sortBy,
				sortOrder,
				disability_types,
				education_levels,
				cities,
				screening_status,
				is_experienced
			} = params || {};
			const response = await candidateService.getScreened(
				skip,
				limit,
				counselingStatus,
				search,
				documentStatus,
				sortBy,
				sortOrder,
				disability_types,
				education_levels,
				cities,
				screening_status,
				is_experienced
			);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch screened candidates');
		}
	}
);

export const fetchFilterOptions = createAsyncThunk(
	'candidates/fetchFilterOptions',
	async (_, { rejectWithValue }) => {
		try {
			const response = await candidateService.getFilterOptions();
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch filter options');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch candidate');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to create candidate');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update candidate');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to delete candidate');
		}
	}
);

// ======================
// SCREENING OPERATIONS
// ======================

export const createScreening = createAsyncThunk(
	'candidates/createScreening',
	async ({ publicId, screening }: { publicId: string; screening: CandidateScreeningCreate }, { rejectWithValue }) => {
		try {
			const response = await screeningService.create(publicId, screening);
			return { publicId, screening: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to create screening');
		}
	}
);

export const updateScreening = createAsyncThunk(
	'candidates/updateScreening',
	async ({ publicId, screening }: { publicId: string; screening: Partial<CandidateScreeningCreate> }, { rejectWithValue }) => {
		try {
			const response = await screeningService.update(publicId, screening);
			return { publicId, screening: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update screening');
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
			documentType: 'resume' | 'disability_certificate' | '10th_certificate' | '12th_certificate' | 'degree_certificate' | 'other';
			file: File;
			description?: string;
		},
		{ rejectWithValue }
	) => {
		try {
			const response = await documentService.upload(publicId, documentType, file, description);
			return { publicId, document: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to upload document');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch documents');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to delete document');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to create counseling record');
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
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update counseling record');
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
			// Fetch stats
			.addCase(fetchCandidateStats.pending, (state) => {
				state.statsLoading = true;
				state.error = null;
			})
			.addCase(fetchCandidateStats.fulfilled, (state, action: PayloadAction<CandidateStats>) => {
				state.statsLoading = false;
				state.stats = action.payload;
			})
			.addCase(fetchCandidateStats.rejected, (state, action: PayloadAction<any>) => {
				state.statsLoading = false;
				state.error = action.payload;
			})

			// Fetch all candidates
			.addCase(fetchCandidates.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<CandidatePaginatedResponse>) => {
				state.loading = false;
				state.list = action.payload.items;
				state.total = action.payload.total;
			})
			.addCase(fetchCandidates.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch unscreened
			.addCase(fetchUnscreenedCandidates.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUnscreenedCandidates.fulfilled, (state, action: PayloadAction<CandidatePaginatedResponse>) => {
				state.loading = false;
				state.list = action.payload.items;
				state.total = action.payload.total;
			})
			.addCase(fetchUnscreenedCandidates.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch screened
			.addCase(fetchScreenedCandidates.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchScreenedCandidates.fulfilled, (state, action: PayloadAction<CandidatePaginatedResponse>) => {
				state.loading = false;
				state.list = action.payload.items;
				state.total = action.payload.total;
			})
			.addCase(fetchScreenedCandidates.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch filter options
			.addCase(fetchFilterOptions.fulfilled, (state, action) => {
				state.filterOptions = action.payload;
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

			// Screening operations
			.addCase(createScreening.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					state.selectedCandidate.screening = action.payload.screening;
				}
			})
			.addCase(updateScreening.fulfilled, (state, action) => {
				if (state.selectedCandidate?.public_id === action.payload.publicId) {
					state.selectedCandidate.screening = action.payload.screening;
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

