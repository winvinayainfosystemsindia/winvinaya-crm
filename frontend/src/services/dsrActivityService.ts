import api from './api';
import type { DSRActivity, DSRActivityCreate, DSRActivityStatus, ImportResult } from '../models/dsr';

const dsrActivityService = {
	getActivities: async (
		skip = 0,
		limit = 100,
		project_public_id?: string,
		status?: DSRActivityStatus,
		active_only = false,
		search?: string
	) => {
		const response = await api.get<{ items: DSRActivity[]; total: number }>(`/dsr/activities`, {
			params: { skip, limit, project_public_id, status, active_only, search },
		});
		return response.data;
	},

	getActivity: async (publicId: string) => {
		const response = await api.get<DSRActivity>(`/dsr/activities/${publicId}`);
		return response.data;
	},

	createActivity: async (data: DSRActivityCreate) => {
		const response = await api.post<DSRActivity>(`/dsr/activities`, data);
		return response.data;
	},

	updateActivity: async (publicId: string, data: Partial<DSRActivityCreate>) => {
		const response = await api.put<DSRActivity>(`/dsr/activities/${publicId}`, data);
		return response.data;
	},

	deleteActivity: async (publicId: string) => {
		await api.delete(`/dsr/activities/${publicId}`);
	},

	importFromExcel: async (file: File, projectPublicId?: string) => {
		const formData = new FormData();
		formData.append('file', file);
		if (projectPublicId) {
			formData.append('project_public_id', projectPublicId);
		}
		const response = await api.post<ImportResult>(`/dsr/activities/import`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	},
};

export default dsrActivityService;
