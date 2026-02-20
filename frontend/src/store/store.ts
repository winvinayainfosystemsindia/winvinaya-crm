import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import candidateReducer from './slices/candidateSlice';
import activityLogReducer from './slices/activityLogSlice';
import userReducer from './slices/userSlice';
import trainingReducer from './slices/trainingSlice';
import notificationReducer from './slices/notificationSlice';
import settingsReducer from './slices/settingsSlice';
import mockInterviewReducer from './slices/mockInterviewSlice';
import trainingPlanReducer from './slices/trainingPlanSlice';
import screeningAssignmentReducer from './slices/screeningAssignmentSlice';

import companyReducer from './slices/companySlice';
import contactReducer from './slices/contactSlice';
import leadReducer from './slices/leadSlice';
import dealReducer from './slices/dealSlice';
import crmTaskReducer from './slices/crmTaskSlice';
import crmActivityReducer from './slices/crmActivitySlice';
import healthReducer from './slices/healthSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		ui: uiReducer,
		training: trainingReducer,
		candidates: candidateReducer,
		activityLogs: activityLogReducer,
		users: userReducer,
		settings: settingsReducer,
		notifications: notificationReducer,
		mockInterviews: mockInterviewReducer,
		trainingPlan: trainingPlanReducer,
		// CRM Slices
		companies: companyReducer,
		contacts: contactReducer,
		leads: leadReducer,
		deals: dealReducer,
		crmTasks: crmTaskReducer,
		crmActivities: crmActivityReducer,
		// System Health
		health: healthReducer,
		screeningAssignments: screeningAssignmentReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
