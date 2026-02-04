import React from 'react';
import {
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Box,
	Typography,
	Divider,
	useTheme,
	alpha
} from '@mui/material';
import {
	ListAlt as ListIcon,
	Psychology as PsychologyIcon,
	Settings as SettingsIcon,
	Person as PersonIcon,
	Security as SecurityIcon,
	Notifications as NotificationsIcon,
	ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

interface SettingsSidebarProps {
	currentTab: number;
	onTabChange: (tab: number) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ currentTab, onTabChange }) => {
	const theme = useTheme();

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
		<Box sx={{
			width: '100%',
			bgcolor: '#ffffff',
			borderRight: '1px solid #eaeded',
			height: '100%',
			minHeight: 'calc(100vh - 64px)',
			py: 2
		}}>
			<Box sx={{ px: 3, pb: 2 }}>
				<Typography variant="h6" sx={{
					fontWeight: 700,
					color: '#1a1c21',
					fontSize: '1rem',
					display: 'flex',
					alignItems: 'center',
					gap: 1
				}}>
					<SettingsIcon sx={{ fontSize: '1.2rem', color: '#545b64' }} />
					Configuration
				</Typography>
			</Box>

			<Divider sx={{ mb: 1, borderColor: '#f2f3f3' }} />

			<List sx={{ px: 1.5 }}>
				{categories.map((category) => (
					<Box key={category} sx={{ mb: 2 }}>
						<Typography variant="caption" sx={{
							px: 2,
							py: 1,
							display: 'block',
							fontWeight: 700,
							color: '#6b7280',
							textTransform: 'uppercase',
							letterSpacing: '0.05em',
							fontSize: '0.65rem'
						}}>
							{category}
						</Typography>
						{menuItems.filter(item => item.category === category).map((item) => (
							<ListItem key={item.id} disablePadding sx={{ mb: 0.25 }}>
								<ListItemButton
									selected={currentTab === item.id}
									disabled={item.disabled}
									onClick={() => onTabChange(item.id)}
									sx={{
										borderRadius: '6px',
										py: 1,
										'&.Mui-selected': {
											bgcolor: alpha(theme.palette.primary.main, 0.08),
											color: theme.palette.primary.main,
											'& .MuiListItemIcon-root': { color: theme.palette.primary.main },
											'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
										},
										'&:hover': { bgcolor: '#f9fafb' },
										transition: 'all 0.2s ease'
									}}
								>
									<ListItemIcon sx={{
										minWidth: 36,
										color: currentTab === item.id ? theme.palette.primary.main : '#64748b'
									}}>
										{React.cloneElement(item.icon as React.ReactElement<any>, { sx: { fontSize: '1.2rem' } })}
									</ListItemIcon>
									<ListItemText
										primary={item.label}
										primaryTypographyProps={{
											fontWeight: currentTab === item.id ? 600 : 500,
											fontSize: '0.875rem',
											color: currentTab === item.id ? theme.palette.primary.main : '#334155'
										}}
									/>
									{currentTab === item.id && (
										<ChevronRightIcon sx={{ fontSize: '1rem', opacity: 0.5 }} />
									)}
								</ListItemButton>
							</ListItem>
						))}
					</Box>
				))}
			</List>
		</Box>
	);
};

export default SettingsSidebar;
