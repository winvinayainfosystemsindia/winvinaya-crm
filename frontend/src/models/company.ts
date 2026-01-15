export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
export type CompanyStatus = 'prospect' | 'partner' | 'client' | 'inactive';

export interface Company {
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
	created_at: string;
	updated_at: string;
}

export interface CompanyCreate extends Omit<Company, 'public_id' | 'created_at' | 'updated_at'> { }
export interface CompanyUpdate extends Partial<CompanyCreate> { }

export interface CompanyStats {
	total: number;
	by_status: Record<string, number>;
	top_industries: any[];
}

export interface CompanyPaginatedResponse {
	items: Company[];
	total: number;
}
