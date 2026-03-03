import { createSlice, createAsyncThunk, type ActionReducerMapBuilder, type PayloadAction } from '@reduxjs/toolkit';
import dsrProjectService from '../../services/dsrProjectService';
import dsrActivityService from '../../services/dsrActivityService';
import dsrService from '../../services/dsrService';
import type {
	DSRProject, DSRActivity, DSREntry,
	DSRProjectCreate, DSRActivityCreate, DSREntryCreate,
	DSRStatus, MissingDSR, PaginationResult
} from '../../models/dsr';

interface DSRState {
	projects: DSRProject[];
	activities: DSRActivity[];
	activitiesByProject: Record<string, DSRActivity[]>;
	entries: DSREntry[];
	missingReports: MissingDSR[];
	totalProjects: number;
	totalActivities: number;
	totalEntries: number;
	loading: boolean;
	error: string | null;
}

const initialState: DSRState = {
	projects: [],
	activities: [],
	activitiesByProject: {},
	entries: [],
	missingReports: [],
	totalProjects: 0,
	totalActivities: 0,
	totalEntries: 0,
	loading: false,
	error: null,
};

// --- Project Thunks ---

export const fetchProjects = createAsyncThunk(
	'dsr/fetchProjects',
	async (params: { skip?: number; limit?: number; active_only?: boolean; search?: string } | undefined, { rejectWithValue }) => {
		try {
			const { skip = 0, limit = 100, active_only = false, search } = params || {};
			return await dsrProjectService.getProjects(Number(skip), Number(limit), active_only, search);
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
	async (params: { projectId: string; skip?: number; limit?: number }, { rejectWithValue }) => {
		try {
			const { projectId, skip = 0, limit = 100 } = params;
			return await dsrActivityService.getActivities(Number(skip), Number(limit), projectId);
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activities');
		}
	}
);

export const fetchActivitiesForProject = createAsyncThunk(
	'dsr/fetchActivitiesForProject',
	async (projectId: string, { rejectWithValue }) => {
		try {
			const res = await dsrActivityService.getActivities(0, 500, projectId);
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
				state.entries = action.payload.items;
				state.totalEntries = action.payload.total;
			})
			.addCase(fetchEntry.fulfilled, (state, action: PayloadAction<DSREntry>) => {
				state.loading = false;
				const index = state.entries.findIndex(e => e.public_id === action.payload.public_id);
				if (index !== -1) {
					state.entries[index] = action.payload;
				} else {
					state.entries.push(action.payload);
				}
			})
			.addCase(createEntry.fulfilled, (state, action: PayloadAction<DSREntry>) => {
				state.loading = false;
				state.entries.unshift(action.payload);
				state.totalEntries += 1;
			})
			.addCase(submitEntry.fulfilled, (state, action: PayloadAction<DSREntry>) => {
				state.loading = false;
				const index = state.entries.findIndex(e => e.public_id === action.payload.public_id);
				if (index !== -1) {
					state.entries[index] = action.payload;
				}
			})
			.addCase(deleteEntry.fulfilled, (state, action: PayloadAction<string>) => {
				state.loading = false;
				state.entries = state.entries.filter(e => e.public_id !== action.payload);
				state.totalEntries -= 1;
			})
			// Admin
			.addCase(fetchAdminOverview.fulfilled, (state, action: PayloadAction<PaginationResult<DSREntry>>) => {
				state.loading = false;
				state.entries = action.payload.items;
				state.totalEntries = action.payload.total;
			})
			.addCase(fetchMissingReports.fulfilled, (state, action: PayloadAction<MissingDSR[]>) => {
				state.loading = false;
				state.missingReports = action.payload;
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
