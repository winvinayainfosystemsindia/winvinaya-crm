import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import trainingService from '../../services/trainingService';
import type { TrainingBatch, TrainingStats, CandidateAllocation } from '../../models/training';

interface TrainingState {
	batches: TrainingBatch[];
	stats: TrainingStats | null;
	allocations: CandidateAllocation[];
	loading: boolean;
	error: string | null;
}

const initialState: TrainingState = {
	batches: [],
	stats: null,
	allocations: [],
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
	async (batchId: number | undefined, { rejectWithValue }) => {
		try {
			const response = await trainingService.getAllocations(batchId);
			return response.items;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch allocations');
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
			});
	},
});

export const { clearError } = trainingSlice.actions;
export default trainingSlice.reducer;
