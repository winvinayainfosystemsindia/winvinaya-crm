import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import type { LoginResponse } from '../../models/auth';

interface AuthState {
	user: any | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	token: localStorage.getItem('token'),
	isAuthenticated: !!localStorage.getItem('token'),
	loading: false,
	error: null,
};

export const loginUser = createAsyncThunk(
	'auth/login',
	async ({ email, password }: any, { rejectWithValue }) => {
		try {
			const response = await authService.login(email, password);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Login failed');
		}
	}
);

export const logoutUser = createAsyncThunk(
	'auth/logout',
	async () => {
		authService.logout();
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
				state.loading = false;
				state.isAuthenticated = true;
				state.token = action.payload.access_token;
			})
			.addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
				state.isAuthenticated = false;
			})
			.addCase(logoutUser.fulfilled, (state) => {
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
			});
	},
});

export default authSlice.reducer;
