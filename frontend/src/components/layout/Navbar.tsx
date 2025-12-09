import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAppDispatch } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';

const Navbar: React.FC = () => {
	const dispatch = useAppDispatch();

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
				<Box sx={{ display: 'flex' }}>
					<IconButton
						size="large"
						aria-label="show 17 new notifications"
						color="inherit"
					>
						<Badge badgeContent={4} color="error">
							<NotificationsIcon />
						</Badge>
					</IconButton>
					<IconButton
						size="large"
						edge="end"
						aria-label="account of current user"
						aria-haspopup="true"
						color="inherit"
					>
						<AccountCircle />
					</IconButton>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
