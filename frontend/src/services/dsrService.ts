import api from './api';
import type { DSREntry, DSREntryCreate, DSRStatus, MissingDSR, PaginationResult } from '../models/dsr';

const dsrService = {
	getEntries: async (
		skip = 0,
		limit = 10,
		date_from?: string,
		date_to?: string,
		status?: DSRStatus
	): Promise<PaginationResult<DSREntry>> => {
		const response = await api.get('/dsr/entries/', {
			params: { skip, limit, date_from, date_to, status }
		});
		return response.data;
	},

	getEntry: async (publicId: string): Promise<DSREntry> => {
		const response = await api.get(`/dsr/entries/${publicId}`);
		return response.data;
	},

	createEntry: async (data: DSREntryCreate): Promise<DSREntry> => {
		const response = await api.post('/dsr/entries/', data);
		return response.data;
	},

	submitEntry: async (publicId: string): Promise<DSREntry> => {
		const response = await api.post(`/dsr/entries/${publicId}/submit`);
		return response.data;
	},

	deleteEntry: async (publicId: string): Promise<void> => {
		await api.delete(`/dsr/entries/${publicId}`);
	},

	// Admin Actions
	getAdminOverview: async (
		skip = 0,
		limit = 10,
		date_from?: string,
		date_to?: string
	): Promise<PaginationResult<DSREntry>> => {
		const response = await api.get('/dsr/entries/admin/overview', {
			params: { skip, limit, date_from, date_to }
		});
		return response.data;
	},

	getMissingReports: async (date: string): Promise<MissingDSR[]> => {
		const response = await api.get('/dsr/entries/admin/missing', {
			params: { date }
		});
		return response.data;
	},

	grantPermission: async (data: { user_public_id: string, target_date: string, expiry_hours?: number }): Promise<void> => {
		await api.post('/dsr/entries/admin/grant-permission', data);
	},

	sendReminders: async (date: string): Promise<void> => {
		await api.post('/dsr/entries/admin/send-reminders', null, {
			params: { date }
		});
	}
};

export default dsrService;
