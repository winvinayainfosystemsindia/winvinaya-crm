import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import candidateReducer from './slices/candidateSlice';

export const store = configureStore({
	reducer: {
		ui: uiReducer,
		auth: authReducer,
		candidates: candidateReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
