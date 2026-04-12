import React, { useState } from 'react';
import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Box,
	Collapse,
	Tooltip,
	alpha
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

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 60;

const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const open = useAppSelector((state) => state.ui.sidebarOpen);
	const user = useAppSelector((state) => state.auth.user);
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

	// Auto-expand the group of the active path on mount or navigation
	React.useEffect(() => {
		if (open) {
			const findAndExpandActiveGroup = (items: NavigationItem[]) => {
				for (const item of items) {
					if (item.children?.some(child => isActive(child.path))) {
						if (item.label) {
							setExpandedGroups(prev => ({ ...prev, [item.label!]: true }));
						}
						return true;
					}
				}
				return false;
			};
			findAndExpandActiveGroup(topNavigation);
			findAndExpandActiveGroup(bottomNavigation);
		}
	}, [location.pathname, open]);

	const isActive = (path?: string) => {
		if (!path) return false;
		if (path.includes('?')) {
			return location.pathname + location.search === path;
		}

		// Special handling for All Candidates to avoid highlighting when on sibling routes
		// Special handling for Projects to avoid highlighting when on sibling routes
		if (path === '/projects') {
			if (location.pathname === path) return true;
			if (location.pathname.startsWith(path + '/')) {
				const subPath = location.pathname.substring(path.length);
				// Don't highlight "Projects" if we are on these specific sibling routes
				if (subPath.startsWith('/activities') ||
					subPath.startsWith('/dsr') ||
					subPath.startsWith('/timesheet')) {
					return false;
				}
				return true;
			}
			return false;
		}

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

		return location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));
	};

	const handleNavigate = (path: string) => {
		navigate(path);
		if (isMobile) {
			dispatch(toggleSidebar());
		}
	};

	const toggleGroup = (label: string) => {
		setExpandedGroups(prev => {
			const isCurrentlyExpanded = prev[label];
			// Collapse all first
			const newState = Object.keys(prev).reduce((acc, key) => {
				acc[key] = false;
				return acc;
			}, {} as Record<string, boolean>);

			// If the clicked one was closed, expand it
			if (!isCurrentlyExpanded) {
				newState[label] = true;
			}
			return newState;
		});
	};

	const hasPermission = (item: NavigationItem): boolean => {
		// Admin always has access to everything
		if (user?.role === 'admin') return true;

		// Check if the item itself has roles
		const hasDirectPermission = !item.roles || (user?.role && item.roles.includes(user.role));

		if (item.children) {
			// A group is visible if its own roles match (if provided)
			// AND it has at least one child with permission
			const hasVisibleChildren = item.children.some(child => hasPermission(child));
			
			// If group has specific roles, user must match AND have a visible child
			if (item.roles) {
				return !!hasDirectPermission && hasVisibleChildren;
			}
			
			// If group has no roles, it's visible if it has at least one visible child
			return hasVisibleChildren;
		}

		return !!hasDirectPermission;
	};

	const NavItem = ({ item, depth = 0 }: { item: NavigationItem; depth?: number }) => {
		if (!hasPermission(item)) return null;

		const active = isActive(item.path);
		const Icon = item.icon;

		const content = (
			<ListItemButton
				onClick={() => item.path && handleNavigate(item.path)}
				selected={active}
				sx={{
					minHeight: 40,
					p: 0,
					pl: open ? (depth * 2 + 2) : 0,
					pr: open ? 2 : 0,
					width: '100%',
					justifyContent: open ? 'initial' : 'center',
					borderLeft: active ? `4px solid ${theme.palette.accent.main}` : '4px solid transparent',
					transition: theme => theme.transitions.create(['background-color', 'border-left-color', 'padding'], {
						duration: theme.transitions.duration.standard,
					}),
					'&.Mui-selected': {
						bgcolor: alpha(theme.palette.accent.main, 0.12),
						'&:hover': {
							bgcolor: alpha(theme.palette.accent.main, 0.18),
						},
						'& .MuiListItemText-primary': {
							color: theme.palette.accent.main,
						},
						'& .MuiListItemIcon-root': {
							color: theme.palette.accent.main,
						},
					},
					'&:hover': {
						bgcolor: alpha(theme.palette.common.white, 0.05),
					},
				}}
			>
				{Icon && (
					<ListItemIcon
						sx={{
							minWidth: 0,
							mr: open ? 1.5 : 0,
							justifyContent: 'center',
							color: active ? theme.palette.accent.main : theme.palette.text.secondary,
							transition: theme => theme.transitions.create(['margin', 'color'], {
								duration: theme.transitions.duration.standard,
							}),
						}}
					>
						<Icon sx={{ fontSize: '1.2rem' }} />
					</ListItemIcon>
				)}
				<Box
					sx={{
						opacity: open ? 1 : 0,
						width: open ? 'auto' : 0,
						transform: open ? 'translateX(0)' : 'translateX(-10px)',
						transition: theme => theme.transitions.create(['opacity', 'width', 'transform'], {
							duration: theme.transitions.duration.standard,
							easing: theme.transitions.easing.sharp,
						}),
						overflow: 'hidden',
						flexGrow: 1,
						display: open ? 'flex' : 'none',
						alignItems: 'center',
					}}
				>
					<ListItemText
						primary={item.label}
						primaryTypographyProps={{ 
							variant: active ? "sidebarActive" : "sidebarItem" 
						}}
						sx={{
							m: 0,
							'& .MuiListItemText-primary': {
								color: active ? theme.palette.accent.main : theme.palette.secondary.contrastText,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}
						}}
					/>
				</Box>
			</ListItemButton>
		);

		return (
			<ListItem disablePadding sx={{ display: 'block' }}>
				{open ? content : (
					<Tooltip title={item.label} placement="right" arrow>
						{content}
					</Tooltip>
				)}
			</ListItem>
		);
	};

	const NavGroup = ({ group, depth = 0 }: { group: NavigationItem; depth?: number }) => {
		if (!hasPermission(group) || !group.label) return null;

		const isExpanded = expandedGroups[group.label];
		const Icon = group.icon;
		const activeChild = group.children?.some(child => isActive(child.path));

		const content = (
			<ListItemButton
				onClick={() => {
					if (!open) {
						dispatch(toggleSidebar());
					} else {
						group.label && toggleGroup(group.label);
					}
				}}
				sx={{
					minHeight: 40,
					p: 0,
					pl: open ? (depth * 2 + 2) : 0,
					pr: open ? 2 : 0,
					width: '100%',
					justifyContent: open ? 'initial' : 'center',
					borderLeft: activeChild ? `4px solid ${theme.palette.accent.main}` : '4px solid transparent',
					transition: theme => theme.transitions.create(['background-color', 'border-left-color'], {
						duration: theme.transitions.duration.standard,
					}),
					'&:hover': {
						bgcolor: alpha(theme.palette.common.white, 0.05),
					},
				}}
			>
				{Icon && (
					<ListItemIcon
						sx={{
							minWidth: 0,
							mr: open ? 1.5 : 0,
							justifyContent: 'center',
							color: activeChild ? theme.palette.accent.main : theme.palette.text.secondary,
							transition: theme => theme.transitions.create(['color'], {
								duration: theme.transitions.duration.standard,
							}),
						}}
					>
						<Icon sx={{ fontSize: '1.2rem' }} />
					</ListItemIcon>
				)}
				<Box
					sx={{
						opacity: open ? 1 : 0,
						width: open ? 'auto' : 0,
						transform: open ? 'translateX(0)' : 'translateX(-10px)',
						transition: theme => theme.transitions.create(['opacity', 'width', 'transform'], {
							duration: theme.transitions.duration.standard,
							easing: theme.transitions.easing.sharp,
						}),
						overflow: 'hidden',
						flexGrow: 1,
						display: open ? 'flex' : 'none',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<ListItemText
						primary={group.label}
						primaryTypographyProps={{ 
							variant: activeChild ? "sidebarActive" : "sidebarItem" 
						}}
						sx={{
							m: 0,
							'& .MuiListItemText-primary': {
								color: activeChild ? theme.palette.accent.main : theme.palette.secondary.contrastText,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}
						}}
					/>
					{isExpanded ?
						<ExpandLess sx={{ fontSize: 16, color: alpha(theme.palette.common.white, 0.4) }} /> :
						<ExpandMore sx={{ fontSize: 16, color: alpha(theme.palette.common.white, 0.4) }} />
					}
				</Box>
			</ListItemButton>
		);

		return (
			<>
				<ListItem disablePadding sx={{ display: 'block' }}>
					{open ? content : (
						<Tooltip title={group.label} placement="right" arrow>
							{content}
						</Tooltip>
					)}
				</ListItem>
				<Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
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
			variant={isMobile ? 'temporary' : 'permanent'}
			anchor="left"
			open={open}
			onClose={() => dispatch(toggleSidebar())}
			ModalProps={{ keepMounted: true }}
			sx={{
				width: open ? DRAWER_WIDTH : (isMobile ? 0 : COLLAPSED_WIDTH),
				flexShrink: 0,
				whiteSpace: 'nowrap',
				transition: (theme) => theme.transitions.create('width', {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.standard,
				}),
				'& .MuiDrawer-paper': {
					width: open ? DRAWER_WIDTH : (isMobile ? 0 : COLLAPSED_WIDTH),
					overflowX: 'hidden',
					transition: (theme) => theme.transitions.create('width', {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.standard,
					}),
					boxSizing: 'border-box',
					overflow: 'hidden',
					top: '48px',
					height: 'calc(100% - 48px)',
					backgroundColor: 'secondary.main',
					borderRight: `1px solid ${theme.palette.common.black}`,
					boxShadow: 'none',
				},
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#eaeded' }}>
				<Box
					sx={{
						flexGrow: 1,
						overflowY: 'auto',
						overflowX: 'hidden',
						py: 0.5,
						/* Custom scrollbar for enterprise look */
						'&::-webkit-scrollbar': {
							width: '6px',
						},
						'&::-webkit-scrollbar-track': {
							background: 'transparent',
						},
						'&::-webkit-scrollbar-thumb': {
							background: 'rgba(255, 255, 255, 0.1)',
							borderRadius: '3px',
						},
						'&::-webkit-scrollbar-thumb:hover': {
							background: 'rgba(255, 255, 255, 0.2)',
						},
					}}
				>
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

				<Box sx={{
					flexShrink: 0,
					py: 0.5,
					borderTop: '1px solid rgba(255, 255, 255, 0.05)',
					overflow: 'hidden',
					bgcolor: 'secondary.main' // Ensure background matches for pinning effect
				}}>
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
