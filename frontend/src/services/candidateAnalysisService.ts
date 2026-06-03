import api from './api';
import { type CandidateAnalysis, type CandidateAnalysisCreate, type CandidateAnalysisUpdate } from '../models/CandidateAnalysis';

const candidateAnalysisService = {
	getByBatchId: async (batchId: number): Promise<CandidateAnalysis[]> => {
		const response = await api.get<CandidateAnalysis[]>(`/training-extensions/candidate-analyses/batch/${batchId}`);
		return response.data;
	},

	getByCandidateId: async (publicId: string): Promise<CandidateAnalysis[]> => {
		const response = await api.get<CandidateAnalysis[]>(`/training-extensions/candidate-analyses/candidate/${publicId}`);
		return response.data;
	},

	getById: async (_batchId: number, id: number): Promise<CandidateAnalysis | null> => {
		const response = await api.get<CandidateAnalysis>(`/training-extensions/candidate-analyses/${id}`);
		return response.data;
	},

	create: async (_batchId: number, data: CandidateAnalysisCreate): Promise<CandidateAnalysis> => {
		const response = await api.post<CandidateAnalysis>('/training-extensions/candidate-analyses', data);
		return response.data;
	},

	update: async (_batchId: number, id: number, data: CandidateAnalysisUpdate): Promise<CandidateAnalysis> => {
		const response = await api.put<CandidateAnalysis>(`/training-extensions/candidate-analyses/${id}`, data);
		return response.data;
	},

	delete: async (_batchId: number, id: number): Promise<number> => {
		await api.delete(`/training-extensions/candidate-analyses/${id}`);
		return id;
	}
};

export default candidateAnalysisService;
