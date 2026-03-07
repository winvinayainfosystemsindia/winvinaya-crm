export type DSRActivityStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export const DSRActivityStatusValues = {
	PLANNED: 'planned' as DSRActivityStatus,
	IN_PROGRESS: 'in_progress' as DSRActivityStatus,
	COMPLETED: 'completed' as DSRActivityStatus,
	ON_HOLD: 'on_hold' as DSRActivityStatus,
	CANCELLED: 'cancelled' as DSRActivityStatus
};

export type DSRStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export const DSRStatusValues = {
	DRAFT: 'draft' as DSRStatus,
	SUBMITTED: 'submitted' as DSRStatus,
	APPROVED: 'approved' as DSRStatus,
	REJECTED: 'rejected' as DSRStatus
};

export interface DSRUserSnapshot {
	id: number;
	public_id: string;
	full_name: string | null;
	username: string;
	email: string;
}

export interface DSRProject {
	id: number;
	public_id: string;
	name: string;
	owner_id: number;
	owner?: DSRUserSnapshot;
	creator?: DSRUserSnapshot;
	is_active: boolean;
	others?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface DSRActivity {
	id: number;
	public_id: string;
	project_id: number;
	project?: {
		id: number;
		public_id: string;
		name: string;
	};
	name: string;
	description: string | null;
	start_date: string;
	end_date: string;
	actual_end_date: string | null;
	status: DSRActivityStatus;
	is_active: boolean;
	others?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface DSRItem {
	project_public_id: string;
	project_name?: string;
	activity_public_id: string;
	activity_name?: string;
	description: string;
	start_time: string;
	end_time: string;
	hours: number;
}

export interface DSREntry {
	id: number;
	public_id: string;
	user_id: number;
	user?: DSRUserSnapshot;
	report_date: string;
	status: DSRStatus;
	submitted_at: string | null;
	is_previous_day_submission: boolean;
	previous_day_permission_granted_by: number | null;
	items: DSRItem[];
	others?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface DSRProjectCreate {
	name: string;
	owner_user_public_id: string;
	is_active?: boolean;
	others?: Record<string, any>;
}

export interface DSRActivityCreate {
	project_public_id: string;
	name: string;
	description?: string;
	start_date: string;
	end_date: string;
	actual_end_date?: string | null;
	status?: DSRActivityStatus;
	is_active?: boolean;
	others?: Record<string, any>;
}

export interface DSREntryCreate {
	report_date: string;
	items: Omit<DSRItem, 'project_name' | 'activity_name' | 'hours'> & { hours?: number }[];
	others?: Record<string, any>;
}

export interface ImportResult {
	total_rows: number;
	created: number;
	skipped: number;
	errors: Array<{
		row: number;
		error: string;
	}>;
}

export interface MissingDSR extends DSRUserSnapshot {
	role: string;
}

export interface PaginationResult<T> {
	items: T[];
	total: number;
}
