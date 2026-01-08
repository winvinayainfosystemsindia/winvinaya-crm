import api from './api';
import type { TrainingAttendance, TrainingAssessment, TrainingMockInterview } from '../models/training';

const trainingExtensionService = {
	// Attendance
	getAttendance: async (batchId: number) => {
		const response = await api.get<TrainingAttendance[]>(`/training-extensions/attendance/${batchId}`);
		return response.data;
	},

	updateBulkAttendance: async (data: TrainingAttendance[]) => {
		const response = await api.post<TrainingAttendance[]>('/training-extensions/attendance/bulk', data);
		return response.data;
	},

	// Assessments
	getAssessments: async (batchId: number) => {
		const response = await api.get<TrainingAssessment[]>(`/training-extensions/assessments/${batchId}`);
		return response.data;
	},

	createAssessment: async (data: TrainingAssessment) => {
		const response = await api.post<TrainingAssessment>('/training-extensions/assessments', data);
		return response.data;
	},

	// Mock Interviews
	getMockInterviews: async (batchId: number) => {
		const response = await api.get<TrainingMockInterview[]>(`/training-extensions/mock-interviews/${batchId}`);
		return response.data;
	},

	createMockInterview: async (data: TrainingMockInterview) => {
		const response = await api.post<TrainingMockInterview>('/training-extensions/mock-interviews', data);
		return response.data;
	},
};

export default trainingExtensionService;
