import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import type { User } from '../../models/user';

interface UserState {
	users: User[];
	totalCount: number;
	loading: boolean;
	error: string | null;
}

const initialState: UserState = {
	users: [],
	totalCount: 0,
	loading: false,
	error: null,
};

export const fetchUsers = createAsyncThunk(
	'users/fetchAll',
	async (params: { skip?: number; limit?: number } | undefined, { rejectWithValue }) => {
		try {
			const { skip = 0, limit = 100 } = params || {};
			const response = await userService.getAll(skip, limit);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to fetch users');
		}
	}
);

const userSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		clearUserError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUsers.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ items: User[]; total: number }>) => {
				state.loading = false;
				state.users = action.payload.items;
				state.totalCount = action.payload.total;
			})
			.addCase(fetchUsers.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
