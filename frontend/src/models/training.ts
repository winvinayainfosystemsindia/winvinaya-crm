export interface TrainingBatch {
	id: number;
	public_id: string;
	batch_name: string;
	courses: string[] | null;
	duration: {
		start_date: string;
		end_date: string;
		weeks: number;
	} | null;
	status: 'planned' | 'running' | 'closed' | string;
	other: any;
	created_at: string;
	updated_at: string;
}

export interface CandidateAllocation {
	id: number;
	public_id: string;
	batch_id: number;
	candidate_id: number;
	status: any;
	others: any;
	created_at: string;
	updated_at: string;
	batch?: TrainingBatch;
	candidate?: {
		public_id: string;
		name: string;
		email: string;
		phone: string;
	};
}

export interface TrainingStats {
	total: number;
	running: number;
	closed: number;
	planned: number;
}
