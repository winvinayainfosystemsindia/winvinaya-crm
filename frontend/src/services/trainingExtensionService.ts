import api from './api';
import type { TrainingAttendance, TrainingAssessment, TrainingMockInterview, TrainingBatchEvent, TrainingBatchPlan } from '../models/training';

const trainingExtensionService = {
	// Attendance
	getAttendance: async (batchId: number) => {
		const response = await api.get<TrainingAttendance[]>(`/training-extensions/attendance/${batchId}`);
		return response.data;
	},

	getAttendanceByDate: async (batchId: number, date: string) => {
		const response = await api.get<TrainingAttendance[]>(`/training-extensions/attendance/${batchId}/date/${date}`);
		return response.data;
	},

	updateBulkAttendance: async (data: TrainingAttendance[]) => {
		const response = await api.post<TrainingAttendance[]>('/training-extensions/attendance/bulk', data);
		return response.data;
	},

	// Training Plan
	getDailyPlan: async (batchPublicId: string, date: string) => {
		const response = await api.get<TrainingBatchPlan[]>(`/training-batch-plans/batch/${batchPublicId}`, {
			params: { start_date: date }
		});
		// Filter to only return plans for the specific date
		return response.data.filter(plan => plan.date === date);
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

	updateBulkAssessments: async (data: TrainingAssessment[]) => {
		const response = await api.post<TrainingAssessment[]>('/training-extensions/assessments/bulk', data);
		return response.data;
	},

	deleteAssessment: async (batchId: number, assessmentName: string) => {
		const response = await api.delete(`/training-extensions/assessments/${batchId}/${encodeURIComponent(assessmentName)}`);
		return response.data;
	},

	// Mock Interviews
	getMockInterviews: async (batchId: number) => {
		const response = await api.get<TrainingMockInterview[]>(`/training-extensions/mock-interviews/batch/${batchId}`);
		return response.data;
	},

	createMockInterview: async (data: TrainingMockInterview) => {
		const response = await api.post<TrainingMockInterview>('/training-extensions/mock-interviews', data);
		return response.data;
	},

	// Batch Events (Holidays)
	getBatchEvents: async (batchId: number) => {
		const response = await api.get<TrainingBatchEvent[]>(`/training-extensions/events/${batchId}`);
		return response.data;
	},

	createBatchEvent: async (data: TrainingBatchEvent) => {
		const response = await api.post<TrainingBatchEvent>('/training-extensions/events', data);
		return response.data;
	},

	deleteBatchEvent: async (eventId: number) => {
		const response = await api.delete(`/training-extensions/events/${eventId}`);
		return response.data;
	},
	// Candidate specific data
	getCandidateAttendance: async (publicId: string) => {
		const response = await api.get<TrainingAttendance[]>(`/training-extensions/attendance/candidate/${publicId}`);
		return response.data;
	},

	getCandidateAssessments: async (publicId: string) => {
		const response = await api.get<TrainingAssessment[]>(`/training-extensions/assessments/candidate/${publicId}`);
		return response.data;
	},

	getCandidateMockInterviews: async (publicId: string) => {
		const response = await api.get<TrainingMockInterview[]>(`/training-extensions/mock-interviews/candidate/${publicId}`);
		return response.data;
	},

	getCandidateAllocations: async (publicId: string) => {
		const response = await api.get<any[]>(`/training-candidate-allocations/candidate/${publicId}`);
		return response.data;
	},
};

export default trainingExtensionService;

