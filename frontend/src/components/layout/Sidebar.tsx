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
	// Business as BusinessIcon,
	ExpandLess,
	ExpandMore,
	ManageAccounts as UserIcon,
	HelpOutline as HelpIcon,
	Home as HomeIcon,
	Group as CandidatesIcon,
	Lock as LockIcon,
	School as SchoolIcon,
	Assessment as AssessmentIcon,
	Storage as StorageIcon,
	Dashboard as DashboardIcon,
	Business as BusinessIcon,
	FilterCenterFocus as LeadIcon,
	Handshake as DealIcon,
	Assignment as TaskIcon,
	Person as PersonIcon,
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
	const [crmOpen, setCrmOpen] = useState(false);

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
								aria-current={isActive('/dashboard') ? 'page' : undefined}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/dashboard') ? 'primary.main' : '#5f6368' }}>
									<HomeIcon aria-hidden="true" />
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
								aria-current={isActive('/users') ? 'page' : undefined}
								sx={{
									py: 0.5,
									opacity: user?.role !== 'admin' ? 0.6 : 1,
									cursor: user?.role !== 'admin' ? 'not-allowed' : 'pointer'
								}}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/users') ? 'primary.main' : '#5f6368' }}>
									<UserIcon aria-hidden="true" />
								</ListItemIcon>
								<ListItemText
									primary="User Management"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/users') ? 600 : 500,
										color: isActive('/users') ? 'primary.main' : '#202124'
									}}
								/>
								{user?.role !== 'admin' && <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} aria-hidden="true" />}
							</ListItemButton>
						</ListItem>


						{/* CRM Group */}
						<ListItem disablePadding>
							<ListItemButton
								onClick={() => setCrmOpen(!crmOpen)}
								sx={{ py: 0.5 }}
								aria-expanded={crmOpen}
								aria-controls="crm-nav-list"
							>
								<ListItemIcon sx={{ minWidth: 40, color: '#5f6368' }}>
									<DealIcon aria-hidden="true" />
								</ListItemIcon>
								<ListItemText
									primary="CRM"
									primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500, color: '#202124' }}
								/>
								{crmOpen ? <ExpandLess sx={{ color: '#5f6368' }} aria-hidden="true" /> : <ExpandMore sx={{ color: '#5f6368' }} aria-hidden="true" />}
							</ListItemButton>
						</ListItem>

						<Collapse in={crmOpen} timeout="auto" unmountOnExit id="crm-nav-list">
							<List component="div" disablePadding>
								{[
									{ label: 'Dashboard', path: '/crm/dashboard', icon: DashboardIcon },
									{ label: 'Leads', path: '/crm/leads', icon: LeadIcon },
									{ label: 'Deals', path: '/crm/deals', icon: DealIcon },
									{ label: 'Companies', path: '/crm/companies', icon: BusinessIcon },
									{ label: 'Contacts', path: '/crm/contacts', icon: PersonIcon },
									{ label: 'Tasks', path: '/crm/tasks', icon: TaskIcon },
								].map((item) => (
									<ListItemButton
										key={item.path}
										sx={{ pl: 9, py: 0.5 }}
										selected={isActive(item.path)}
										onClick={() => handleNavigate(item.path)}
									>
										<ListItemText
											primary={item.label}
											primaryTypographyProps={{
												fontSize: '0.9rem',
												color: isActive(item.path) ? 'primary.main' : '#5f6368',
												fontWeight: isActive(item.path) ? 600 : 400
											}}
										/>
									</ListItemButton>
								))}
							</List>
						</Collapse>


						{/* Candidates Group */}
						<ListItem disablePadding>
							<ListItemButton
								onClick={() => setCandidatesOpen(!candidatesOpen)}
								sx={{ py: 0.5 }}
								aria-expanded={candidatesOpen}
								aria-controls="candidates-nav-list"
							>
								<ListItemIcon sx={{ minWidth: 40, color: '#5f6368' }}>
									<CandidatesIcon aria-hidden="true" />
								</ListItemIcon>
								<ListItemText
									primary="Candidate Management"
									primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500, color: '#202124' }}
								/>
								{candidatesOpen ? <ExpandLess sx={{ color: '#5f6368' }} aria-hidden="true" /> : <ExpandMore sx={{ color: '#5f6368' }} aria-hidden="true" />}
							</ListItemButton>
						</ListItem>

						<Collapse in={candidatesOpen} timeout="auto" unmountOnExit id="candidates-nav-list">

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
										opacity: !['admin', 'sourcing', 'manager'].includes(user?.role || '') ? 0.6 : 1,
										cursor: !['admin', 'sourcing', 'manager'].includes(user?.role || '') ? 'not-allowed' : 'pointer'
									}}
									selected={isActive('/candidates/screening')}
									onClick={() => ['admin', 'sourcing', 'manager'].includes(user?.role || '') && handleNavigate('/candidates/screening')}
									disabled={!['admin', 'sourcing', 'manager'].includes(user?.role || '')}
								>
									<ListItemText
										primary="Screening"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/screening') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/screening') ? 600 : 400
										}}
									/>
									{!['admin', 'sourcing', 'manager'].includes(user?.role || '') && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
								</ListItemButton>

								{/* Counseling - Admin & Trainer only */}
								<ListItemButton
									sx={{
										pl: 9,
										py: 0.5,
										opacity: !['admin', 'trainer', 'manager'].includes(user?.role || '') ? 0.6 : 1,
										cursor: !['admin', 'trainer', 'manager'].includes(user?.role || '') ? 'not-allowed' : 'pointer'
									}}
									selected={isActive('/candidates/counseling')}
									onClick={() => ['admin', 'trainer', 'manager'].includes(user?.role || '') && handleNavigate('/candidates/counseling')}
									disabled={!['admin', 'trainer', 'manager'].includes(user?.role || '')}
								>
									<ListItemText
										primary="Counseling"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/counseling') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/counseling') ? 600 : 400
										}}
									/>
									{!['admin', 'trainer', 'manager'].includes(user?.role || '') && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
								</ListItemButton>

								{/* Document Collection - Admin & Sourcing only */}
								<ListItemButton
									sx={{
										pl: 9,
										py: 0.5,
										opacity: !['admin', 'sourcing', 'manager'].includes(user?.role || '') ? 0.6 : 1,
										cursor: !['admin', 'sourcing', 'manager'].includes(user?.role || '') ? 'not-allowed' : 'pointer'
									}}
									selected={isActive('/candidates/documents')}
									onClick={() => ['admin', 'sourcing', 'manager'].includes(user?.role || '') && handleNavigate('/candidates/documents')}
									disabled={!['admin', 'sourcing', 'manager'].includes(user?.role || '')}
									aria-current={isActive('/candidates/documents') ? 'page' : undefined}
								>
									<ListItemText
										primary="Document Collection"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: isActive('/candidates/documents') ? 'primary.main' : '#5f6368',
											fontWeight: isActive('/candidates/documents') ? 600 : 400
										}}
									/>
									{!['admin', 'sourcing', 'manager'].includes(user?.role || '') && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} aria-hidden="true" />}
								</ListItemButton>
							</List>
						</Collapse>


						{/* Training Group */}
						<ListItem disablePadding>
							<ListItemButton
								onClick={() => setTrainingOpen(!trainingOpen)}
								sx={{ py: 0.5 }}
								aria-expanded={trainingOpen}
								aria-controls="training-nav-list"
							>
								<ListItemIcon sx={{ minWidth: 40, color: '#5f6368' }}>
									<SchoolIcon aria-hidden="true" />
								</ListItemIcon>
								<ListItemText
									primary="Training Management"
									primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500, color: '#202124' }}
								/>
								{trainingOpen ? <ExpandLess sx={{ color: '#5f6368' }} aria-hidden="true" /> : <ExpandMore sx={{ color: '#5f6368' }} aria-hidden="true" />}
							</ListItemButton>
						</ListItem>

						<Collapse in={trainingOpen} timeout="auto" unmountOnExit id="training-nav-list">
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
									selected={location.pathname === '/training/allocation' && (new URLSearchParams(location.search).get('tab') === '1' || !new URLSearchParams(location.search).get('tab'))}
									onClick={() => handleNavigate('/training/allocation?tab=1')}
								>
									<ListItemText
										primary="Candidate allocation"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: (location.pathname === '/training/allocation' && (new URLSearchParams(location.search).get('tab') === '1' || !new URLSearchParams(location.search).get('tab'))) ? 'primary.main' : '#5f6368',
											fontWeight: (location.pathname === '/training/allocation' && (new URLSearchParams(location.search).get('tab') === '1' || !new URLSearchParams(location.search).get('tab'))) ? 600 : 400
										}}
									/>
								</ListItemButton>

								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '2'}
									onClick={() => handleNavigate('/training/allocation?tab=2')}
								>
									<ListItemText
										primary="Attendance"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: (location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '2') ? 'primary.main' : '#5f6368',
											fontWeight: (location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '2') ? 600 : 400
										}}
									/>
								</ListItemButton>

								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '3'}
									onClick={() => handleNavigate('/training/allocation?tab=3')}
								>
									<ListItemText
										primary="Assessment"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: (location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '3') ? 'primary.main' : '#5f6368',
											fontWeight: (location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '3') ? 600 : 400
										}}
									/>
								</ListItemButton>

								<ListItemButton
									sx={{ pl: 9, py: 0.5 }}
									selected={location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '4'}
									onClick={() => handleNavigate('/training/allocation?tab=4')}
								>
									<ListItemText
										primary="Mock interview"
										primaryTypographyProps={{
											fontSize: '0.9rem',
											color: (location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '4') ? 'primary.main' : '#5f6368',
											fontWeight: (location.pathname === '/training/allocation' && new URLSearchParams(location.search).get('tab') === '4') ? 600 : 400
										}}
									/>
								</ListItemButton>
							</List>
						</Collapse>

						{/* Company */}
						{/* <ListItem disablePadding>
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
						</ListItem> */}
					</List>
				</Box>

				{/* Bottom Section */}
				<Box>
					<Divider />
					<List>
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/reports')}
								onClick={() => handleNavigate('/reports')}
								sx={{ py: 0.5 }}
								aria-current={isActive('/reports') ? 'page' : undefined}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/reports') ? 'primary.main' : '#5f6368' }}>
									<AssessmentIcon aria-hidden="true" />
								</ListItemIcon>
								<ListItemText
									primary="Reports"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/reports') ? 600 : 500,
										color: isActive('/reports') ? 'primary.main' : '#202124'
									}}
								/>
							</ListItemButton>
						</ListItem>
						<ListItem disablePadding>
							<ListItemButton
								selected={isActive('/settings')}
								onClick={() => user?.role === 'admin' && handleNavigate('/settings')}
								disabled={user?.role !== 'admin'}
								sx={{
									py: 0.5,
									opacity: user?.role !== 'admin' ? 0.6 : 1,
									cursor: user?.role !== 'admin' ? 'not-allowed' : 'pointer'
								}}
								aria-current={isActive('/settings') ? 'page' : undefined}
							>
								<ListItemIcon sx={{ minWidth: 40, color: isActive('/settings') ? 'primary.main' : '#5f6368' }}>
									<SettingsIcon aria-hidden="true" />
								</ListItemIcon>
								<ListItemText
									primary="Settings"
									primaryTypographyProps={{
										fontSize: '0.95rem',
										fontWeight: isActive('/settings') ? 600 : 500,
										color: isActive('/settings') ? 'primary.main' : '#202124'
									}}
								/>
								{user?.role !== 'admin' && <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} aria-hidden="true" />}
							</ListItemButton>
						</ListItem>

						{/* Migration - Admin only */}
						{user?.role === 'admin' && (
							<ListItem disablePadding>
								<ListItemButton
									selected={isActive('/admin/migration')}
									onClick={() => handleNavigate('/admin/migration')}
									sx={{ py: 0.5 }}
									aria-current={isActive('/admin/migration') ? 'page' : undefined}
								>
									<ListItemIcon sx={{ minWidth: 40, color: isActive('/admin/migration') ? 'primary.main' : '#5f6368' }}>
										<StorageIcon aria-hidden="true" />
									</ListItemIcon>
									<ListItemText
										primary="Data Migration"
										primaryTypographyProps={{
											fontSize: '0.95rem',
											fontWeight: isActive('/admin/migration') ? 600 : 500,
											color: isActive('/admin/migration') ? 'primary.main' : '#202124'
										}}
									/>
								</ListItemButton>
							</ListItem>
						)}

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
