import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Stack,
	IconButton,
	Divider,
	TextField,
	FormControl,
	Select,
	MenuItem,
	Switch,
	FormControlLabel,
	Alert,
	Chip,
	CircularProgress,
	useTheme,
	useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import userService from '../../services/userService';
import type { User, UserCreate } from '../../models/user';

interface UserDialogProps {
	open: boolean;
	mode: 'add' | 'edit' | 'view';
	user?: User | null;
	onClose: () => void;
	onSuccess?: (message: string) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
	open,
	mode,
	user,
	onClose,
	onSuccess
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Form State
	const [formData, setFormData] = useState<UserCreate & { confirmPassword?: string }>({
		email: '',
		username: '',
		password: '',
		full_name: '',
		role: 'trainer',
		is_active: true,
		is_verified: false,
		confirmPassword: ''
	});

	// Reset form when dialog opens or mode/user changes
	useEffect(() => {
		if (open) {
			setError(null);
			setLoading(false);
			if (mode === 'edit' && user) {
				setFormData({
					email: user.email,
					username: user.username,
					full_name: user.full_name,
					role: user.role,
					is_active: user.is_active,
					is_verified: user.is_verified,
					password: '',
					confirmPassword: ''
				});
			} else if (mode === 'add') {
				setFormData({
					email: '',
					username: '',
					password: '',
					full_name: '',
					role: 'trainer',
					is_active: true,
					is_verified: false,
					confirmPassword: ''
				});
			}
		}
	}, [open, mode, user]);

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		setError(null);
	};

	const handleSubmit = async () => {
		setLoading(true);
		setError(null);

		// Validation
		if (mode === 'add') {
			if (!formData.password) {
				setError('Password is required');
				setLoading(false);
				return;
			}
		}

		if (formData.password && formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		try {
			if (mode === 'add') {
				const { confirmPassword, ...createData } = formData;
				await userService.create(createData);
				if (onSuccess) onSuccess('User created successfully');
			} else if (mode === 'edit' && user) {
				const updateData: any = {
					is_active: formData.is_active,
					role: formData.role
				};
				if (formData.password) {
					updateData.password = formData.password;
				}
				await userService.update(user.id.toString(), updateData);
				if (onSuccess) onSuccess('User updated successfully');
			}

			onClose();
		} catch (err: any) {
			console.error("User save error:", err);
			setError(err.response?.data?.detail || `Failed to ${mode} user`);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return '-';
		try {
			return format(new Date(dateString), 'PPP');
		} catch {
			return '-';
		}
	};

	const AWSInfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
		<Box sx={{ mb: 2.5 }}>
			<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
				{label}
			</Typography>
			<Typography variant="body2" sx={{ fontWeight: 500, color: '#232f3e' }}>
				{value || '-'}
			</Typography>
		</Box>
	);

	const getTitle = () => {
		switch (mode) {
			case 'add': return 'Add New User';
			case 'edit': return 'Edit User';
			case 'view': return 'User Details';
			default: return '';
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			scroll="paper"
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					border: '1px solid #d5dbdb'
				}
			}}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
							{getTitle()}
						</Typography>
						<Typography variant="caption" sx={{ color: '#aab7b8' }}>
							{mode === 'add' ? 'Create a new system user' :
								mode === 'edit' ? `Modify settings for ${user?.username}` :
									`Viewing details for ${user?.username}`}
						</Typography>
					</Box>
					<IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ p: 0, bgcolor: '#f2f3f3' }}>
				{error && (
					<Alert
						severity="error"
						sx={{
							m: 3,
							mb: 0,
							borderRadius: 0,
							borderLeft: '4px solid #d91d11',
							bgcolor: '#fdf3f2'
						}}
					>
						{error}
					</Alert>
				)}

				<Box sx={{ p: 3 }}>
					{mode === 'view' && user ? (
						<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, bgcolor: '#ffffff', p: 3, border: '1px solid #d5dbdb' }}>
							<Box sx={{ gridColumn: 'span 2' }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
									Account Information
								</Typography>
							</Box>
							<AWSInfoRow label="Full Name" value={user.full_name} />
							<AWSInfoRow label="Username" value={user.username} />
							<AWSInfoRow label="Email Address" value={user.email} />
							<AWSInfoRow
								label="System Role"
								value={
									<Chip
										label={user.role.toUpperCase()}
										size="small"
										sx={{
											fontWeight: 700,
											borderRadius: 0,
											bgcolor:
												user.role === 'admin' ? '#d91d11' :
													user.role === 'manager' ? '#ec7211' :
														user.role === 'trainer' ? '#116cc3' : '#68b266',
											color: 'white',
											fontSize: '0.65rem'
										}}
									/>
								}
							/>
							<Box sx={{ gridColumn: 'span 2', mt: 2 }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
									Status & Metadata
								</Typography>
							</Box>
							<AWSInfoRow
								label="Account Status"
								value={
									<Chip
										label={user.is_active ? 'Active' : 'Inactive'}
										size="small"
										sx={{
											fontWeight: 700,
											borderRadius: 0,
											bgcolor: user.is_active ? '#1d8102' : '#d91d11',
											color: 'white',
											fontSize: '0.65rem'
										}}
									/>
								}
							/>
							<AWSInfoRow label="Email Verified" value={user.is_verified ? 'Yes' : 'No'} />
							<AWSInfoRow label="Created On" value={formatDate(user.created_at)} />
							<AWSInfoRow label="Last Modified" value={formatDate(user.updated_at)} />
						</Box>
					) : (
						<Box sx={{ bgcolor: '#ffffff', p: 3, border: '1px solid #d5dbdb', display: 'flex', flexDirection: 'column', gap: 3 }}>
							{/* Basic Info */}
							<Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2, textTransform: 'uppercase' }}>
									Basic Information
								</Typography>
								<Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', mb: 0.5 }}>Full Name</Typography>
										<TextField
											fullWidth
											size="small"
											value={formData.full_name}
											onChange={(e) => handleChange('full_name', e.target.value)}
											disabled={loading || mode === 'edit'} // Usually name isn't editable or optional
											placeholder="e.g. John Doe"
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
										/>
									</Box>
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', mb: 0.5 }}>Username</Typography>
										<TextField
											fullWidth
											size="small"
											value={formData.username}
											onChange={(e) => handleChange('username', e.target.value)}
											disabled={loading || mode === 'edit'} // Username usually immutable
											placeholder="unique_username"
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
										/>
									</Box>
									<Box sx={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
										<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', mb: 0.5 }}>Email Address</Typography>
										<TextField
											fullWidth
											size="small"
											value={formData.email}
											onChange={(e) => handleChange('email', e.target.value)}
											disabled={loading || mode === 'edit'} // Email usually immutable
											placeholder="user@example.com"
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
										/>
									</Box>
								</Box>
							</Box>

							<Divider />

							{/* Role & Permissions */}
							<Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2, textTransform: 'uppercase' }}>
									Permissions & Status
								</Typography>
								<Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', mb: 0.5 }}>System Role</Typography>
										<FormControl fullWidth size="small">
											<Select
												value={formData.role}
												onChange={(e) => handleChange('role', e.target.value)}
												disabled={loading}
												sx={{ borderRadius: 0 }}
											>
												<MenuItem value="admin">Admin</MenuItem>
												<MenuItem value="manager">Manager</MenuItem>
												<MenuItem value="trainer">Trainer</MenuItem>
												<MenuItem value="counselor">Counselor</MenuItem>
												<MenuItem value="placement">Placement</MenuItem>
												<MenuItem value="sourcing">Sourcing</MenuItem>
											</Select>
										</FormControl>
									</Box>
									{mode === 'edit' && (
										<Box>
											<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', mb: 0.5 }}>Account Status</Typography>
											<FormControlLabel
												control={
													<Switch
														checked={formData.is_active}
														onChange={(e) => handleChange('is_active', e.target.checked)}
														disabled={loading}
													/>
												}
												label={formData.is_active ? 'Active' : 'Inactive'}
												sx={{ ml: 0 }}
											/>
										</Box>
									)}
								</Box>
							</Box>

							<Divider />

							{/* Password */}
							<Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2, textTransform: 'uppercase' }}>
									Security
								</Typography>
								<Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', mb: 0.5 }}>
											{mode === 'edit' ? 'New Password (Optional)' : 'Password'}
										</Typography>
										<TextField
											fullWidth
											size="small"
											type="password"
											value={formData.password}
											onChange={(e) => handleChange('password', e.target.value)}
											disabled={loading}
											placeholder={mode === 'edit' ? "Leave blank to keep current" : "Enter password"}
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
										/>
									</Box>
									<Box>
										{(mode === 'add' || formData.password) && (
											<>
												<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e', mb: 0.5 }}>Confirm Password</Typography>
												<TextField
													fullWidth
													size="small"
													type="password"
													value={formData.confirmPassword}
													onChange={(e) => handleChange('confirmPassword', e.target.value)}
													disabled={loading}
													placeholder="Re-enter password"
													sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
												/>
											</>
										)}
									</Box>
								</Box>
							</Box>
						</Box>
					)}
				</Box>
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />

			<DialogActions sx={{ p: 2, bgcolor: '#ffffff' }}>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ color: '#545b64', fontWeight: 700, px: 3, textTransform: 'none' }}
				>
					{mode === 'view' ? 'Close' : 'Cancel'}
				</Button>
				{mode !== 'view' && (
					<Button
						onClick={handleSubmit}
						variant="contained"
						disabled={loading}
						sx={{
							bgcolor: '#ec7211',
							color: '#ffffff',
							px: 4,
							fontWeight: 700,
							borderRadius: '2px',
							textTransform: 'none',
							border: '1px solid #ec7211',
							'&:hover': { bgcolor: '#eb5f07', borderColor: '#eb5f07' },
							boxShadow: 'none'
						}}
					>
						{loading ? <CircularProgress size={24} color="inherit" /> : (mode === 'add' ? 'Create User' : 'Save Changes')}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default UserDialog;
