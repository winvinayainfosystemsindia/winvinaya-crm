import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge, Menu, MenuItem, Button, Divider, alpha, ListItemIcon, ListItemText } from '@mui/material';
import {
	Menu as MenuIcon,
	Notifications as NotificationsIcon,
	AccountCircle,
	KeyboardArrowDown as ArrowDownIcon,
	ExitToApp as LogoutIcon,
	Person as ProfileIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

import GlobalSearch from './GlobalSearch';
const Navbar: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { user } = useAppSelector((state) => state.auth);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		dispatch(logoutUser());
		handleClose();
		navigate('/login');
	};

	return (
		<AppBar position="fixed" component="nav" aria-label="Main Navigation" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#232f3e' }}>
			<Toolbar variant="dense">
				<IconButton
					color="inherit"
					aria-label="Toggle sidebar navigation"
					edge="start"
					onClick={() => dispatch(toggleSidebar())}
					sx={{ mr: 2 }}
				>
					<MenuIcon aria-hidden="true" />
				</IconButton>
				<Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '1rem', fontWeight: 400, mr: 2 }}>
					WinVinaya Console
				</Typography>

				<GlobalSearch />
				<Box sx={{ flexGrow: 1 }} />
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton
						size="large"
						aria-label="You have 4 new notifications"
						color="inherit"
						sx={{ mr: 1, '&:hover': { backgroundColor: alpha('#ffffff', 0.1) } }}
					>
						<Badge badgeContent={4} color="error">
							<NotificationsIcon aria-hidden="true" />
						</Badge>
					</IconButton>

					{user && (
						<Button
							color="inherit"
							onClick={handleMenu}
							endIcon={<ArrowDownIcon />}
							sx={{
								textTransform: 'none',
								px: 1.5,
								py: 0.5,
								height: '40px',
								borderRadius: '4px',
								'&:hover': {
									backgroundColor: alpha('#ffffff', 0.1),
								},
								display: 'flex',
								alignItems: 'center',
								gap: 1
							}}
						>
							<AccountCircle fontSize="medium" />
							<Typography variant="subtitle2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 400 }}>
								{user.full_name || user.username}
							</Typography>
						</Button>
					)}

					<Menu
						id="menu-appbar"
						anchorEl={anchorEl}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={Boolean(anchorEl)}
						onClose={handleClose}
						PaperProps={{
							elevation: 4,
							sx: {
								width: 280,
								mt: 1.5,
								borderRadius: '4px',
								overflow: 'hidden',
								'& .MuiList-root': { py: 0 }
							}
						}}
					>
						<Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e', lineHeight: 1.2 }}>
								{user?.full_name || user?.username}
							</Typography>
							<Typography variant="body2" sx={{ color: '#545b64', mt: 0.5 }}>
								{user?.email}
							</Typography>
							<Typography variant="caption" sx={{ display: 'block', mt: 1, textTransform: 'uppercase', fontWeight: 700, color: '#ec7211' }}>
								{user?.role} Role
							</Typography>
						</Box>
						<Divider />
						<MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
							<ListItemIcon>
								<ProfileIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText primary="Account Settings" primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
						</MenuItem>
						<Divider />
						<MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#d13212' }}>
							<ListItemIcon>
								<LogoutIcon fontSize="small" sx={{ color: '#d13212' }} />
							</ListItemIcon>
							<ListItemText primary="Sign Out" primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
						</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
