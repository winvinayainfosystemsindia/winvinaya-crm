import React, { useState, useEffect } from 'react';
import {
	Button,
	Container,
	Box,
	Typography,
	Paper,
	TextField,
	CircularProgress,
	IconButton,
	InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';

const Login: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const { loading, error, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		// Only redirect if auth is initialized and user is authenticated
		if (isInitialized && isAuthenticated) {
			navigate('/dashboard');
		}
	}, [isAuthenticated, isInitialized, navigate]);


	const handleTogglePasswordVisibility = () => {
		setShowPassword((prev: boolean) => !prev);
	};


	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await dispatch(loginUser({ email, password })).unwrap();
			toast.success('Login successful');
		} catch (err: unknown) {
			console.error('Login failed', err);
			toast.error(typeof err === 'string' ? err : 'Login failed');
		}
	};


	return (
		<Box
			component="main"
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#f2f3f3'
			}}
		>
			<Container maxWidth="xs">
				<Box sx={{ mb: 4, textAlign: 'center' }}>
					{/* Find a logo or use text */}
					<Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: '#232f3e' }}>
						WinVinaya
					</Typography>
				</Box>
				<Paper
					elevation={0}
					sx={{ p: 4, display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: '4px' }}
				>
					<Typography component="h2" variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
						Sign in
					</Typography>

					{/* Accessible error announcement */}
					{error && (
						<Box
							role="alert"
							aria-live="assertive"
							sx={{
								mb: 2,
								p: 1.5,
								bgcolor: '#fdeded',
								color: '#5f2120',
								borderRadius: '4px',
								border: '1px solid #5f2120',
								fontSize: '0.875rem'
							}}
						>
							<Typography variant="body2">{typeof error === 'string' ? error : 'Login failed'}</Typography>
						</Box>
					)}

					<Box component="form" onSubmit={handleLogin} noValidate>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							size="small"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (error) dispatch(clearError());
							}}
							sx={{ mb: 2 }}
							inputProps={{
								'aria-required': 'true'
							}}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type={showPassword ? 'text' : 'password'}
							id="password"
							autoComplete="current-password"
							size="small"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								if (error) dispatch(clearError());
							}}
							sx={{ mb: 3 }}
							inputProps={{
								'aria-required': 'true'
							}}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											aria-label={showPassword ? "hide password" : "show password"}
											onClick={handleTogglePasswordVisibility}
											edge="end"
											size="small"
											title={showPassword ? "Hide password" : "Show password"}
										>
											{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							disabled={loading}
							aria-busy={loading}
							aria-label={loading ? "Signing in" : "Sign in"}
							sx={{
								py: 1,
								backgroundColor: '#ec7211',
								'&:hover': { backgroundColor: '#eb5f07' },
								textTransform: 'none',
								fontWeight: 'bold'
							}}
						>
							{loading ? <CircularProgress size={24} color="inherit" aria-hidden="true" /> : 'Sign In'}
						</Button>
					</Box>
				</Paper>
				<Box sx={{ mt: 3, textAlign: 'center' }}>
					<Typography variant="body2" color="text.secondary">
						Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.
					</Typography>
				</Box>
			</Container>
		</Box>
	);

};

export default Login;
