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

export interface Candidate {
	id: number;
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
}

// Reusing the Candidate interface for now, but omitting read-only fields for creation if needed.
// Ideally, this should mirror CandidateCreate from backend.
export interface CandidateCreate extends Omit<Candidate, 'id' | 'city' | 'district' | 'state' | 'created_at' | 'updated_at'> { }
