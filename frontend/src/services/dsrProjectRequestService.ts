import api from './api';
import type { DSRProjectRequest, PaginationResult, DSRProjectRequestStatus } from '../models/dsr';

const dsrProjectRequestService = {
	getRequests: async (
		skip = 0,
		limit = 50,
		status?: DSRProjectRequestStatus
	): Promise<PaginationResult<DSRProjectRequest>> => {
		const response = await api.get('/dsr/project-requests', {
			params: { skip, limit, status }
		});
		return response.data;
	},

	getRequest: async (publicId: string): Promise<DSRProjectRequest> => {
		const response = await api.get(`/dsr/project-requests/${publicId}`);
		return response.data;
	},

	createRequest: async (data: { project_name: string; reason?: string }): Promise<DSRProjectRequest> => {
		const response = await api.post('/dsr/project-requests', data);
		return response.data;
	},

	handleRequest: async (
		publicId: string,
		data: { status: DSRProjectRequestStatus; admin_notes?: string; owner_user_public_id?: string }
	): Promise<DSRProjectRequest> => {
		const response = await api.put(`/dsr/project-requests/${publicId}/handle`, data);
		return response.data;
	}
};

export default dsrProjectRequestService;
