import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	const open = useAppSelector((state) => state.ui.sidebarOpen);

	const menuItems = [
		{ text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
		{ text: 'Candidates', icon: <PeopleIcon />, path: '/candidates' },
		{ text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
		{ text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
	];

	return (
		<Drawer
			variant="persistent"
			anchor="left"
			open={open}
			sx={{
				width: open ? drawerWidth : 0,
				flexShrink: 0,
				transition: (theme) => theme.transitions.create('width', {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.enteringScreen,
				}),
				'& .MuiDrawer-paper': {
					width: drawerWidth,
					boxSizing: 'border-box',
					top: '48px', // Below dense AppBar
					height: 'calc(100% - 48px)',
					backgroundColor: '#f2f3f3',
				},
			}}
		>
			<Box sx={{ overflow: 'auto' }}>
				<List>
					{menuItems.map((item) => (
						<ListItem key={item.text} disablePadding>
							<ListItemButton onClick={() => navigate(item.path)}>
								<ListItemIcon sx={{ minWidth: 40, color: '#444' }}>
									{item.icon}
								</ListItemIcon>
								<ListItemText
									primary={item.text}
									primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500, color: '#16191f' }}
								/>
							</ListItemButton>
						</ListItem>
					))}
				</List>
				<Divider />
			</Box>
		</Drawer>
	);
};

export default Sidebar;
