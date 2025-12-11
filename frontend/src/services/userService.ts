// frontend\src\services\userService.ts
import api from './api';
import type { User, UserCreate, UserUpdate } from '../models/user';

const userService = {
    // Get all users with pagination
    getAll: async (skip = 0, limit = 100): Promise<User[]> => {
        const response = await api.get<User[]>('/users/', {
            params: { skip, limit }
        });
        return response.data;
    },

    // Get user by ID
    getById: async (id: string): Promise<User> => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    // Create new user
    create: async (userData: UserCreate): Promise<User> => {
        const response = await api.post<User>('/users/', userData);
        return response.data;
    },

    // Update user
    update: async (id: string, userData: UserUpdate): Promise<User> => {
        const response = await api.put<User>(`/users/${id}`, userData);
        return response.data;
    },

    // Delete user
    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    // Get current user profile
    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/users/me/');
        return response.data;
    },

    // Search users
    search: async (query: string, skip = 0, limit = 50): Promise<User[]> => {
        const response = await api.get<User[]>('/users/search/', {
            params: { q: query, skip, limit }
        });
        return response.data;
    }
};

export default userService;