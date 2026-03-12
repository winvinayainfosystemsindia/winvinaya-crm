import api from './api';
import type { DSRActivityType, PaginationResult } from '../models/dsr';

const dsrActivityTypeService = {
	getActivityTypes: async (
		skip = 0,
		limit = 100,
		onlyActive = true
	): Promise<PaginationResult<DSRActivityType>> => {
		const response = await api.get('/dsr/activity-types/', {
			params: { skip, limit, active_only: onlyActive }
		});
		return response.data;
	},

	getActivityType: async (publicId: string): Promise<DSRActivityType> => {
		const response = await api.get(`/dsr/activity-types/${publicId}`);
		return response.data;
	},

	createActivityType: async (data: Partial<DSRActivityType>): Promise<DSRActivityType> => {
		const response = await api.post('/dsr/activity-types/', data);
		return response.data;
	},

	updateActivityType: async (publicId: string, data: Partial<DSRActivityType>): Promise<DSRActivityType> => {
		const response = await api.put(`/dsr/activity-types/${publicId}`, data);
		return response.data;
	},

	deleteActivityType: async (publicId: string): Promise<void> => {
		await api.delete(`/dsr/activity-types/${publicId}`);
	}
};

export default dsrActivityTypeService;
