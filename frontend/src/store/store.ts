import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import candidateReducer from './slices/candidateSlice';
import activityLogReducer from './slices/activityLogSlice';
import userReducer from './slices/userSlice';
import trainingReducer from './slices/trainingSlice';
import notificationReducer from './slices/notificationSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
	reducer: {
		ui: uiReducer,
		auth: authReducer,
		candidates: candidateReducer,
		activityLogs: activityLogReducer,
		users: userReducer,
		training: trainingReducer,
		notifications: notificationReducer,
		settings: settingsReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
