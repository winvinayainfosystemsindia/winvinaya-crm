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

	getAllocations: async (batchPublicId: string) => {
		const response = await api.get<CandidateAllocation[]>(`/candidate-allocations/batch/${batchPublicId}`);
		return response.data;
	},

	getEligibleCandidates: async () => {
		const response = await api.get<{ public_id: string, name: string, email: string, phone: string }[]>('/candidate-allocations/eligible');
		return response.data;
	},

	allocateCandidate: async (data: { batch_id: number; candidate_id: number; batch_public_id?: string; candidate_public_id?: string; status?: any; others?: any }) => {
		const response = await api.post<CandidateAllocation>('/candidate-allocations/', data);
		return response.data;
	},

	updateAllocation: async (publicId: string, data: Partial<CandidateAllocation>) => {
		const response = await api.put<CandidateAllocation>(`/candidate-allocations/${publicId}`, data);
		return response.data;
	},

	removeAllocation: async (publicId: string) => {
		const response = await api.delete(`/candidate-allocations/${publicId}`);
		return response.data;
	}
};

export default trainingService;
