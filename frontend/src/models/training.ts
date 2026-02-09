export interface TrainingBatch {
	id: number;
	public_id: string;
	batch_name: string;
	disability_types: string[];
	start_date?: string;
	approx_close_date?: string;
	total_extension_days?: number;
	courses: string[] | null;
	duration?: {
		start_date: string;
		end_date: string;
		weeks: number;
	} | null;
	status: 'planned' | 'running' | 'closed' | string;
	other: any;
	created_at: string;
	updated_at: string;
	extensions?: TrainingBatchExtension[];
}

export interface TrainingBatchExtension {
	id: number;
	public_id: string;
	batch_id: number;
	previous_close_date: string;
	new_close_date: string;
	extension_days: number;
	reason: string | null;
	created_at: string;
}

export interface CandidateAllocation {
	id: number;
	public_id: string;
	batch_id: number;
	candidate_id: number;
	status: any;
	is_dropout: boolean;
	dropout_remark: string | null;
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
	women: number;
}

export interface TrainingAttendance {
	id?: number;
	batch_id: number;
	candidate_id: number;
	date: string;
	status: 'present' | 'absent' | 'late' | 'half_day';
	remarks: string | null;
	batch?: TrainingBatch; // Eager loaded batch info
}

export interface TrainingBatchEvent {
	id?: number;
	batch_id: number;
	date: string;
	event_type: 'holiday' | 'event';
	title: string;
	description: string | null;
}

export interface TrainingAssessment {
	id?: number;
	batch_id: number;
	candidate_id: number;
	assessment_name: string;
	description?: string;
	course_name?: string[];
	course_marks?: Record<string, number>;
	trainer_id?: number;
	marks_obtained: number;
	max_marks: number;
	assessment_date: string;
	submission_date?: string;
	others?: any;
	batch?: TrainingBatch; // Eager loaded batch info
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
	status: 'pending' | 'cleared' | 're-test' | 'rejected' | 'absent';
	batch?: TrainingBatch; // Eager loaded batch info
}
