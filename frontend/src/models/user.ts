// frontend\src\models\user.ts
export interface User {
	id: number;
	username: string;
	email: string;
	full_name: string;
	is_active: boolean;
	is_verified: boolean;
	role: 'admin' | 'manager' | 'sourcing' | 'placement' | 'trainer';
	created_at?: string;
	updated_at?: string;
}

export interface UserCreate {
	email: string;
	username: string;
	full_name: string;
	password: string;
	is_active: boolean;
	is_verified: boolean;
	role: string;
}

export interface UserUpdate {
	email?: string;
	username?: string;
	full_name?: string;
	password?: string;
	is_active?: boolean;
	is_verified?: boolean;
	role?: string;
}