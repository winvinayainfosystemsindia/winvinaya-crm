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

export interface TrainingAttendance {
	id?: number;
	batch_id: number;
	candidate_id: number;
	date: string;
	status: 'present' | 'absent' | 'late' | 'half_day';
	remarks: string | null;
}

export interface TrainingAssessment {
	id?: number;
	batch_id: number;
	candidate_id: number;
	assessment_name: string;
	marks_obtained: number;
	max_marks: number;
	assessment_date: string;
}

export interface TrainingMockInterview {
	id?: number;
	batch_id: number;
	candidate_id: number;
	interviewer_name: string | null;
	interview_date: string;
	questions: { question: string; answer: string }[] | null;
	feedback: string | null;
	overall_rating: number | null;
	status: 'pending' | 'cleared' | 're-test' | 'rejected';
}
