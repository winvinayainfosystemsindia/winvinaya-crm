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
		const response = await api.get('/dsr/entries', {
			params: { skip, limit, date_from, date_to }
		});
		return response.data;
	},

	getMissingReports: async (date: string): Promise<MissingDSR[]> => {
		const response = await api.get('/dsr/admin/missing', {
			params: { report_date: date }
		});
		return response.data;
	},

	grantPermission: async (data: { user_public_id: string, target_date: string }): Promise<void> => {
		await api.post('/dsr/admin/grant-permission', {
			user_public_id: data.user_public_id,
			report_date: data.target_date
		});
	},

	sendReminders: async (date: string): Promise<void> => {
		await api.post('/dsr/admin/send-reminders', {
			report_date: date,
			user_public_ids: null // Remind all missing
		});
	},

	// Permission Requests
	createPermissionRequest: async (data: { report_date: string, reason: string }): Promise<any> => {
		const response = await api.post('/dsr/permissions/request', data);
		return response.data;
	},

	getPermissionRequests: async (
		skip = 0,
		limit = 100,
		user_id?: number,
		status?: string
	): Promise<{ items: any[], total: number }> => {
		const response = await api.get('/dsr/permissions/requests', {
			params: { skip, limit, user_id, status }
		});
		return response.data;
	},

	handlePermissionRequest: async (
		publicId: string,
		data: { status: string, admin_notes?: string }
	): Promise<any> => {
		const response = await api.put(`/dsr/permissions/requests/${publicId}`, data);
		return response.data;
	},

	getPermissionStats: async (): Promise<any> => {
		const response = await api.get('/dsr/permissions/stats');
		return response.data;
	},

	// Review Actions (Admin)
	getPendingApproval: async (skip = 0, limit = 100): Promise<any> => {
		const response = await api.get('/dsr/entries/pending-approval', {
			params: { skip, limit }
		});
		return response.data;
	},

	approveEntry: async (publicId: string, admin_notes?: string): Promise<any> => {
		const response = await api.post(`/dsr/entries/${publicId}/approve`, { admin_notes });
		return response.data;
	},

	rejectEntry: async (publicId: string, reason: string): Promise<any> => {
		const response = await api.post(`/dsr/entries/${publicId}/reject`, { reason });
		return response.data;
	},

	getMyStats: async (): Promise<any> => {
		const response = await api.get('/dsr/entries/my-stats');
		return response.data;
	},

	getPendingSubmissions: async (): Promise<any> => {
		const response = await api.get('/dsr/permissions/pending-submissions');
		return response.data;
	}
};

export default dsrService;
