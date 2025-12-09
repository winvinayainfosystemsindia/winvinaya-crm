import api from './api';
import type { Candidate, CandidateCreate } from '../models/candidate';

const candidateService = {
	getAll: async (skip = 0, limit = 100): Promise<Candidate[]> => {
		const response = await api.get<Candidate[]>(`/candidates/?skip=${skip}&limit=${limit}`);
		return response.data;
	},

	getById: async (id: number): Promise<Candidate> => {
		const response = await api.get<Candidate>(`/candidates/${id}`);
		return response.data;
	},

	create: async (candidate: CandidateCreate): Promise<Candidate> => {
		const response = await api.post<Candidate>('/candidates/', candidate);
		return response.data;
	},

	update: async (id: number, candidate: Partial<CandidateCreate>): Promise<Candidate> => {
		const response = await api.put<Candidate>(`/candidates/${id}`, candidate);
		return response.data;
	},

	delete: async (id: number): Promise<void> => {
		await api.delete(`/candidates/${id}`);
	}
};

export default candidateService;
