import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

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
		<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#232f3e' }}>
			<Toolbar variant="dense">
				<IconButton
					color="inherit"
					aria-label="open drawer"
					edge="start"
					onClick={() => dispatch(toggleSidebar())}
					sx={{ mr: 2 }}
				>
					<MenuIcon />
				</IconButton>
				<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontSize: '1rem', fontWeight: 700 }}>
					WinVinaya Console
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton
						size="large"
						aria-label="show 17 new notifications"
						color="inherit"
					>
						<Badge badgeContent={4} color="error">
							<NotificationsIcon />
						</Badge>
					</IconButton>
					{user && (
						<Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', mr: 2 }}>
							<Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
								{user.full_name || user.username}
							</Typography>
							<Typography variant="caption" sx={{ opacity: 0.8 }}>
								{user.email}
							</Typography>
						</Box>
					)}
					<IconButton
						size="large"
						edge="end"
						aria-label="account of current user"
						aria-controls="menu-appbar"
						aria-haspopup="true"
						onClick={handleMenu}
						color="inherit"
					>
						<AccountCircle />
					</IconButton>
					<Menu
						id="menu-appbar"
						anchorEl={anchorEl}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={Boolean(anchorEl)}
						onClose={handleClose}
					>
						<MenuItem onClick={handleClose}>Profile</MenuItem>
						<MenuItem onClick={handleLogout}>Logout</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
