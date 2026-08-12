import api from './api';

export interface UnifiedReportParams {
	skip?: number;
	limit?: number;
	search?: string;
	// Candidate filters
	gender?: string;
	disability_types?: string;
	education_levels?: string;
	cities?: string;
	disability_percentages?: string;
	year_of_passing?: string;
	year_of_experience?: string;
	is_experienced?: boolean;
	currently_employed?: boolean;
	registration_type?: string;
	status_of_beneficiary?: string;
	created_from?: string;
	created_to?: string;
	// Screening filters
	screening_status?: string;
	consent_status?: string;
	screening_reason?: string;
	// Counseling filters
	counseling_status?: string;
	// Document filters
	has_resume?: boolean;
	has_disability_cert?: boolean;
	// Training filters
	batch_ids?: string;
	batch_tag?: string;
	training_status?: string;
	is_dropout?: boolean;
	// Mock interview filters
	mock_interview_status?: string;
	// Analysis filters
	recommendation?: string;
	// Placement filters
	company_id?: number;
	job_role_id?: string;
	placement_status?: string;
	offer_response?: string;
	joining_status?: string;
	// Dynamic fields
	extra_filters?: string;
}

const unifiedReportService = {
	async getReport(params: UnifiedReportParams): Promise<{ items: any[]; total: number }> {
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				queryParams.append(key, String(value));
			}
		});

		const response = await api.get(`/unified-report?${queryParams.toString()}`);
		return response.data;
	},

	async exportReport(params: UnifiedReportParams & { columns?: string }): Promise<any> {
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				queryParams.append(key, String(value));
			}
		});

		const response = await api.post(`/unified-report/export?${queryParams.toString()}`);
		return response.data;
	},
};

export default unifiedReportService;
