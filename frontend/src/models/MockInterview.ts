export interface Question {
	question: string;
	answer: string;
}

export interface Skill {
	skill: string;
	level: string; // e.g., Beginner, Intermediate, Expert
	rating: number; // 0-10
}

export interface MockInterview {
	id: number;
	batch_id: number;
	candidate_id: number;
	interviewer_name?: string;
	interview_date: string;
	questions?: Question[];
	skills?: Skill[];
	feedback?: string;
	overall_rating?: number;
	status: 'pending' | 'cleared' | 're-test' | 'rejected' | 'absent';
	interview_type?: 'internal' | 'external';
	interview_category?: 'hr' | 'domain';
	start_time?: string;
	end_time?: string;
	duration_minutes?: number;
	created_at: string;
	updated_at: string;
}

export interface MockInterviewCreate {
	batch_id: number;
	candidate_id: number;
	interviewer_name?: string;
	interview_date: string;
	interview_type?: 'internal' | 'external';
	interview_category?: 'hr' | 'domain';
	questions?: Question[];
	skills?: Skill[];
	feedback?: string;
	overall_rating?: number;
	status?: string;
	start_time?: string;
	end_time?: string;
	duration_minutes?: number;
}

export interface MockInterviewUpdate {
	interviewer_name?: string;
	interview_date?: string;
	interview_type?: 'internal' | 'external';
	interview_category?: 'hr' | 'domain';
	questions?: Question[];
	skills?: Skill[];
	feedback?: string;
	overall_rating?: number;
	status?: string;
}
