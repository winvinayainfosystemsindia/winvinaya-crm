import React from 'react';
import {
	Box,
	Popover,
	Typography,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Divider,
	Button,
	IconButton,
	alpha,
	ListItemButton
} from '@mui/material';
import {
	PersonAdd as PersonIcon,
	Notifications as NotificationsIcon,
	ClearAll as ClearIcon,
	Circle as DotIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { markAllAsRead, clearAllNotifications, markAsRead } from '../../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

interface NotificationPopoverProps {
	anchorEl: HTMLElement | null;
	onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ anchorEl, onClose }) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { notifications } = useAppSelector((state) => state.notifications);
	const open = Boolean(anchorEl);

	const handleMarkAllRead = () => {
		dispatch(markAllAsRead());
	};

	const handleClearAll = () => {
		dispatch(clearAllNotifications());
		onClose();
	};

	const handleNotificationClick = (id: string, link?: string) => {
		dispatch(markAsRead(id));
		if (link) {
			navigate(link);
		}
		onClose();
	};

	return (
		<Popover
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			PaperProps={{
				sx: {
					width: 360,
					maxHeight: 500,
					mt: 1.5,
					borderRadius: '4px',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column'
				}
			}}
		>
			<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e' }}>
					Notifications
				</Typography>
				<Box>
					<Button size="small" onClick={handleMarkAllRead} sx={{ textTransform: 'none', fontWeight: 600, mr: 1 }}>
						Mark all as read
					</Button>
					<IconButton size="small" onClick={handleClearAll} title="Clear all">
						<ClearIcon fontSize="small" />
					</IconButton>
				</Box>
			</Box>

			<Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
				{notifications.length === 0 ? (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<NotificationsIcon sx={{ fontSize: 48, color: '#d5dbdb', mb: 1 }} />
						<Typography variant="body2" sx={{ color: '#545b64' }}>
							You don't have any notifications right now.
						</Typography>
					</Box>
				) : (
					<List sx={{ py: 0 }}>
						{notifications.map((n, index) => (
							<React.Fragment key={n.id}>
								<ListItem
									disablePadding
									sx={{
										backgroundColor: n.read ? 'transparent' : alpha('#ec7211', 0.04),
										'&:hover': {
											backgroundColor: alpha('#000000', 0.04)
										},
									}}
								>
									<ListItemButton
										onClick={() => handleNotificationClick(n.id, n.link)}
										sx={{
											py: 1.5,
											px: 2,
											alignItems: 'flex-start'
										}}
									>
										<ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
											<PersonIcon color="primary" fontSize="small" />
										</ListItemIcon>
										<ListItemText
											primary={
												<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
													<Typography variant="body2" sx={{ fontWeight: n.read ? 500 : 700, color: '#232f3e' }}>
														{n.title}
													</Typography>
													{!n.read && <DotIcon sx={{ fontSize: 10, color: '#ec7211' }} />}
												</Box>
											}
											secondary={
												<>
													<Typography variant="caption" sx={{ display: 'block', color: '#545b64', mt: 0.5, lineHeight: 1.4 }}>
														{n.message}
													</Typography>
													<Typography variant="caption" sx={{ display: 'block', color: '#aab7b8', mt: 0.5 }}>
														{n.timestamp}
													</Typography>
												</>
											}
										/>
									</ListItemButton>
								</ListItem>
								{index < notifications.length - 1 && <Divider />}
							</React.Fragment>
						))}
					</List>
				)}
			</Box>

			<Divider />
			<Box sx={{ p: 1, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
				<Button fullWidth onClick={() => { navigate('/activity-logs'); onClose(); }} sx={{ textTransform: 'none', color: '#0073bb', fontWeight: 600 }}>
					View all activity
				</Button>
			</Box>
		</Popover>
	);
};

export default NotificationPopover;
