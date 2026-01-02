import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { settingsService, type DynamicField } from '../../services/settingsService';

interface SettingsState {
	fields: Record<string, DynamicField[]>;
	loading: boolean;
	error: string | null;
}

const initialState: SettingsState = {
	fields: {},
	loading: false,
	error: null,
};

export const fetchFields = createAsyncThunk(
	'settings/fetchFields',
	async (entityType: string, { rejectWithValue }) => {
		try {
			const response = await settingsService.getFields(entityType);
			return { entityType, fields: response };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || `Failed to fetch fields for ${entityType}`);
		}
	}
);

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		clearSettingsError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchFields.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchFields.fulfilled, (state, action: PayloadAction<{ entityType: string; fields: DynamicField[] }>) => {
				state.loading = false;
				state.fields[action.payload.entityType] = action.payload.fields;
			})
			.addCase(fetchFields.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
