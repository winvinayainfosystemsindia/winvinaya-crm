import api from './api';
import type { LoginResponse, RegisterResponse, User } from '../models/auth';

const authService = {
	login: async (email: string, password: string): Promise<LoginResponse> => {
		const response = await api.post<LoginResponse>('/auth/login', { email, password });
		if (response.data.access_token) {
			localStorage.setItem('token', response.data.access_token);
		}
		return response.data;
	},

	register: async (userData: any): Promise<RegisterResponse> => {
		const response = await api.post<RegisterResponse>('/auth/register', userData);
		return response.data;
	},

	logout: () => {
		localStorage.removeItem('token');
	},

	getCurrentUser: async (): Promise<User> => {
		// Assuming there's an endpoint to get current user, usually /auth/me or similar.
		// If not, we might need to decode the token or rely on login response if it returns user details.
		// Based on backend inspection, login only returns token.
		// Let's assume we decode token or just use what we have. 
		// For now, let's omit this or implement if a specific endpoint exists.
		// Backend didn't show /me endpoint in auth.py, but token has user_id.
		// User details usually fetched via /users/{id}. 
		return {} as User; // Placeholder
	}
};

export default authService;
