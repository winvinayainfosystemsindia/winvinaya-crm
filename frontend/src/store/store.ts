import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import candidateReducer from './slices/candidateSlice';
import activityLogReducer from './slices/activityLogSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
	reducer: {
		ui: uiReducer,
		auth: authReducer,
		candidates: candidateReducer,
		activityLogs: activityLogReducer,
		users: userReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
