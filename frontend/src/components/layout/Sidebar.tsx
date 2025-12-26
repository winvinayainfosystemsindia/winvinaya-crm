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
	Group as CandidatesIcon,
	Lock as LockIcon,
	School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useTheme, useMediaQuery } from '@mui/material';
import { toggleSidebar } from '../../store/slices/uiSlice';

const drawerWidth = 280;

const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const open = useAppSelector((state) => state.ui.sidebarOpen);
	const user = useAppSelector((state) => state.auth.user);
	const [candidatesOpen, setCandidatesOpen] = useState(true);
	const [trainingOpen, setTrainingOpen] = useState(false);

	const isActive = (path: string) => location.pathname === path;

	const handleNavigate = (path: string) => {
		navigate(path);
		if (isMobile) {
			dispatch(toggleSidebar());
		}
	};

	return (
		<Drawer
			variant={isMobile ? 'temporary' : 'persistent'}
			anchor="left"
			open={open}
			onClose={() => dispatch(toggleSidebar())}
			ModalProps={{
				keepMounted: true, // Better open performance on mobile.
			}}
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
					top: isMobile ? 0 : '48px', // Dense AppBar height
					height: isMobile ? '100%' : 'calc(100% - 48px)',
					backgroundColor: '#f8f9fa',
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

						{/* User Management - Admin only */}
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/users')}
								onClick={() => user?.role === 'admin' && handleNavigate('/users')}
								disabled={user?.role !== 'admin'}
								sx={{
									py: 0.5,
									opacity: user?.role !== 'admin' ? 0.6 : 1,
									cursor: user?.role !== 'admin' ? 'not-allowed' : 'pointer'
								}}
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
								{user?.role !== 'admin' && <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
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
								{/* <ListItemButton
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
								</ListItemButton> */}
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

								{/* Screening - Admin & Sourcing only */}
								<ListItemButton
									sx={{
										pl: 9,
										py: 0.5,
										opacity: !['admin', 'sourcing'].includes(user?.role || '') ? 0.6 : 1,
										cursor: !['admin', 'sourcing'].includes(user?.role || '') ? 'not-allowed' : 'pointer'
									}}
									selected={isActive('/candidates/screening')}
									onClick={() => ['admin', 'sourcing'].includes(user?.role || '') && handleNavigate('/candidates/screening')}
									disabled={!['admin', 'sourcing'].includes(user?.role || '')}
								>
									<ListItemText
										primary="Screening"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/screening') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/screening') ? 600 : 400
										}}
									/>
									{!['admin', 'sourcing'].includes(user?.role || '') && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
								</ListItemButton>

								{/* Counseling - Admin & Trainer only */}
								<ListItemButton
									sx={{
										pl: 9,
										py: 0.5,
										opacity: !['admin', 'trainer'].includes(user?.role || '') ? 0.6 : 1,
										cursor: !['admin', 'trainer'].includes(user?.role || '') ? 'not-allowed' : 'pointer'
									}}
									selected={isActive('/candidates/counseling')}
									onClick={() => ['admin', 'trainer'].includes(user?.role || '') && handleNavigate('/candidates/counseling')}
									disabled={!['admin', 'trainer'].includes(user?.role || '')}
								>
									<ListItemText
										primary="Counseling"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/counseling') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/counseling') ? 600 : 400
										}}
									/>
									{!['admin', 'trainer'].includes(user?.role || '') && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
								</ListItemButton>

								{/* Document Collection - Admin & Sourcing only */}
								<ListItemButton
									sx={{
										pl: 9,
										py: 0.5,
										opacity: !['admin', 'sourcing'].includes(user?.role || '') ? 0.6 : 1,
										cursor: !['admin', 'sourcing'].includes(user?.role || '') ? 'not-allowed' : 'pointer'
									}}
									selected={isActive('/candidates/documents')}
									onClick={() => ['admin', 'sourcing'].includes(user?.role || '') && handleNavigate('/candidates/documents')}
									disabled={!['admin', 'sourcing'].includes(user?.role || '')}
								>
									<ListItemText
										primary="Document Collection"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/documents') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/documents') ? 600 : 400
										}}
									/>
									{!['admin', 'sourcing'].includes(user?.role || '') && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
								</ListItemButton>
							</List>
						</Collapse>

						{/* Training Group */}
						<ListItem disablePadding>
							<ListItemButton onClick={() => setTrainingOpen(!trainingOpen)} sx={{ py: 0.5 }}>
								<ListItemIcon sx={{ minWidth: 40, color: '#5f6368' }}>
									<SchoolIcon />
								</ListItemIcon>
								<ListItemText
									primary="Training"
									primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500, color: '#202124' }}
								/>
								{trainingOpen ? <ExpandLess sx={{ color: '#5f6368' }} /> : <ExpandMore sx={{ color: '#5f6368' }} />}
							</ListItemButton>
						</ListItem>

						<Collapse in={trainingOpen} timeout="auto" unmountOnExit>
							<List component="div" disablePadding>
								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={isActive('/training/batches')}
									onClick={() => handleNavigate('/training/batches')}
								>
									<ListItemText
										primary="Training Batch"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/training/batches') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/training/batches') ? 600 : 400
										}}
									/>
								</ListItemButton>

								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={isActive('/training/allocation')}
									onClick={() => handleNavigate('/training/allocation')}
								>
									<ListItemText
										primary="Candidate batch allocation"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/training/allocation') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/training/allocation') ? 600 : 400
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
			</Box >
		</Drawer >
	);
};

export default Sidebar;
