export interface TrainingBatch {
	id: number;
	public_id: string;
	batch_name: string;
	disability_types: string[];
	start_date?: string;
	approx_close_date?: string;
	total_extension_days?: number;
	courses: (string | { name: string; trainer: string })[] | null;
	duration?: {
		start_date: string;
		end_date: string;
		weeks: number;
		days: number;
	} | null;
	status: 'planned' | 'running' | 'closed' | string;
	domain?: string;
	training_mode?: string;
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
	status: 'allocated' | 'in_training' | 'completed' | 'dropped_out' | 'placed' | string;
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
		gender?: string;
		disability_details?: {
			disability_type?: string;
			type?: string;
			[key: string]: any;
		};
		education_details?: {
			qualification?: string;
			[key: string]: any;
		};
	};
}

export interface TrainingStats {
	total: number;
	running: number;
	completed: number;
	planned: number;
	in_training: number;
	completed_training: number;
	ready_for_training: number;
	dropped_out: number;
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

export interface TrainingBatchPlan {
	id: number;
	public_id: string;
	batch_id: number;
	date: string;
	start_time: string;
	end_time: string;
	activity_type: 'course' | 'break' | 'event' | 'interview' | 'other' | string;
	activity_name: string;
	trainer?: string | null;
	notes?: string | null;
	others?: any;
	created_at: string;
	updated_at: string;
}
