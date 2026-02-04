import React from 'react';
import {
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Box,
	Typography,
	Divider
} from '@mui/material';
import {
	ListAlt as ListIcon,
	Psychology as PsychologyIcon,
	Settings as SettingsIcon,
	Person as PersonIcon,
	Security as SecurityIcon,
	Notifications as NotificationsIcon
} from '@mui/icons-material';

interface SettingsSidebarProps {
	currentTab: number;
	onTabChange: (tab: number) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ currentTab, onTabChange }) => {
	const menuItems = [
		{ id: 0, label: 'Screening Fields', icon: <ListIcon />, category: 'Customization' },
		{ id: 1, label: 'Counseling Fields', icon: <ListIcon />, category: 'Customization' },
		{ id: 2, label: 'AI Configuration', icon: <PsychologyIcon />, category: 'Advanced' },
		{ id: 3, label: 'General', icon: <SettingsIcon />, category: 'System', disabled: true },
		{ id: 4, label: 'User Profile', icon: <PersonIcon />, category: 'Account', disabled: true },
		{ id: 5, label: 'Security', icon: <SecurityIcon />, category: 'Account', disabled: true },
		{ id: 6, label: 'Notifications', icon: <NotificationsIcon />, category: 'Account', disabled: true },
	];

	const categories = Array.from(new Set(menuItems.map(item => item.category)));

	return (
		<Box sx={{ width: '100%', bgcolor: '#ffffff', borderRight: '1px solid #eaeded', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
			<Box sx={{ p: 3 }}>
				<Typography variant="h6" sx={{ fontWeight: 800, color: '#232f3e', fontSize: '1.1rem' }}>
					Settings
				</Typography>
			</Box>
			<Divider sx={{ mb: 2 }} />

			<List sx={{ px: 2 }}>
				{categories.map((category) => (
					<React.Fragment key={category}>
						<Typography variant="caption" sx={{ px: 2, py: 1.5, display: 'block', fontWeight: 700, color: '#545b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							{category}
						</Typography>
						{menuItems.filter(item => item.category === category).map((item) => (
							<ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
								<ListItemButton
									selected={currentTab === item.id}
									disabled={item.disabled}
									onClick={() => onTabChange(item.id)}
									sx={{
										borderRadius: '4px',
										'&.Mui-selected': {
											bgcolor: '#f2f3f3',
											color: '#ec7211',
											'& .MuiListItemIcon-root': { color: '#ec7211' },
											'&:hover': { bgcolor: '#f2f3f3' }
										},
										'&:hover': { bgcolor: '#f2f3f3' }
									}}
								>
									<ListItemIcon sx={{ minWidth: 40, color: currentTab === item.id ? '#ec7211' : '#545b64' }}>
										{item.icon}
									</ListItemIcon>
									<ListItemText
										primary={item.label}
										primaryTypographyProps={{
											fontWeight: currentTab === item.id ? 700 : 500,
											fontSize: '0.9rem'
										}}
									/>
								</ListItemButton>
							</ListItem>
						))}
						<Box sx={{ height: 16 }} />
					</React.Fragment>
				))}
			</List>
		</Box>
	);
};

export default SettingsSidebar;
