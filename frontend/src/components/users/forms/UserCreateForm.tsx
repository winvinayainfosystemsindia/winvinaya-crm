import React, { useState } from 'react';
import {
	Box,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Alert,
	CircularProgress,
	useMediaQuery,
	useTheme
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import userService from '../../../services/userService';
import type { UserCreate } from '../../../models/user';

interface UserCreateFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

const UserCreateForm: React.FC<UserCreateFormProps> = ({ onSuccess, onCancel }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<UserCreate>({
		email: '',
		username: '',
		password: '',
		full_name: '',
		role: 'trainer',
		is_active: true,
		is_verified: false
	});

	const handleChange = (field: keyof UserCreate, value: string | boolean) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await userService.create(formData);
			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Failed to create user');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
			<Typography variant="h5" id="user-dialog-title" sx={{ mb: 3, fontWeight: 500 }} component="h2">
				Add New User
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }} role="alert" aria-live="assertive">
					{error}
				</Alert>
			)}

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<TextField
					label="Full Name"
					value={formData.full_name}
					onChange={(e) => handleChange('full_name', e.target.value)}
					required
					fullWidth
					disabled={loading}
					inputProps={{ 'aria-required': 'true' }}
				/>

				<TextField
					label="Email"
					type="email"
					value={formData.email}
					onChange={(e) => handleChange('email', e.target.value)}
					required
					fullWidth
					disabled={loading}
					inputProps={{ 'aria-required': 'true' }}
				/>

				<TextField
					label="Username"
					value={formData.username}
					onChange={(e) => handleChange('username', e.target.value)}
					required
					fullWidth
					disabled={loading}
					helperText="3-100 characters"
					inputProps={{ 'aria-required': 'true' }}
				/>

				<TextField
					label="Password"
					type="password"
					value={formData.password}
					onChange={(e) => handleChange('password', e.target.value)}
					required
					fullWidth
					disabled={loading}
					helperText="Min 8 characters, must contain uppercase, lowercase, and digit"
					inputProps={{ 'aria-required': 'true' }}
				/>

				<FormControl fullWidth required disabled={loading}>
					<InputLabel id="role-select-label">Role</InputLabel>
					<Select
						labelId="role-select-label"
						value={formData.role}
						label="Role"
						onChange={(e) => handleChange('role', e.target.value)}
						inputProps={{ 'aria-required': 'true' }}
					>
						<MenuItem value="admin">Admin</MenuItem>
						<MenuItem value="manager">Manager</MenuItem>
						<MenuItem value="trainer">Trainer</MenuItem>
						<MenuItem value="counselor">Counselor</MenuItem>
						<MenuItem value="placement">Placement</MenuItem>
						<MenuItem value="sourcing">Sourcing</MenuItem>
					</Select>
				</FormControl>

				<Box sx={{
					display: 'flex',
					flexDirection: isMobile ? 'column-reverse' : 'row',
					gap: 2,
					justifyContent: 'flex-end',
					mt: 2
				}}>
					<Button
						variant="outlined"
						startIcon={<Cancel />}
						onClick={onCancel}
						disabled={loading}
						fullWidth={isMobile}
						aria-label="Cancel user creation"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						startIcon={loading ? <CircularProgress size={20} color="inherit" aria-hidden="true" /> : <Save />}
						disabled={loading}
						fullWidth={isMobile}
						aria-busy={loading}
						aria-label={loading ? 'Creating User' : 'Create User'}
						sx={{
							bgcolor: '#ec7211',
							'&:hover': {
								bgcolor: '#eb5f07'
							}
						}}
					>
						{loading ? 'Creating...' : 'Create User'}
					</Button>
				</Box>
			</Box>
		</Box>

	);
};

export default UserCreateForm;
