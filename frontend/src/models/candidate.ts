// Candidate Profile Types
export interface CandidateProfile {
	id: number;
	candidate_id: number;
	date_of_birth?: string;
	trained_by_winvinaya: boolean;
	training_domain?: string;
	batch_number?: string;
	training_from?: string;
	training_to?: string;
	willing_for_training: boolean;
	ready_to_relocate: boolean;
	interested_training?: string;
	created_at: string;
	updated_at: string;
}

export interface CandidateProfileCreate {
	date_of_birth?: string;
	trained_by_winvinaya?: boolean;
	training_domain?: string;
	batch_number?: string;
	training_from?: string;
	training_to?: string;
	willing_for_training?: boolean;
	ready_to_relocate?: boolean;
	interested_training?: string;
}

// Candidate Document Types
export interface CandidateDocument {
	id: number;
	candidate_id: number;
	document_type: 'resume' | 'disability_certificate' | 'other';
	document_name: string;
	file_path: string;
	file_size?: number;
	mime_type?: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface CandidateDocumentCreate {
	document_type: 'resume' | 'disability_certificate' | 'other';
	document_name: string;
	file_path: string;
	file_size?: number;
	mime_type?: string;
	description?: string;
}

// Candidate Counseling Types
export interface CandidateCounseling {
	id: number;
	candidate_id: number;
	skills_observed?: string[];
	suitable_training?: string;
	counselor_comments?: string;
	status: 'pending' | 'selected' | 'rejected';
	counselor_id?: number;
	counseling_date?: string;
	created_at: string;
	updated_at: string;
}

export interface CandidateCounselingCreate {
	skills_observed?: string[];
	suitable_training?: string;
	counselor_comments?: string;
	status?: 'pending' | 'selected' | 'rejected';
	counseling_date?: string;
}

// Education Types
export interface Education10th {
	school_name: string;
	year_of_passing: number;
	percentage: number;
}

export interface Education12thOrDiploma {
	institution_name: string;
	year_of_passing: number;
	percentage: number;
	type: string;
}

export interface Degree {
	degree_name: string;
	specialization: string;
	college_name: string;
	year_of_passing: number;
	percentage: number;
}

export interface EducationDetails {
	tenth?: Education10th;
	twelfth_or_diploma?: Education12thOrDiploma;
	degrees: Degree[];
}

export interface DisabilityDetails {
	is_disabled: boolean;
	disability_type?: string;
	disability_percentage?: number;
}

// Main Candidate Types
export interface Candidate {
	public_id: string; // UUID - Used for all API operations
	name: string;
	gender: string;
	email: string;
	phone: string;
	whatsapp_number?: string;
	parent_name?: string;
	parent_phone?: string;
	pincode: string;
	is_experienced: boolean;
	currently_employed: boolean;
	education_details?: EducationDetails;
	disability_details?: DisabilityDetails;
	skills: string[];
	city: string;
	district: string;
	state: string;
	created_at: string;
	updated_at: string;

	// Optional nested relationships (from with_details=true)
	profile?: CandidateProfile;
	documents?: CandidateDocument[];
	counseling?: CandidateCounseling;
}

// Simplified list response (without nested data)
export interface CandidateListItem {
	public_id: string;
	name: string;
	email: string;
	phone: string;
	city: string;
	district: string;
	state: string;
	created_at: string;
	is_disabled?: boolean;
	disability_type?: string;
	education_level?: string;
}

export interface CandidateCreate extends Omit<Candidate, 'public_id' | 'city' | 'district' | 'state' | 'created_at' | 'updated_at' | 'profile' | 'documents' | 'counseling'> { }

export interface CandidateUpdate {
	name?: string;
	gender?: string;
	email?: string;
	phone?: string;
	whatsapp_number?: string;
	parent_name?: string;
	parent_phone?: string;
	pincode?: string;
	is_experienced?: boolean;
	currently_employed?: boolean;
	education_details?: EducationDetails;
	disability_details?: DisabilityDetails;
	skills?: string[];
}

export interface CandidateStats {
	total: number;
	male: number;
	female: number;
	others: number;
	today: number;
	weekly: number[];
}
