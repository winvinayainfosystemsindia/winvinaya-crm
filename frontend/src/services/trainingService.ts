import api from './api';
import type { TrainingBatch, TrainingStats, CandidateAllocation } from '../models/training';

const trainingService = {
	getBatches: async (skip: number = 0, limit: number = 100) => {
		const response = await api.get<TrainingBatch[]>(`/training-batches/?skip=${skip}&limit=${limit}`);
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

	getAllocations: async (batchId?: number) => {
		const url = batchId ? `/candidate-allocations/?batch_id=${batchId}` : '/candidate-allocations/';
		const response = await api.get<{ items: CandidateAllocation[], total: number }>(url);
		return response.data;
	},

	allocateCandidate: async (data: Partial<CandidateAllocation>) => {
		const response = await api.post<CandidateAllocation>('/candidate-allocations/', data);
		return response.data;
	}
};

export default trainingService;
