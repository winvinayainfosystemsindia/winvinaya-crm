import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
const MainLayout: React.FC = () => {
	return (
		<Box sx={{ display: 'flex', minHeight: '100vh' }}>
			<CssBaseline />
			<Navbar />
			<Sidebar />
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					transition: (theme) => theme.transitions.create(['margin', 'width'], {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen,
					}),
					mt: '48px', // Offset for dense toolbar
					display: 'flex',
					flexDirection: 'column',
					minHeight: 'calc(100vh - 48px)',
				}}
			>
				<Box sx={{ flexGrow: 1 }}>
					<Outlet />
				</Box>
				<Footer />
			</Box>
		</Box>
	);
};

export default MainLayout;
