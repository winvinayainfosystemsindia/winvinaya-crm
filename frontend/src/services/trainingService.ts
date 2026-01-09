import api from './api';
import type { TrainingBatch, TrainingStats, CandidateAllocation } from '../models/training';

const trainingService = {
	getBatches: async (params: any = {}) => {
		const query = new URLSearchParams();
		if (params.skip !== undefined) query.append('skip', params.skip.toString());
		if (params.limit !== undefined) query.append('limit', params.limit.toString());
		if (params.search) query.append('search', params.search);
		if (params.sortBy) query.append('sort_by', params.sortBy);
		if (params.sortOrder) query.append('sort_order', params.sortOrder);
		if (params.status) query.append('status', params.status);
		if (params.disability_types) query.append('disability_types', params.disability_types);

		const response = await api.get<{ items: TrainingBatch[], total: number }>(`/training-batches/?${query.toString()}`);
		return response.data;
	},

	deleteBatch: async (publicId: string) => {
		const response = await api.delete(`/training-batches/${publicId}`);
		return response.data;
	},

	getStats: async () => {
		const response = await api.get<TrainingStats>('/training-batches/stats');
		return response.data;
	},

	createBatch: async (data: Partial<TrainingBatch>) => {
		const response = await api.post<TrainingBatch>('/training-batches/', data);
		return response.data;
	},

	updateBatch: async (publicId: string, data: Partial<TrainingBatch>) => {
		const response = await api.put<TrainingBatch>(`/training-batches/${publicId}`, data);
		return response.data;
	},

	extendBatch: async (publicId: string, data: { new_close_date: string; reason?: string }) => {
		const response = await api.post<TrainingBatch>(`/training-batches/${publicId}/extend`, data);
		return response.data;
	},

	getAllocations: async (batchPublicId: string, params: any = {}) => {
		const query = new URLSearchParams();
		if (params.search) query.append('search', params.search);
		if (params.is_dropout !== undefined) query.append('is_dropout', params.is_dropout.toString());
		if (params.sortBy) query.append('sort_by', params.sortBy);
		if (params.sortOrder) query.append('sort_order', params.sortOrder);

		const response = await api.get<CandidateAllocation[]>(`/training-candidate-allocations/batch/${batchPublicId}?${query.toString()}`);
		return response.data;
	},

	getEligibleCandidates: async (batchPublicId?: string) => {
		const url = batchPublicId
			? `/training-candidate-allocations/eligible?batch_public_id=${batchPublicId}`
			: '/training-candidate-allocations/eligible';
		const response = await api.get<{ public_id: string, name: string, email: string, phone: string, disability_type?: string }[]>(url);
		return response.data;
	},

	allocateCandidate: async (data: { batch_id: number; candidate_id: number; batch_public_id?: string; candidate_public_id?: string; status?: any; others?: any }) => {
		const response = await api.post<CandidateAllocation>('/training-candidate-allocations/', data);
		return response.data;
	},

	updateAllocation: async (publicId: string, data: Partial<CandidateAllocation>) => {
		const response = await api.put<CandidateAllocation>(`/training-candidate-allocations/${publicId}`, data);
		return response.data;
	},

	removeAllocation: async (publicId: string) => {
		const response = await api.delete(`/training-candidate-allocations/${publicId}`);
		return response.data;
	}
};

export default trainingService;
