import { createSlice, createAsyncThunk, type ActionReducerMapBuilder, type PayloadAction } from '@reduxjs/toolkit';
import dsrProjectService from '../../services/dsrProjectService';
import dsrActivityService from '../../services/dsrActivityService';
import dsrService from '../../services/dsrService';
import type {
	DSRProject, DSRActivity, DSREntry,
	DSRProjectCreate, DSRActivityCreate, DSREntryCreate,
	DSRStatus, MissingDSR, PaginationResult,
	DSRPermissionRequest, DSRPermissionStats
} from '../../models/dsr';

interface DSRState {
	projects: DSRProject[];
	activities: DSRActivity[];
	activitiesByProject: Record<string, DSRActivity[]>;
	myEntries: DSREntry[];
	adminEntries: DSREntry[];
	calendarEntries: DSREntry[];
	missingReports: MissingDSR[];
	permissionRequests: DSRPermissionRequest[];
	permissionStats: DSRPermissionStats | null;
	totalProjects: number;
	totalActivities: number;
	totalMyEntries: number;
	totalAdminEntries: number;
	totalPermissionRequests: number;
	loading: boolean;
	error: string | null;
}

const initialState: DSRState = {
	projects: [],
	activities: [],
	activitiesByProject: {},
	myEntries: [],
	adminEntries: [],
	calendarEntries: [],
	missingReports: [],
	permissionRequests: [],
	permissionStats: null,
	totalProjects: 0,
	totalActivities: 0,
	totalMyEntries: 0,
	totalAdminEntries: 0,
	totalPermissionRequests: 0,
	loading: false,
	error: null,
};

// --- Project Thunks ---

export const fetchProjects = createAsyncThunk(
	'dsr/fetchProjects',
	async (params: { skip?: number; limit?: number; active_only?: boolean; search?: string; assigned_to?: string } | undefined, { rejectWithValue }) => {
		try {
			const { skip = 0, limit = 100, active_only = false, search, assigned_to } = params || {};
			return await dsrProjectService.getProjects(Number(skip), Number(limit), active_only, search, assigned_to);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch projects');
		}
	}
);

export const fetchProject = createAsyncThunk(
	'dsr/fetchProject',
	async (publicId: string, { rejectWithValue }) => {
		try {
			return await dsrProjectService.getProject(publicId);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch project');
		}
	}
);

export const createProject = createAsyncThunk(
	'dsr/createProject',
	async (data: DSRProjectCreate, { rejectWithValue }) => {
		try {
			return await dsrProjectService.createProject(data);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to create project');
		}
	}
);

export const updateProject = createAsyncThunk(
	'dsr/updateProject',
	async ({ publicId, data }: { publicId: string; data: Partial<DSRProjectCreate> }, { rejectWithValue }) => {
		try {
			return await dsrProjectService.updateProject(publicId, data);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to update project');
		}
	}
);

// --- Activity Thunks ---

export const fetchActivities = createAsyncThunk(
	'dsr/fetchActivities',
	async (params: { projectId: string; skip?: number; limit?: number; search?: string; status?: any; active_only?: boolean; assigned_to?: string }, { rejectWithValue }) => {
		try {
			const { projectId, skip = 0, limit = 100, search, status, active_only, assigned_to } = params;
			return await dsrActivityService.getActivities(Number(skip), Number(limit), projectId, status, active_only, search, assigned_to);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activities');
		}
	}
);

export const fetchActivitiesForProject = createAsyncThunk(
	'dsr/fetchActivitiesForProject',
	async ({ projectId, assigned_to }: { projectId: string; assigned_to?: string }, { rejectWithValue }) => {
		try {
			const res = await dsrActivityService.getActivities(0, 500, projectId, undefined, undefined, undefined, assigned_to);
			return { projectId, activities: res.items };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activities');
		}
	}
);

export const createActivity = createAsyncThunk(
	'dsr/createActivity',
	async (data: DSRActivityCreate, { rejectWithValue }) => {
		try {
			return await dsrActivityService.createActivity(data);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to create activity');
		}
	}
);

export const updateActivity = createAsyncThunk(
	'dsr/updateActivity',
	async ({ publicId, data }: { publicId: string; data: Partial<DSRActivityCreate> }, { rejectWithValue }) => {
		try {
			return await dsrActivityService.updateActivity(publicId, data);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to update activity');
		}
	}
);

export const deleteActivity = createAsyncThunk(
	'dsr/deleteActivity',
	async (publicId: string, { rejectWithValue }) => {
		try {
			await dsrActivityService.deleteActivity(publicId);
			return publicId;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to delete activity');
		}
	}
);

// --- Entry Thunks ---

export const fetchEntries = createAsyncThunk(
	'dsr/fetchEntries',
	async (params: { skip?: number; limit?: number; date_from?: string; date_to?: string; status?: DSRStatus } | undefined, { rejectWithValue }) => {
		try {
			const { skip = 0, limit = 100, date_from, date_to, status } = params || {};
			return await dsrService.getEntries(Number(skip), Number(limit), date_from, date_to, status);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch entries');
		}
	}
);

export const fetchMyEntries = createAsyncThunk(
	'dsr/fetchMyEntries',
	async (params: { skip?: number; limit?: number; date_from?: string; date_to?: string; status?: DSRStatus } | undefined, { rejectWithValue }) => {
		try {
			const { skip = 0, limit = 100, date_from, date_to, status } = params || {};
			return await dsrService.getMyEntries(Number(skip), Number(limit), date_from, date_to, status);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch your entries');
		}
	}
);

export const fetchEntry = createAsyncThunk(
	'dsr/fetchEntry',
	async (publicId: string, { rejectWithValue }) => {
		try {
			return await dsrService.getEntry(publicId);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch entry');
		}
	}
);

export const createEntry = createAsyncThunk(
	'dsr/createEntry',
	async (data: DSREntryCreate, { rejectWithValue }) => {
		try {
			return await dsrService.createEntry(data);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to create DSR entry');
		}
	}
);

export const submitEntry = createAsyncThunk(
	'dsr/submitEntry',
	async (publicId: string, { rejectWithValue }) => {
		try {
			return await dsrService.submitEntry(publicId);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to submit DSR entry');
		}
	}
);

export const deleteEntry = createAsyncThunk(
	'dsr/deleteEntry',
	async (publicId: string, { rejectWithValue }) => {
		try {
			await dsrService.deleteEntry(publicId);
			return publicId;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to delete DSR entry');
		}
	}
);

// --- Admin Thunks ---

export const fetchAdminOverview = createAsyncThunk(
	'dsr/fetchAdminOverview',
	async (params: { skip?: number; limit?: number; date_from?: string; date_to?: string } | undefined, { rejectWithValue }) => {
		try {
			const { skip = 0, limit = 100, date_from, date_to } = params || {};
			return await dsrService.getAdminOverview(Number(skip), Number(limit), date_from, date_to);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch admin overview');
		}
	}
);

export const fetchMissingReports = createAsyncThunk(
	'dsr/fetchMissingReports',
	async (date: string, { rejectWithValue }) => {
		try {
			return await dsrService.getMissingReports(date);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch missing reports');
		}
	}
);

export const grantDSRPermission = createAsyncThunk(
	'dsr/grantPermission',
	async (data: { user_public_id: string; target_date: string; expiry_hours?: number }, { rejectWithValue }) => {
		try {
			return await dsrService.grantPermission(data);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to grant permission');
		}
	}
);

export const sendDSRReminders = createAsyncThunk(
	'dsr/sendReminders',
	async (date: string, { rejectWithValue }) => {
		try {
			return await dsrService.sendReminders(date);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to send reminders');
		}
	}
);

export const fetchPermissionRequests = createAsyncThunk(
	'dsr/fetchPermissionRequests',
	async (params: { skip?: number; limit?: number; user_id?: number; status?: string } | undefined, { rejectWithValue }) => {
		try {
			const { skip = 0, limit = 100, user_id, status } = params || {};
			return await dsrService.getPermissionRequests(skip, limit, user_id, status);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch permission requests');
		}
	}
);

export const handlePermissionRequestAction = createAsyncThunk(
	'dsr/handlePermissionRequest',
	async ({ publicId, status, admin_notes }: { publicId: string; status: string; admin_notes?: string }, { rejectWithValue }) => {
		try {
			return await dsrService.handlePermissionRequest(publicId, { status, admin_notes });
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to handle permission request');
		}
	}
);

export const fetchPermissionStats = createAsyncThunk(
	'dsr/fetchPermissionStats',
	async (params: { user_id?: number } | undefined, { rejectWithValue }) => {
		try {
			const { user_id } = params || {};
			return await dsrService.getPermissionStats(user_id);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch permission stats');
		}
	}
);

const dsrSlice = createSlice({
	name: 'dsr',
	initialState,
	reducers: {
		clearDSRError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builderValue: ActionReducerMapBuilder<DSRState>) => {
		builderValue
			// Projects
			.addCase(fetchProjects.fulfilled, (state, action: PayloadAction<PaginationResult<DSRProject>>) => {
				state.loading = false;
				state.projects = action.payload.items;
				state.totalProjects = action.payload.total;
			})
			.addCase(fetchProject.fulfilled, (state, action: PayloadAction<DSRProject>) => {
				state.loading = false;
				const index = state.projects.findIndex(p => p.public_id === action.payload.public_id);
				if (index !== -1) {
					state.projects[index] = action.payload;
				} else {
					state.projects.push(action.payload);
				}
			})
			.addCase(createProject.fulfilled, (state, action: PayloadAction<DSRProject>) => {
				state.loading = false;
				state.projects.unshift(action.payload);
				state.totalProjects += 1;
			})
			.addCase(updateProject.fulfilled, (state, action: PayloadAction<DSRProject>) => {
				state.loading = false;
				const index = state.projects.findIndex(p => p.public_id === action.payload.public_id);
				if (index !== -1) {
					state.projects[index] = action.payload;
				}
			})
			// Activities
			.addCase(fetchActivities.fulfilled, (state, action: PayloadAction<PaginationResult<DSRActivity>>) => {
				state.loading = false;
				state.activities = action.payload.items;
				state.totalActivities = action.payload.total;
			})
			.addCase(fetchActivitiesForProject.fulfilled, (state, action: PayloadAction<{ projectId: string; activities: DSRActivity[] }>) => {
				state.loading = false;
				state.activitiesByProject[action.payload.projectId] = action.payload.activities;
			})
			.addCase(createActivity.fulfilled, (state, action: PayloadAction<DSRActivity>) => {
				state.loading = false;
				state.activities.unshift(action.payload);
				state.totalActivities += 1;
			})
			.addCase(updateActivity.fulfilled, (state, action: PayloadAction<DSRActivity>) => {
				state.loading = false;
				const index = state.activities.findIndex(a => a.public_id === action.payload.public_id);
				if (index !== -1) {
					state.activities[index] = action.payload;
				}
			})
			.addCase(deleteActivity.fulfilled, (state, action: PayloadAction<string>) => {
				state.loading = false;
				state.activities = state.activities.filter(a => a.public_id !== action.payload);
				state.totalActivities -= 1;
			})
			// Entries
			.addCase(fetchEntries.fulfilled, (state, action: PayloadAction<PaginationResult<DSREntry>>) => {
				state.loading = false;
				state.calendarEntries = action.payload.items;
			})
			.addCase(fetchMyEntries.fulfilled, (state, action: PayloadAction<PaginationResult<DSREntry>>) => {
				state.loading = false;
				state.myEntries = action.payload.items;
				state.totalMyEntries = action.payload.total;
			})
			.addCase(fetchEntry.fulfilled, (state, action: PayloadAction<DSREntry>) => {
				state.loading = false;
				// Update in all relevant lists if present
				[state.myEntries, state.adminEntries, state.calendarEntries].forEach(list => {
					const index = list.findIndex(e => e.public_id === action.payload.public_id);
					if (index !== -1) list[index] = action.payload;
				});
			})
			.addCase(createEntry.fulfilled, (state, action: PayloadAction<DSREntry>) => {
				state.loading = false;

				// Deduplicate myEntries
				const myIndex = state.myEntries.findIndex(e => e.public_id === action.payload.public_id);
				if (myIndex !== -1) {
					state.myEntries[myIndex] = action.payload;
				} else {
					state.myEntries.unshift(action.payload);
					state.totalMyEntries += 1;
				}

				// Deduplicate calendarEntries
				const calIndex = state.calendarEntries.findIndex(e => e.public_id === action.payload.public_id);
				if (calIndex !== -1) {
					state.calendarEntries[calIndex] = action.payload;
				} else {
					state.calendarEntries.unshift(action.payload);
				}
			})
			.addCase(submitEntry.fulfilled, (state, action: PayloadAction<DSREntry>) => {
				state.loading = false;
				[state.myEntries, state.adminEntries, state.calendarEntries].forEach(list => {
					const index = list.findIndex(e => e.public_id === action.payload.public_id);
					if (index !== -1) list[index] = action.payload;
				});
			})
			.addCase(deleteEntry.fulfilled, (state, action: PayloadAction<string>) => {
				state.loading = false;
				state.myEntries = state.myEntries.filter(e => e.public_id !== action.payload);
				state.totalMyEntries -= 1;
				state.adminEntries = state.adminEntries.filter(e => e.public_id !== action.payload);
				state.calendarEntries = state.calendarEntries.filter(e => e.public_id !== action.payload);
			})
			// Admin
			.addCase(fetchAdminOverview.fulfilled, (state, action: PayloadAction<PaginationResult<DSREntry>>) => {
				state.loading = false;
				state.adminEntries = action.payload.items;
				state.totalAdminEntries = action.payload.total;
			})
			.addCase(fetchMissingReports.fulfilled, (state, action: PayloadAction<MissingDSR[]>) => {
				state.loading = false;
				state.missingReports = action.payload;
			})
			.addCase(fetchPermissionRequests.fulfilled, (state, action: PayloadAction<{ items: any[]; total: number }>) => {
				state.loading = false;
				state.permissionRequests = action.payload.items;
				state.totalPermissionRequests = action.payload.total;
			})
			.addCase(handlePermissionRequestAction.fulfilled, (state, action: PayloadAction<DSRPermissionRequest>) => {
				state.loading = false;
				const index = state.permissionRequests.findIndex(r => r.public_id === action.payload.public_id);
				if (index !== -1) {
					state.permissionRequests[index] = action.payload;
				}
			})
			.addCase(fetchPermissionStats.fulfilled, (state, action: PayloadAction<DSRPermissionStats>) => {
				state.loading = false;
				state.permissionStats = action.payload;
			})
			.addMatcher(
				(action) => action.type.startsWith('dsr/') && action.type.endsWith('/pending'),
				(state) => {
					state.loading = true;
					state.error = null;
				}
			)
			.addMatcher(
				(action) => action.type.startsWith('dsr/') && action.type.endsWith('/rejected'),
				(state, action: any) => {
					state.loading = false;
					state.error = action.payload || 'An unknown error occurred';
				}
			)
			.addMatcher(
				(action) => action.type.startsWith('dsr/') && action.type.endsWith('/fulfilled'),
				(state) => {
					state.loading = false;
				}
			);
	},
});

export const { clearDSRError } = dsrSlice.actions;
export default dsrSlice.reducer;
