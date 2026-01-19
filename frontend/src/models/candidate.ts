// Candidate Screening Types
export interface CandidateScreening {
	id: number;
	candidate_id: number;
	status?: string;
	previous_training?: Record<string, any>;
	documents_upload?: Record<string, any>;
	skills?: Record<string, any>;
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
	document_type: 'resume' | 'disability_certificate' | '10th_certificate' | '12th_certificate' | 'degree_certificate' | 'other';
	document_name: string;
	file_path: string;
	file_size?: number;
	mime_type?: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface CandidateDocumentCreate {
	document_type: 'resume' | 'disability_certificate' | '10th_certificate' | '12th_certificate' | 'degree_certificate' | 'other';
	document_name: string;
	file_path: string;
	file_size?: number;
	mime_type?: string;
	description?: string;
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

export interface CandidateCounseling {
	id: number;
	candidate_id: number;
	skills?: CounselingSkill[];
	feedback?: string;
	questions?: CounselingQuestion[];
	others?: Record<string, any>;
	counselor_name?: string;
	status: 'pending' | 'selected' | 'rejected';
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
	counselor_name?: string;
	status?: 'pending' | 'selected' | 'rejected';
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

	// Optional nested relationships (from with_details=true)
	screening?: CandidateScreening;
	documents?: CandidateDocument[];
	counseling?: CandidateCounseling;
}

// Simplified list response (without nested data)
export interface CandidateListItem {
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
	screening_status?: string;
	counseling_status?: string;
	counselor_name?: string;

	counseling_date?: string;
	documents_uploaded?: string[];
}


export interface CandidateCreate extends Omit<Candidate, 'public_id' | 'city' | 'district' | 'state' | 'created_at' | 'updated_at' | 'screening' | 'documents' | 'counseling'> { }

export interface CandidateUpdate {
	name?: string;
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
	screening_distribution?: Record<string, number>;
}

export interface CandidatePaginatedResponse {
	items: CandidateListItem[];
	total: number;
}
