import React, { useState } from 'react';
import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	Box,
	Collapse
} from '@mui/material';
import {
	Settings as SettingsIcon,
	Business as BusinessIcon,
	ExpandLess,
	ExpandMore,
	ManageAccounts as UserIcon,
	HelpOutline as HelpIcon,
	Home as HomeIcon,
	Group as CandidatesIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

const drawerWidth = 260;

const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const open = useAppSelector((state) => state.ui.sidebarOpen);
	const [candidatesOpen, setCandidatesOpen] = useState(true);

	const isActive = (path: string) => location.pathname === path;

	const handleNavigate = (path: string) => {
		navigate(path);
	};

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
					backgroundColor: '#f8f9fa', // Lighter background for professional look
					borderRight: '1px solid #e0e0e0',
				},
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				{/* Main Navigation */}
				<Box sx={{ overflow: 'auto', flexGrow: 1, py: 1 }}>
					<List component="nav" disablePadding>
						{/* Home */}
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/dashboard')}
								onClick={() => handleNavigate('/dashboard')}
								sx={{ py: 0.5 }}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/dashboard') ? 'primary.main' : '#5f6368' }}>
									<HomeIcon />
								</ListItemIcon>
								<ListItemText
									primary="Home"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/dashboard') ? 600 : 500,
										color: isActive('/dashboard') ? 'primary.main' : '#202124'
									}}
								/>
							</ListItemButton>
						</ListItem>

						{/* User Management */}
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/users')}
								onClick={() => handleNavigate('/users')}
								sx={{ py: 0.5 }}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/users') ? 'primary.main' : '#5f6368' }}>
									<UserIcon />
								</ListItemIcon>
								<ListItemText
									primary="User Management"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/users') ? 600 : 500,
										color: isActive('/users') ? 'primary.main' : '#202124'
									}}
								/>
							</ListItemButton>
						</ListItem>

						{/* Candidates Group */}
						<ListItem disablePadding>
							<ListItemButton onClick={() => setCandidatesOpen(!candidatesOpen)} sx={{ py: 0.5 }}>
								<ListItemIcon sx={{ minWidth: 40, color: '#5f6368' }}>
									<CandidatesIcon />
								</ListItemIcon>
								<ListItemText
									primary="Candidate Management"
									primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500, color: '#202124' }}
								/>
								{candidatesOpen ? <ExpandLess sx={{ color: '#5f6368' }} /> : <ExpandMore sx={{ color: '#5f6368' }} />}
							</ListItemButton>
						</ListItem>

						<Collapse in={candidatesOpen} timeout="auto" unmountOnExit>
							<List component="div" disablePadding>
								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={isActive('/candidates/overview')}
									onClick={() => handleNavigate('/candidates/overview')}
								>
									<ListItemText
										primary="Overview"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/overview') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/overview') ? 600 : 400
										}}
									/>
								</ListItemButton>
								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={isActive('/candidates') || isActive('/candidates/list')}
									onClick={() => handleNavigate('/candidates')}
								>
									<ListItemText
										primary="All Candidates"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates') ? 600 : 400
										}}
									/>
								</ListItemButton>
								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={isActive('/candidates/profiling')}
									onClick={() => handleNavigate('/candidates/profiling')}
								>
									<ListItemText
										primary="Profiling"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/profiling') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/profiling') ? 600 : 400
										}}
									/>
								</ListItemButton>
								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={isActive('/candidates/counseling')}
									onClick={() => handleNavigate('/candidates/counseling')}
								>
									<ListItemText
										primary="Counseling"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/counseling') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/counseling') ? 600 : 400
										}}
									/>
								</ListItemButton>
								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={isActive('/candidates/documents')}
									onClick={() => handleNavigate('/candidates/documents')}
								>
									<ListItemText
										primary="Document Collection"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/documents') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/documents') ? 600 : 400
										}}
									/>
								</ListItemButton>
							</List>
						</Collapse>

						{/* Company */}
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/companies')}
								onClick={() => handleNavigate('/companies')}
								sx={{ py: 0.5 }}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/companies') ? 'primary.main' : '#5f6368' }}>
									<BusinessIcon />
								</ListItemIcon>
								<ListItemText
									primary="Company"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/companies') ? 600 : 500,
										color: isActive('/companies') ? 'primary.main' : '#202124'
									}}
								/>
							</ListItemButton>
						</ListItem>
					</List>
				</Box>

				{/* Bottom Section */}
				<Box>
					<Divider />
					<List>
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/settings')}
								onClick={() => handleNavigate('/settings')}
								sx={{ py: 0.5 }}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/settings') ? 'primary.main' : '#5f6368' }}>
									<SettingsIcon />
								</ListItemIcon>
								<ListItemText
									primary="Settings"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/settings') ? 600 : 500,
										color: isActive('/settings') ? 'primary.main' : '#202124'
									}}
								/>
							</ListItemButton>
						</ListItem>
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/support')}
								onClick={() => handleNavigate('/support')}
								sx={{ py: 0.5 }}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/support') ? 'primary.main' : '#5f6368' }}>
									<HelpIcon />
								</ListItemIcon>
								<ListItemText
									primary="Help and Support"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/support') ? 600 : 500,
										color: isActive('/support') ? 'primary.main' : '#202124'
									}}
								/>
							</ListItemButton>
						</ListItem>
					</List>
				</Box>
			</Box>
		</Drawer>
	);
};

export default Sidebar;
