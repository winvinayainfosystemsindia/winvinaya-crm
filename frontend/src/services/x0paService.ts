import api from './api';

export interface X0PAJob {
	jobId: string;
	jobName: string;
	statusName: string;
	companyId: string;
	[key: string]: any;
}

export interface X0PAJobsResponse {
	jobs: X0PAJob[];
	count: string | number;
	limit: number;
	offset: number;
}

export const x0paService = {
	getJobs: async (params: {
		limit?: number;
		offset?: number;
		searchKey?: string;
		minExp?: number;
		maxExp?: number;
		location?: string;
	} = {}) => {
		try {
			const response = await api.get<X0PAJobsResponse>('/x0pa/jobs', { params });
			return response.data;
		} catch (error) {
			console.error('Error fetching jobs from X0PA:', error);
			throw error;
		}
	}
};
