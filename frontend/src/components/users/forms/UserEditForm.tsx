import React, { useState } from 'react';
import {
	Box,
	TextField,
	Button,
	Typography,
	Alert,
	CircularProgress,
	FormControlLabel,
	Switch
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import userService from '../../../services/userService';
import type { User } from '../../../models/user';

interface UserEditFormProps {
	user: User;
	onSuccess: () => void;
	onCancel: () => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSuccess, onCancel }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		password: '',
		confirmPassword: '',
		is_active: user.is_active
	});

	const handleChange = (field: string, value: string | boolean) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validate password match if changing password
		if (formData.password && formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		try {
			const updateData: any = {
				is_active: formData.is_active
			};

			// Only include password if it's being changed
			if (formData.password) {
				updateData.password = formData.password;
			}

			await userService.update(user.id.toString(), updateData);
			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Failed to update user');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
			<Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>
				Edit User
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
				{user.full_name || user.username} ({user.email})
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				{/* User Info Display */}
				<Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
						USERNAME
					</Typography>
					<Typography variant="body1" sx={{ fontWeight: 500 }}>
						{user.username}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
						EMAIL
					</Typography>
					<Typography variant="body1" sx={{ fontWeight: 500 }}>
						{user.email}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
						ROLE
					</Typography>
					<Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
						{user.role}
					</Typography>
				</Box>

				{/* Password Change */}
				<Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
					Change Password (Optional)
				</Typography>

				<TextField
					label="New Password"
					type="password"
					value={formData.password}
					onChange={(e) => handleChange('password', e.target.value)}
					fullWidth
					disabled={loading}
					helperText="Leave blank to keep current password. Min 8 characters, must contain uppercase, lowercase, and digit"
				/>

				{formData.password && (
					<TextField
						label="Confirm New Password"
						type="password"
						value={formData.confirmPassword}
						onChange={(e) => handleChange('confirmPassword', e.target.value)}
						fullWidth
						disabled={loading}
						error={formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0}
						helperText={
							formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0
								? 'Passwords do not match'
								: ''
						}
					/>
				)}

				{/* Status Toggle */}
				<Box sx={{ mt: 1 }}>
					<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
						User Status
					</Typography>
					<FormControlLabel
						control={
							<Switch
								checked={formData.is_active}
								onChange={(e) => handleChange('is_active', e.target.checked)}
								disabled={loading}
								color="success"
							/>
						}
						label={
							<Box>
								<Typography variant="body2">
									{formData.is_active ? 'Active' : 'Inactive'}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{formData.is_active
										? 'User can login and access the system'
										: 'User cannot login'}
								</Typography>
							</Box>
						}
					/>
				</Box>

				<Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
					<Button
						variant="outlined"
						startIcon={<Cancel />}
						onClick={onCancel}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						startIcon={loading ? <CircularProgress size={20} /> : <Save />}
						disabled={loading}
						sx={{
							bgcolor: '#ec7211',
							'&:hover': {
								bgcolor: '#eb5f07'
							}
						}}
					>
						{loading ? 'Saving...' : 'Save Changes'}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default UserEditForm;
