import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import trainingService from '../../services/trainingService';
import type { TrainingBatch, TrainingStats, CandidateAllocation } from '../../models/training';

interface TrainingState {
	batches: TrainingBatch[];
	stats: TrainingStats | null;
	allocations: CandidateAllocation[];
	eligibleCandidates: { public_id: string, name: string, email: string, phone: string }[];
	loading: boolean;
	error: string | null;
}

const initialState: TrainingState = {
	batches: [],
	stats: null,
	allocations: [],
	eligibleCandidates: [],
	loading: false,
	error: null,
};

export const fetchTrainingStats = createAsyncThunk(
	'training/fetchStats',
	async (_, { rejectWithValue }) => {
		try {
			const response = await trainingService.getStats();
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch training stats');
		}
	}
);

export const fetchTrainingBatches = createAsyncThunk(
	'training/fetchBatches',
	async ({ skip, limit }: { skip?: number, limit?: number } = {}, { rejectWithValue }) => {
		try {
			const response = await trainingService.getBatches(skip, limit);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch training batches');
		}
	}
);

export const createTrainingBatch = createAsyncThunk(
	'training/createBatch',
	async (data: Partial<TrainingBatch>, { rejectWithValue }) => {
		try {
			const response = await trainingService.createBatch(data);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create training batch');
		}
	}
);

export const updateTrainingBatch = createAsyncThunk(
	'training/updateBatch',
	async ({ publicId, data }: { publicId: string, data: Partial<TrainingBatch> }, { rejectWithValue }) => {
		try {
			const response = await trainingService.updateBatch(publicId, data);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update training batch');
		}
	}
);

export const fetchAllocations = createAsyncThunk(
	'training/fetchAllocations',
	async (batchPublicId: string, { rejectWithValue }) => {
		try {
			console.log('[fetchAllocations] Fetching allocations for batch:', batchPublicId);
			const response = await trainingService.getAllocations(batchPublicId);
			console.log('[fetchAllocations] Response received:', response.length, 'allocations');
			if (response.length > 0) {
				console.log('[fetchAllocations] First allocation:', response[0]);
			}
			return response;
		} catch (error: any) {
			console.error('[fetchAllocations] Error:', error);
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch allocations');
		}
	}
);

export const fetchEligibleCandidates = createAsyncThunk(
	'training/fetchEligibleCandidates',
	async (_, { rejectWithValue }) => {
		try {
			const response = await trainingService.getEligibleCandidates();
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch eligible candidates');
		}
	}
);

export const allocateCandidate = createAsyncThunk(
	'training/allocateCandidate',
	async ({ batchId, candidateId, batchPublicId, candidatePublicId }: { batchId: number, candidateId: number, batchPublicId?: string, candidatePublicId?: string }, { rejectWithValue, dispatch }) => {
		try {
			const response = await trainingService.allocateCandidate({
				batch_id: batchId,
				candidate_id: candidateId,
				batch_public_id: batchPublicId,
				candidate_public_id: candidatePublicId
			});
			// If allocation successful, we might need to refresh stats and batches because status might have changed
			dispatch(fetchTrainingStats());
			dispatch(fetchTrainingBatches({}));
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to allocate candidate');
		}
	}
);

export const removeAllocation = createAsyncThunk(
	'training/removeAllocation',
	async (publicId: string, { rejectWithValue }) => {
		try {
			await trainingService.removeAllocation(publicId);
			return publicId;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to remove allocation');
		}
	}
);

export const updateAllocationStatus = createAsyncThunk(
	'training/updateAllocationStatus',
	async ({ publicId, status }: { publicId: string, status: string }, { rejectWithValue }) => {
		try {
			const response = await trainingService.updateAllocation(publicId, { status: { current: status } });
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update allocation status');
		}
	}
);

const trainingSlice = createSlice({
	name: 'training',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Stats
			.addCase(fetchTrainingStats.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchTrainingStats.fulfilled, (state, action: PayloadAction<TrainingStats>) => {
				state.loading = false;
				state.stats = action.payload;
			})
			.addCase(fetchTrainingStats.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Batches
			.addCase(fetchTrainingBatches.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchTrainingBatches.fulfilled, (state, action: PayloadAction<TrainingBatch[]>) => {
				state.loading = false;
				state.batches = action.payload;
			})
			.addCase(fetchTrainingBatches.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create
			.addCase(createTrainingBatch.fulfilled, (state, action: PayloadAction<TrainingBatch>) => {
				state.loading = false;
				state.batches.unshift(action.payload);
			})
			// Update
			.addCase(updateTrainingBatch.fulfilled, (state, action: PayloadAction<TrainingBatch>) => {
				state.loading = false;
				const index = state.batches.findIndex(b => b.public_id === action.payload.public_id);
				if (index !== -1) {
					state.batches[index] = action.payload;
				}
			})
			// Allocations
			.addCase(fetchAllocations.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchAllocations.fulfilled, (state, action: PayloadAction<CandidateAllocation[]>) => {
				state.loading = false;
				state.allocations = action.payload;
			})
			.addCase(fetchAllocations.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Eligible Candidates
			.addCase(fetchEligibleCandidates.fulfilled, (state, action: PayloadAction<any[]>) => {
				state.eligibleCandidates = action.payload;
			})
			// Allocate
			.addCase(allocateCandidate.fulfilled, (state, action: PayloadAction<CandidateAllocation>) => {
				state.allocations.push(action.payload);
				// Remove from eligible list
				state.eligibleCandidates = state.eligibleCandidates.filter(c => c.public_id !== action.payload.candidate?.public_id);
			})
			// Update Status
			.addCase(updateAllocationStatus.fulfilled, (state, action: PayloadAction<CandidateAllocation>) => {
				const index = state.allocations.findIndex(a => a.public_id === action.payload.public_id);
				if (index !== -1) {
					state.allocations[index] = action.payload;
				}
			})
			.addCase(removeAllocation.fulfilled, (state, action: PayloadAction<string>) => {
				state.allocations = state.allocations.filter(a => a.public_id !== action.payload);
			});
	},
});

export const { clearError } = trainingSlice.actions;
export default trainingSlice.reducer;
