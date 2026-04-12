import React, { useEffect } from 'react';
import {
	Container,
	Box,
	Typography,
	useTheme,
	Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';
import LoginForm from '../components/auth/LoginForm';

const Login: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const theme = useTheme();
	const { loading, error, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

	useEffect(() => {
		// Only redirect if auth is initialized and user is authenticated
		if (isInitialized && isAuthenticated) {
			navigate('/dashboard');
		}
	}, [isAuthenticated, isInitialized, navigate]);

	useEffect(() => {
		if (error) {
			toast.error(typeof error === 'string' ? error : 'Login failed');
			// We clear the error in the store after showing it as a toast
			// but we keep it for the LoginForm to display locally if needed
			// actually, if we clear it here, it will disappear from LoginForm too.
			// Let's clear it only in the cleanup or on unmount, or let the user clear it manually.
			// The original code cleared it immediately.
			const timer = setTimeout(() => {
				dispatch(clearError());
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [error, toast, dispatch]);

	const handleLogin = async (email: string, password: string) => {
		try {
			await dispatch(loginUser({ email, password })).unwrap();
			toast.success('Login successful');
		} catch (err) {
			console.error('Login failed', err);
		}
	};

	return (
		<Box
			component="main"
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: theme.palette.background.default,
				backgroundImage: `radial-gradient(circle at 50% 50%, ${theme.palette.background.default} 0%, ${theme.palette.secondary.dark}30 100%)`,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Decorative elements for enterprise feel */}
			<Box
				sx={{
					position: 'absolute',
					top: -100,
					right: -100,
					width: 300,
					height: 300,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${theme.palette.accent.main}10 0%, transparent 70%)`,
					zIndex: 0,
				}}
			/>
			<Box
				sx={{
					position: 'absolute',
					bottom: -150,
					left: -150,
					width: 400,
					height: 400,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${theme.palette.primary.main}10 0%, transparent 70%)`,
					zIndex: 0,
				}}
			/>

			<Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>


				<Fade in={true} timeout={1200}>
					<Box>
						<LoginForm
							loading={loading}
							error={typeof error === 'string' ? error : null}
							onLogin={handleLogin}
						/>
					</Box>
				</Fade>

				<Fade in={true} timeout={1600}>
					<Box sx={{ mt: 4, textAlign: 'center' }}>
						<Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
							© {new Date().getFullYear()} WinVinaya InfoSystems. All rights reserved.
						</Typography>
					</Box>
				</Fade>
			</Container>
		</Box>
	);
};

export default Login;
