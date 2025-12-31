import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
	id: string;
	title: string;
	message: string;
	timestamp: string;
	read: boolean;
	link?: string;
	type: 'registration' | 'system' | 'update';
}

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	lastCandidateId: string | null;
}

const initialState: NotificationState = {
	notifications: [],
	unreadCount: 0,
	lastCandidateId: null,
};

const notificationSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		addNotification: (state, action: PayloadAction<Omit<Notification, 'read'>>) => {
			const newNotification: Notification = {
				...action.payload,
				read: false,
			};
			state.notifications.unshift(newNotification);
			state.unreadCount += 1;
			// Keep only last 50 notifications
			if (state.notifications.length > 50) {
				state.notifications.pop();
			}
		},
		markAsRead: (state, action: PayloadAction<string>) => {
			const notification = state.notifications.find(n => n.id === action.payload);
			if (notification && !notification.read) {
				notification.read = true;
				state.unreadCount = Math.max(0, state.unreadCount - 1);
			}
		},
		markAllAsRead: (state) => {
			state.notifications.forEach(n => {
				n.read = true;
			});
			state.unreadCount = 0;
		},
		clearAllNotifications: (state) => {
			state.notifications = [];
			state.unreadCount = 0;
		},
		setLastCandidateId: (state, action: PayloadAction<string | null>) => {
			state.lastCandidateId = action.payload;
		},
	},
});

export const { addNotification, markAsRead, markAllAsRead, clearAllNotifications, setLastCandidateId } = notificationSlice.actions;
export default notificationSlice.reducer;
