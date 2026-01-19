import React, { useState } from 'react';
import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Box,
	Collapse
} from '@mui/material';
import {
	ExpandLess,
	ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useTheme, useMediaQuery } from '@mui/material';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { topNavigation, bottomNavigation } from '../../config/navigation';
import type { NavigationItem } from '../../config/navigation';

const drawerWidth = 280;

const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const open = useAppSelector((state) => state.ui.sidebarOpen);
	const user = useAppSelector((state) => state.auth.user);
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
		'CRM': false,
		'Candidate Management': true,
		'Training Management': false
	});

	const isActive = (path?: string) => {
		if (!path) return false;
		if (path.includes('?')) {
			return location.pathname + location.search === path;
		}

		// Special handling for All Candidates to avoid highlighting when on sibling routes
		if (path === '/candidates') {
			if (location.pathname === path) return true;
			if (location.pathname.startsWith(path + '/')) {
				const subPath = location.pathname.substring(path.length);
				// Don't highlight "All Candidates" if we are on these specific sibling routes
				if (subPath.startsWith('/screening') ||
					subPath.startsWith('/counseling') ||
					subPath.startsWith('/documents')) {
					return false;
				}
				return true;
			}
			return false;
		}

		return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
	};

	const handleNavigate = (path: string) => {
		navigate(path);
		if (isMobile) {
			dispatch(toggleSidebar());
		}
	};

	const toggleGroup = (label: string) => {
		setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
	};

	const hasPermission = (item: NavigationItem) => {
		if (!item.roles) return true;
		return user?.role && item.roles.includes(user.role);
	};

	const NavItem = ({ item, depth = 0 }: { item: NavigationItem; depth?: number }) => {
		if (!hasPermission(item)) return null;

		const active = isActive(item.path);
		const Icon = item.icon;

		return (
			<ListItem disablePadding sx={{ display: 'block' }}>
				<ListItemButton
					onClick={() => item.path && handleNavigate(item.path)}
					selected={active}
					sx={{
						minHeight: 32,
						py: 0.5,
						pl: depth * 2.5 + 2,
						pr: 2,
						justifyContent: 'flex-start',
						borderLeft: '3px solid transparent',
						'&.Mui-selected': {
							bgcolor: 'rgba(236, 114, 17, 0.08)',
							borderLeftColor: 'primary.main',
							'&:hover': {
								bgcolor: 'rgba(236, 114, 17, 0.12)',
							},
							'& .MuiListItemText-primary': {
								color: 'primary.main',
								fontWeight: 700,
							},
							'& .MuiListItemIcon-root': {
								color: 'primary.main',
							},
						},
						'&:hover': {
							bgcolor: '#f2f3f3',
						},
					}}
				>
					{Icon && (
						<ListItemIcon
							sx={{
								minWidth: 0,
								mr: 2,
								justifyContent: 'center',
								color: active ? 'primary.main' : '#545b64',
							}}
						>
							<Icon fontSize="small" />
						</ListItemIcon>
					)}
					<ListItemText
						primary={item.label}
						primaryTypographyProps={{
							fontSize: '0.9rem',
							fontWeight: active ? 700 : 500,
							color: active ? 'primary.main' : '#16191f',
							noWrap: true,
						}}
					/>
				</ListItemButton>
			</ListItem>
		);
	};

	const NavGroup = ({ group, depth = 0 }: { group: NavigationItem; depth?: number }) => {
		if (!hasPermission(group) || !group.label) return null;

		const isExpanded = expandedGroups[group.label];
		const Icon = group.icon;
		const activeChild = group.children?.some(child => isActive(child.path));

		return (
			<>
				<ListItem disablePadding sx={{ display: 'block' }}>
					<ListItemButton
						onClick={() => group.label && toggleGroup(group.label)}
						sx={{
							minHeight: 36,
							py: 0.5,
							pl: depth * 2.5 + 2,
							pr: 2,
							justifyContent: 'flex-start',
							'&:hover': {
								bgcolor: '#f2f3f3',
							},
						}}
					>
						{Icon && (
							<ListItemIcon
								sx={{
									minWidth: 0,
									mr: 2,
									justifyContent: 'center',
									color: activeChild ? 'primary.main' : '#545b64',
								}}
							>
								<Icon fontSize="small" />
							</ListItemIcon>
						)}
						<ListItemText
							primary={group.label}
							primaryTypographyProps={{
								fontSize: '0.9rem',
								fontWeight: activeChild ? 700 : 500,
								color: activeChild ? 'primary.main' : '#16191f',
							}}
						/>
						{isExpanded ?
							<ExpandLess sx={{ fontSize: 18, color: '#545b64' }} /> :
							<ExpandMore sx={{ fontSize: 18, color: '#545b64' }} />
						}
					</ListItemButton>
				</ListItem>
				<Collapse in={isExpanded} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						{group.children?.map((child, index) => (
							<NavItem key={index} item={child} depth={depth + 1} />
						))}
					</List>
				</Collapse>
			</>
		);
	};

	return (
		<Drawer
			variant={isMobile ? 'temporary' : 'persistent'}
			anchor="left"
			open={open}
			onClose={() => dispatch(toggleSidebar())}
			ModalProps={{ keepMounted: true }}
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
					top: isMobile ? 0 : '48px',
					height: isMobile ? '100%' : 'calc(100% - 48px)',
					backgroundColor: '#ffffff',
					borderRight: '1px solid #d5dbdb',
					boxShadow: '2px 0 5px rgba(0,0,0,0.02)',
					'& ::-webkit-scrollbar': {
						width: '6px',
					},
					'& ::-webkit-scrollbar-track': {
						background: 'transparent',
					},
					'& ::-webkit-scrollbar-thumb': {
						background: '#d5dbdb',
						borderRadius: '10px',
					},
					'& ::-webkit-scrollbar-thumb:hover': {
						background: '#aab7b7',
					},
				},
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				<Box sx={{
					flexGrow: 1,
					overflowY: 'auto',
					py: 1,
					scrollbarWidth: 'thin',
					scrollbarColor: '#d5dbdb transparent'
				}}>
					<List disablePadding>
						{topNavigation.map((item, index) => (
							item.children ? (
								<NavGroup key={index} group={item} />
							) : (
								<NavItem key={index} item={item} />
							)
						))}
					</List>
				</Box>

				<Box sx={{ py: 1, borderTop: '1px solid #eaeded' }}>
					<List disablePadding>
						{bottomNavigation.map((item, index) => (
							item.children ? (
								<NavGroup key={index} group={item} />
							) : (
								<NavItem key={index} item={item} />
							)
						))}
					</List>
				</Box>
			</Box>
		</Drawer>
	);
};

export default Sidebar;
