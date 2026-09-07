// Candidate Screening Types
export interface CandidateScreening {
	id: number;
	candidate_id: number;
	status?: string;
	previous_training?: Record<string, any>;
	documents_upload?: Record<string, any>;
	skills?: Record<string, any>;
	family_details?: any[];
	screened_by_id?: number;
	screened_by?: {
		id: number;
		full_name?: string;
		username: string;
	};
	consent_status?: string;
	others?: {
		willing_for_training?: boolean;
		ready_to_relocate?: boolean;
		source_of_info?: string;
		family_annual_income?: string | number;
		comments?: string;
		[key: string]: any;
	};
	created_at: string;
	updated_at: string;
}

export interface CandidateScreeningCreate {
	status?: string;
	previous_training?: Record<string, any>;
	documents_upload?: Record<string, any>;
	skills?: Record<string, any>;
	family_details?: any[];
	screened_by_id?: number;
	consent_status?: string;
	others?: {
		willing_for_training?: boolean;
		ready_to_relocate?: boolean;
		source_of_info?: string;
		family_annual_income?: string | number;
		comments?: string;
		[key: string]: any;
	};
}

// Candidate Document Types
export interface CandidateDocument {
	id: number;
	candidate_id: number;
	document_type: 'resume' | 'trainer_resume' | 'disability_certificate' | '10th_certificate' | '12th_certificate' | 'degree_certificate' | 'pan_card' | 'aadhar_card' | 'passport_photo' | 'other';
	document_name: string;
	file_path: string;
	file_size?: number;
	mime_type?: string;
	description?: string;
	document_source: 'candidate' | 'trainer';
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface CandidateDocumentCreate {
	document_type: 'resume' | 'trainer_resume' | 'disability_certificate' | '10th_certificate' | '12th_certificate' | 'degree_certificate' | 'pan_card' | 'aadhar_card' | 'passport_photo' | 'other';
	document_name: string;
	file_path: string;
	file_size?: number;
	mime_type?: string;
	description?: string;
	document_source?: 'candidate' | 'trainer';
	is_active?: boolean;
}

// Candidate Counseling Types
export interface CounselingSkill {
	name: string;
	level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CounselingQuestion {
	question: string;
	answer: string;
}

export interface CounselingWorkExperience {
	job_title?: string;
	company?: string;
	years_of_experience?: string;
	currently_working?: boolean;
}

export interface CandidateCounseling {
	id: number;
	candidate_id: number;
	skills?: CounselingSkill[];
	feedback?: string;
	questions?: CounselingQuestion[];
	others?: Record<string, any>;
	workexperience?: CounselingWorkExperience[];
	counselor_name?: string;
	suitable_job_roles?: string[];
	assigned_to?: string[];
	remarks?: string;
	status: 'pending' | 'selected' | 'rejected';
	sub_status?: string;
	counselor_id?: number;
	counseling_date?: string;
	created_at: string;
	updated_at: string;
}

export interface CandidateCounselingCreate {
	skills?: CounselingSkill[];
	feedback?: string;
	questions?: CounselingQuestion[];
	others?: Record<string, any>;
	workexperience?: CounselingWorkExperience[];
	counselor_name?: string;
	suitable_job_roles?: string[];
	assigned_to?: string[];
	remarks?: string;
	status?: 'pending' | 'selected' | 'rejected';
	sub_status?: string;
	counseling_date?: string;
}

export interface CandidateCounselingUpdate extends Partial<CandidateCounselingCreate> { }

export interface Degree {
	degree_name: string;
	specialization: string;
	college_name: string;
	year_of_passing: number;
	percentage: number;
}

export interface EducationDetails {
	degrees: Degree[];
}

export interface DisabilityDetails {
	is_disabled: boolean;
	disability_type?: string;
	disability_percentage?: number;
}

export interface GuardianDetails {
	parent_name?: string;
	relationship?: string;
	parent_phone?: string;
}

export interface WorkExperience {
	is_experienced: boolean;
	currently_employed: boolean;
	year_of_experience?: string;
}

// Main Candidate Types
export interface Candidate {
	id: number;
	public_id: string; // UUID - Used for all API operations
	name: string;
	gender: string;
	dob?: string;
	email: string;
	phone: string;
	whatsapp_number?: string;
	guardian_details?: GuardianDetails;
	pincode: string;
	work_experience?: WorkExperience;
	education_details?: EducationDetails;
	disability_details?: DisabilityDetails;
	city: string;
	district: string;
	state: string;
	created_at: string;
	updated_at: string;
	other?: Record<string, any>;

	// Optional nested relationships (from with_details=true)
	screening?: CandidateScreening;
	documents?: CandidateDocument[];
	counseling?: CandidateCounseling;
}

// Simplified list response (without nested data)
export interface CandidateListItem {
	id: number;
	public_id: string;
	name: string;
	gender: string;
	email: string;
	phone: string;
	whatsapp_number?: string;
	dob?: string;
	pincode: string;
	city: string;
	district: string;
	state: string;
	created_at: string;
	is_disabled?: boolean;
	disability_type?: string;
	education_level?: string;
	specialization?: string;
	screening_status?: string;
	consent_status?: string;
	counseling_status?: string;
	sub_status?: string;
	counselor_name?: string;

	counseling_date?: string;
	feedback?: string;
	skills?: CounselingSkill[];
	questions?: CounselingQuestion[];
	workexperience?: CounselingWorkExperience[];
	documents_uploaded?: string[];
	family_details?: any[];
	source_of_info?: string;
	family_annual_income?: string | number;
	screened_by_name?: string;
	screening_date?: string;
	screening_updated_at?: string;
	disability_percentage?: number;
	screening_comments?: string;
	screening?: CandidateScreening;
	assigned_to?: string[];
	remarks?: string;
	counseling?: CandidateCounseling;

	is_experienced?: boolean;
	year_of_experience?: string;
	currently_employed?: boolean;
	year_of_passing?: number;
	assigned_to_id?: number;
	assigned_to_name?: string;
	registration_type?: string;
}


export interface CandidateCreate extends Omit<Candidate, 'id' | 'public_id' | 'city' | 'district' | 'state' | 'created_at' | 'updated_at' | 'screening' | 'documents' | 'counseling'> {
	city?: string;
	district?: string;
	state?: string;
}

export interface CandidateCheck {
	email: string;
	phone: string;
	pincode: string;
	city?: string;
	district?: string;
	state?: string;
	exclude_public_id?: string;
}

export interface CandidateUpdate {
	name?: string;
	other?: Record<string, any>;
	gender?: string;
	email?: string;
	phone?: string;
	whatsapp_number?: string;
	pincode?: string;
	guardian_details?: GuardianDetails;
	work_experience?: WorkExperience;
	education_details?: EducationDetails;
	disability_details?: DisabilityDetails;
	dob?: string;
	city?: string;
	district?: string;
	state?: string;
}

export interface CandidateStats {
	total: number;
	male: number;
	female: number;
	others: number;
	today: number;
	weekly: number[];
	screened: number;
	not_screened: number;
	total_counseled: number;
	counseling_pending: number;
	counseling_selected: number;
	counseling_rejected: number;
	docs_total: number;
	docs_completed: number;
	docs_pending: number;
	files_collected: number;
	files_to_collect: number;
	files_pending?: number;
	candidates_fully_submitted: number;
	candidates_partially_submitted: number;
	candidates_not_submitted: number;
	pwd_candidates?: number;
	pwd_files_collected?: number;
	pwd_files_to_collect?: number;
	pwd_files_pending?: number;
	non_pwd_candidates?: number;
	non_pwd_files_collected?: number;
	non_pwd_files_to_collect?: number;
	non_pwd_files_pending?: number;
	// Stage 1: All screened candidates — resume + consent_form (Non-PwD=2, PwD=3)
	stage1_total?: number;
	stage1_pwd_count?: number;
	stage1_non_pwd_count?: number;
	stage1_files_collected?: number;
	stage1_files_to_collect?: number;
	stage1_files_pending?: number;
	stage1_pwd_files_collected?: number;
	stage1_pwd_files_to_collect?: number;
	stage1_pwd_files_pending?: number;
	stage1_non_pwd_files_collected?: number;
	stage1_non_pwd_files_to_collect?: number;
	stage1_non_pwd_files_pending?: number;
	stage1_fully_submitted?: number;
	stage1_partially_submitted?: number;
	stage1_not_submitted?: number;
	// Stage 2: Counseling-selected candidates — full 9/10 docs
	stage2_total?: number;
	stage2_pwd_count?: number;
	stage2_non_pwd_count?: number;
	stage2_files_collected?: number;
	stage2_files_to_collect?: number;
	stage2_files_pending?: number;
	stage2_pwd_files_collected?: number;
	stage2_pwd_files_to_collect?: number;
	stage2_pwd_files_pending?: number;
	stage2_non_pwd_files_collected?: number;
	stage2_non_pwd_files_to_collect?: number;
	stage2_non_pwd_files_pending?: number;
	stage2_fully_submitted?: number;
	stage2_partially_submitted?: number;
	stage2_not_submitted?: number;
	screening_distribution?: Record<string, number>;
	counseling_distribution?: Record<string, number>;
	in_training: number;
	moved_to_placement: number;
	got_job: number;
}

export interface ScreeningStats {
	not_screened: number;
	screening_distribution: Record<string, number>;
}

export interface CandidatePaginatedResponse {
	items: CandidateListItem[];
	total: number;
}
