import api from './api';

export interface EligibleScreener {
	id: number;
	username: string;
	full_name: string | null;
	role: string;
}

export interface BulkAssignResult {
	assigned_count: number;
	message: string;
}

export const screeningAssignmentService = {
	/**
	 * Assign one or more candidates to a screener
	 */
	assignCandidates: async (candidatePublicIds: string[], assignedToUserId: number): Promise<BulkAssignResult> => {
		const response = await api.post<BulkAssignResult>('/screening-assignments/assign', {
			candidate_public_ids: candidatePublicIds,
			assigned_to_user_id: assignedToUserId
		});
		return response.data;
	},

	/**
	 * Remove assignment from a candidate
	 */
	unassignCandidate: async (candidatePublicId: string): Promise<BulkAssignResult> => {
		const response = await api.post<BulkAssignResult>('/screening-assignments/unassign', {
			candidate_public_id: candidatePublicId
		});
		return response.data;
	},

	/**
	 * Get list of users eligible to be assigned as screeners (Trainer, Sourcing)
	 */
	getEligibleScreeners: async (): Promise<EligibleScreener[]> => {
		const response = await api.get<EligibleScreener[]>('/screening-assignments/eligible-screeners');
		return response.data;
	}
};

export default screeningAssignmentService;
