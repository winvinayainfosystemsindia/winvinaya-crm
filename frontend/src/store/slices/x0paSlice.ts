import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { x0paService } from '../../services/x0paService';
import type { X0PAJob, X0PAJobsResponse } from '../../services/x0paService';

interface X0PAState {
	jobs: X0PAJob[];
	loading: boolean;
	error: string | null;
}

const initialState: X0PAState = {
	jobs: [],
	loading: false,
	error: null
};

export const fetchX0PAJobs = createAsyncThunk(
	'x0pa/fetchJobs',
	async (params: { searchKey?: string; limit?: number; offset?: number; location?: string } | void, { rejectWithValue }) => {
		try {
			const response = await x0paService.getJobs(params || {});
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch jobs from X0PA');
		}
	}
);

const x0paSlice = createSlice({
	name: 'x0pa',
	initialState,
	reducers: {
		clearX0PAError: (state) => {
			state.error = null;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchX0PAJobs.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchX0PAJobs.fulfilled, (state, action: PayloadAction<X0PAJobsResponse>) => {
				state.loading = false;
				state.jobs = action.payload.jobs || [];
			})
			.addCase(fetchX0PAJobs.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			});
	}
});

export const { clearX0PAError } = x0paSlice.actions;
export default x0paSlice.reducer;
