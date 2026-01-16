import type { Contact } from './contact';

export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
export type CompanyStatus = 'active' | 'inactive' | 'prospect' | 'customer';

export interface Company {
	id: number;
	public_id: string;
	name: string;
	industry?: string;
	company_size?: CompanySize;
	website?: string;
	phone?: string;
	email?: string;
	status: CompanyStatus;
	address?: Record<string, any>;
	social_media?: Record<string, any>;
	custom_fields?: Record<string, any>;
	contacts?: Contact[];
	created_at: string;
	updated_at: string;
}

export interface CompanyCreate extends Omit<Company, 'id' | 'public_id' | 'created_at' | 'updated_at'> { }
export interface CompanyUpdate extends Partial<CompanyCreate> { }

export interface CompanyStats {
	total: number;
	by_status: Record<string, number>;
	top_industries: { industry: string; count: number }[];
}

export interface CompanyPaginatedResponse {
	items: Company[];
	total: number;
}
