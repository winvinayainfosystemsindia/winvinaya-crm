export interface AnalysisSkill {
	skill: string;
	level: string; // e.g., Beginner, Intermediate, Expert
	rating: number; // 0-10
}

export type PlacementRecommendation = 'ready_for_placement' | 'needs_additional_training' | 'assign_dsr_project' | 'counseling_required';
export type AnalysisStatus = 'draft' | 'completed';

export interface CandidateAnalysis {
	id: number;
	batch_id: number;
	candidate_id: number;
	analyst_name?: string;
	analysis_date: string;
	strengths?: string;
	weaknesses?: string;
	opportunities?: string;
	threats?: string;
	other?: any;
	skills?: AnalysisSkill[];
	recommendation: PlacementRecommendation;
	status: AnalysisStatus;
	created_at: string;
	updated_at: string;
	candidate?: {
		id: number;
		public_id: string;
		name: string;
		documents?: any[];
	};
	batch?: {
		id: number;
		public_id: string;
		batch_name: string;
	};
}

export interface CandidateAnalysisCreate {
	batch_id: number;
	candidate_id: number;
	analyst_name?: string;
	analysis_date: string;
	strengths?: string;
	weaknesses?: string;
	opportunities?: string;
	threats?: string;
	other?: any;
	skills?: AnalysisSkill[];
	recommendation: PlacementRecommendation;
	status: AnalysisStatus;
}

export interface CandidateAnalysisUpdate {
	analyst_name?: string;
	analysis_date?: string;
	strengths?: string;
	weaknesses?: string;
	opportunities?: string;
	threats?: string;
	other?: any;
	skills?: AnalysisSkill[];
	recommendation?: PlacementRecommendation;
	status?: AnalysisStatus;
}
