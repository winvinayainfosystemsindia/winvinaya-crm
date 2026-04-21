import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { skillService } from '../../services/skillService';

interface SkillState {
    aggregatedSkills: string[];
    loading: boolean;
    error: string | null;
}

const initialState: SkillState = {
    aggregatedSkills: [],
    loading: false,
    error: null,
};

export const fetchAggregatedSkills = createAsyncThunk(
    'skills/fetchAggregated',
    async (_, { rejectWithValue }) => {
        try {
            return await skillService.getAggregatedSkills();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch aggregated skills');
        }
    }
);

const skillSlice = createSlice({
    name: 'skills',
    initialState,
    reducers: {
        clearSkillError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAggregatedSkills.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAggregatedSkills.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.loading = false;
                state.aggregatedSkills = action.payload;
            })
            .addCase(fetchAggregatedSkills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSkillError } = skillSlice.actions;
export default skillSlice.reducer;
