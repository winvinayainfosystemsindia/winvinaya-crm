import React, { useState } from 'react';
import { Button, Container, Box, Typography, Paper, TextField, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';

const Login: React.FC = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const toast = useToast();
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setLoading(false);
			if (email && password) {
				login();
				toast.success('Login successful');
				navigate('/');
			} else {
				toast.error('Please enter valid credentials');
			}
		}, 1000);
	};

	return (
		<Box
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
					<Typography variant="h4" fontWeight="bold" sx={{ color: '#232f3e' }}>WinVinaya</Typography>
				</Box>
				<Paper elevation={0} sx={{ p: 4, display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: '4px' }}>
					<Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
						Sign in
					</Typography>
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
							onChange={(e) => setEmail(e.target.value)}
							sx={{ mb: 2 }}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							size="small"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							sx={{ mb: 3 }}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							disabled={loading}
							sx={{
								py: 1,
								backgroundColor: '#ec7211',
								'&:hover': { backgroundColor: '#eb5f07' },
								textTransform: 'none',
								fontWeight: 'bold'
							}}
						>
							{loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
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
