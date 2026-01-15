import type { Company } from './company';
import type { Contact } from './contact';
import type { Lead } from './lead';

export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'on_hold';
export type DealType = 'new_business' | 'existing_business' | 'renewal' | 'upsell';

export interface Deal {
	public_id: string;
	company_id?: number;
	contact_id?: number;
	lead_id?: number;
	assigned_to: number;
	title: string;
	description?: string;
	deal_stage: DealStage;
	deal_type: DealType;
	win_probability: number;
	deal_value: number;
	currency: string;
	payment_terms?: string;
	contract_duration_months?: number;
	expected_close_date: string;
	actual_close_date?: string;
	lost_reason?: string;
	lost_to_competitor?: string;
	competitors?: string[];
	products_services?: any[];
	next_action?: Record<string, any>;
	custom_fields?: Record<string, any>;
	created_at: string;
	updated_at: string;
	company?: Company;
	contact?: Contact;
	original_lead?: Lead;
	assigned_user?: any;
}

export interface DealCreate extends Omit<Deal, 'public_id' | 'created_at' | 'updated_at' | 'company' | 'contact' | 'original_lead' | 'assigned_user' | 'actual_close_date'> { }
export interface DealUpdate extends Partial<DealCreate> {
	actual_close_date?: string;
}

export interface DealPaginatedResponse {
	items: Deal[];
	total: number;
}

export interface DealPipelineSummary {
	total_value: number;
	count: number;
	by_stage: Record<string, { count: number, value: number }>;
}
