import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { screeningAssignmentService } from '../../services/screeningAssignmentService';
import type { EligibleScreener } from '../../services/screeningAssignmentService';

interface ScreeningAssignmentState {
	eligibleScreeners: EligibleScreener[];
	loading: boolean;
	error: string | null;
	assignmentInProgress: boolean;
}

const initialState: ScreeningAssignmentState = {
	eligibleScreeners: [],
	loading: false,
	error: null,
	assignmentInProgress: false
};

export const fetchEligibleScreeners = createAsyncThunk(
	'screeningAssignments/fetchEligibleScreeners',
	async (_, { rejectWithValue }) => {
		try {
			return await screeningAssignmentService.getEligibleScreeners();
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch screeners');
		}
	}
);

export const assignCandidates = createAsyncThunk(
	'screeningAssignments/assignCandidates',
	async ({ candidatePublicIds, assignedToUserId }: { candidatePublicIds: string[]; assignedToUserId: number }, { rejectWithValue }) => {
		try {
			return await screeningAssignmentService.assignCandidates(candidatePublicIds, assignedToUserId);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to assign candidates');
		}
	}
);

const screeningAssignmentSlice = createSlice({
	name: 'screeningAssignments',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		}
	},
	extraReducers: (builder) => {
		builder
			// Fetch Screeners
			.addCase(fetchEligibleScreeners.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchEligibleScreeners.fulfilled, (state, action) => {
				state.loading = false;
				state.eligibleScreeners = action.payload;
			})
			.addCase(fetchEligibleScreeners.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Assign Candidates
			.addCase(assignCandidates.pending, (state) => {
				state.assignmentInProgress = true;
				state.error = null;
			})
			.addCase(assignCandidates.fulfilled, (state) => {
				state.assignmentInProgress = false;
			})
			.addCase(assignCandidates.rejected, (state, action) => {
				state.assignmentInProgress = false;
				state.error = action.payload as string;
			});
	}
});

export const { clearError } = screeningAssignmentSlice.actions;
export default screeningAssignmentSlice.reducer;
