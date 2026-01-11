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
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
