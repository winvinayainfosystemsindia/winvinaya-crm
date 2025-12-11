import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import type { LoginResponse } from '../../models/auth';

interface AuthState {
	user: any | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
	isInitialized: boolean; // Track if session validation is complete
}

const initialState: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false, // Start as false, will be determined after validation
	loading: false,
	error: null,
	isInitialized: false,
};

/**
 * Validate session on app load
 * Checks if tokens are valid and refreshes if needed
 */
export const validateSession = createAsyncThunk(
	'auth/validateSession',
	async (_, { rejectWithValue }) => {
		try {
			const isValid = await authService.validateSession();

			if (isValid) {
				const token = authService.getAccessToken();
				return { token };
			}

			return rejectWithValue('Session invalid');
		} catch (error: any) {
			authService.clearTokens();
			return rejectWithValue(error.message || 'Session validation failed');
		}
	}
);

/**
 * Login user
 */
export const loginUser = createAsyncThunk(
	'auth/login',
	async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
		try {
			const response = await authService.login(email, password);
			return response;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Login failed');
		}
	}
);

/**
 * Refresh access token
 */
export const refreshAccessToken = createAsyncThunk(
	'auth/refresh',
	async (_, { rejectWithValue }) => {
		try {
			const response = await authService.refreshToken();

			if (!response) {
				return rejectWithValue('Token refresh failed');
			}

			return response;
		} catch (error: any) {
			authService.clearTokens();
			return rejectWithValue(error.response?.data?.detail || 'Token refresh failed');
		}
	}
);

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk(
	'auth/logout',
	async () => {
		authService.logout();
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		// Manual action to clear error
		clearError: (state) => {
			state.error = null;
		},
		// Manual action to update token (used by API interceptor)
		setToken: (state, action: PayloadAction<string>) => {
			state.token = action.payload;
			state.isAuthenticated = true;
		},
	},
	extraReducers: (builder) => {
		builder
			// Validate Session
			.addCase(validateSession.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(validateSession.fulfilled, (state, action: PayloadAction<{ token: string | null }>) => {
				state.loading = false;
				state.isAuthenticated = true;
				state.token = action.payload.token;
				state.isInitialized = true;
			})
			.addCase(validateSession.rejected, (state) => {
				state.loading = false;
				state.isAuthenticated = false;
				state.token = null;
				state.user = null;
				state.isInitialized = true;
			})
			// Login
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
				state.loading = false;
				state.isAuthenticated = true;
				state.token = action.payload.access_token;
				state.isInitialized = true;
			})
			.addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.error = action.payload;
				state.isAuthenticated = false;
				state.isInitialized = true;
			})
			// Refresh Token
			.addCase(refreshAccessToken.pending, (state) => {
				state.error = null;
			})
			.addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
				state.isAuthenticated = true;
				state.token = action.payload.access_token;
			})
			.addCase(refreshAccessToken.rejected, (state) => {
				state.isAuthenticated = false;
				state.token = null;
				state.user = null;
			})
			// Logout
			.addCase(logoutUser.fulfilled, (state) => {
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
				state.isInitialized = true;
			});
	},
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
