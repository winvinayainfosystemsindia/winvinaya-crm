import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import candidateService from '../../services/candidateService';
import type { Candidate } from '../../models/candidate';

interface CandidateState {
	list: Candidate[];
	loading: boolean;
	error: string | null;
}

const initialState: CandidateState = {
	list: [],
	loading: false,
	error: null,
};

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

const candidateSlice = createSlice({
	name: 'candidates',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCandidates.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<Candidate[]>) => {
				state.loading = false;
				state.list = action.payload;
			})
			.addCase(fetchCandidates.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export default candidateSlice.reducer;
