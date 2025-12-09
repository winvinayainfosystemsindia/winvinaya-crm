export interface User {
	id: number;
	email: string;
	username: string;
	full_name?: string;
	is_active: boolean;
	is_verified: boolean;
	role: string;
	created_at: string;
	updated_at: string;
}

export interface Token {
	access_token: string;
	refresh_token: string;
	token_type: string;
}

export interface LoginResponse extends Token { }

export interface RegisterResponse extends User { }
