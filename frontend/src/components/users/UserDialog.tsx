import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog,
	TextField,
	FormControl,
	Select,
	MenuItem,
	Switch,
	FormControlLabel,
	InputAdornment,
	Box,
	Typography,
	useTheme,
	useMediaQuery,
	alpha,
	Grid,
	IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRoles, createUser, updateUser } from '../../store/slices/userSlice';
import type { User, UserCreate, UserUpdate } from '../../models/user';

// Import modular form components
import { EnterpriseForm, type FormStep } from '../common/form';
import { awsStyles } from '../../theme/theme';

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
	const dispatch = useAppDispatch();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const { roles } = useAppSelector((state) => state.users);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const { fieldLabel, sectionTitle } = awsStyles;

	// Fetch roles on mount via Redux
	useEffect(() => {
		if (roles.length === 0) {
			dispatch(fetchRoles());
		}
	}, [dispatch, roles.length]);

	// Form State
	const [formData, setFormData] = useState<UserCreate & { confirmPassword?: string }>({
		email: '',
		username: '',
		password: '',
		full_name: '',
		role: 'trainer',
		is_active: true,
		is_verified: false,
		mobile: '',
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
					mobile: user.mobile || '',
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
					mobile: '',
					confirmPassword: ''
				});
			}
			setShowPassword(false);
			setShowConfirmPassword(false);
		}
	}, [open, mode, user]);

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		setError(null);
	};

	const handleSubmit = async () => {
		setLoading(true);
		setError(null);

		if (mode === 'add' && !formData.password) {
			setError('Password is required');
			setLoading(false);
			return;
		}

		if (formData.password && formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		try {
			if (mode === 'add') {
				const { confirmPassword, ...createData } = formData;
				await dispatch(createUser(createData)).unwrap();
				if (onSuccess) onSuccess('User created successfully');
			} else if (mode === 'edit' && user) {
				const updateData: UserUpdate = {
					full_name: formData.full_name,
					username: formData.username,
					email: formData.email,
					is_active: formData.is_active,
					role: formData.role,
					mobile: formData.mobile
				};
				if (formData.password) {
					updateData.password = formData.password;
				}
				await dispatch(updateUser({ id: user.id.toString(), userData: updateData })).unwrap();
				if (onSuccess) onSuccess('User updated successfully');
			}
			onClose();
		} catch (err: any) {
			setError(err || `Failed to ${mode} user`);
		} finally {
			setLoading(false);
		}
	};

	const formatRoleName = (role: string) => {
		return role
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return '-';
		try {
			return format(new Date(dateString), 'PPP');
		} catch {
			return '-';
		}
	};

	// High-precision Input Styling
	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '4px',
			bgcolor: alpha(theme.palette.background.paper, 0.8),
			'& fieldset': { borderColor: theme.palette.divider },
			'&:hover fieldset': { borderColor: alpha(theme.palette.text.primary, 0.2) },
			'&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
			'& input': { padding: '10.5px 14px' }
		}
	};

	const steps = useMemo((): FormStep[] => [
		{
			label: 'Basic Information',
			description: 'Profile & Identity',
			content: (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<Box>
						<Typography variant="awsSectionTitle" sx={{ mb: 2, color: theme.palette.primary.main }}>
							Account Identity
						</Typography>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 6 }}>
								<Typography variant="awsFieldLabel">Full Name</Typography>
								<TextField
									fullWidth
									size="small"
									value={formData.full_name}
									onChange={(e) => handleChange('full_name', e.target.value)}
									disabled={loading || mode === 'view'}
									placeholder="e.g. John Doe"
									sx={inputSx}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<Typography variant="awsFieldLabel">Username</Typography>
								<TextField
									fullWidth
									size="small"
									value={formData.username}
									onChange={(e) => handleChange('username', e.target.value)}
									disabled={loading || mode === 'view'}
									placeholder="unique_username"
									sx={inputSx}
								/>
							</Grid>
						</Grid>
					</Box>

					<Box>
						<Typography variant="awsSectionTitle" sx={{ mb: 2, color: theme.palette.primary.main }}>
							Communication Channels
						</Typography>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 6 }}>
								<Typography variant="awsFieldLabel">Email Address</Typography>
								<TextField
									fullWidth
									size="small"
									value={formData.email}
									onChange={(e) => handleChange('email', e.target.value)}
									disabled={loading || mode === 'view'}
									placeholder="user@example.com"
									sx={inputSx}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<Typography variant="awsFieldLabel">WhatsApp Number</Typography>
								<TextField
									fullWidth
									size="small"
									value={formData.mobile}
									onChange={(e) => handleChange('mobile', e.target.value)}
									disabled={loading || mode === 'view'}
									placeholder="e.g. 919876543210"
									helperText={mode !== 'view' ? "Format: 91 followed by 10 digits" : ""}
									sx={inputSx}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>
			)
		},
		{
			label: 'Permissions & Status',
			description: 'Security & Metadata',
			content: (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<Box>
						<Typography variant="awsSectionTitle" sx={{ mb: 2, color: theme.palette.primary.main }}>
							System Authorization
						</Typography>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 6 }}>
								<Typography variant="awsFieldLabel">Managed Security Role</Typography>
								<FormControl fullWidth size="small">
									<Select
										value={formData.role}
										onChange={(e) => handleChange('role', e.target.value)}
										disabled={loading || mode === 'view'}
										sx={{ borderRadius: '4px', bgcolor: theme.palette.background.paper }}
									>
										{roles.map((role) => (
											<MenuItem key={role} value={role}>
												{formatRoleName(role)}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Box>

					{mode !== 'add' && (
						<Box>
							<Typography variant="awsSectionTitle" sx={{ mb: 2, color: theme.palette.primary.main }}>
								Lifecycle Governance
							</Typography>
							<Box sx={{ p: 3, bgcolor: alpha(theme.palette.background.paper, 0.4), border: `1px solid ${theme.palette.divider}`, borderRadius: '4px' }}>
								<FormControlLabel
									control={
										<Switch
											checked={formData.is_active}
											onChange={(e) => handleChange('is_active', e.target.checked)}
											disabled={loading || mode === 'view'}
											color="success"
										/>
									}
									label={
										<Typography variant="body2" sx={{ fontWeight: 700 }}>
											ACCOUNT STATE: {formData.is_active ? 'ACTIVE' : 'LOCKED'}
										</Typography>
									}
								/>
								<Grid container spacing={3} sx={{ mt: 2 }}>
									{mode === 'view' && user && (
										<>
											<Grid size={{ xs: 6 }}>
												<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', display: 'block' }}>AUDIT: INITIALIZED</Typography>
												<Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(user.created_at)}</Typography>
											</Grid>
											<Grid size={{ xs: 6 }}>
												<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', display: 'block' }}>AUDIT: LAST SYNC</Typography>
												<Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(user.updated_at)}</Typography>
											</Grid>
										</>
									)}
								</Grid>
							</Box>
						</Box>
					)}
				</Box>
			)
		},
		{
			label: 'Security',
			description: 'Authentication Secrets',
			content: (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<Box>
						<Typography variant="awsSectionTitle" sx={{ mb: 2, color: theme.palette.primary.main }}>
							Credential Policy
						</Typography>
						{mode === 'view' ? (
							<Box sx={{ py: 6, px: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.03), border: `1px dashed ${theme.palette.info.light}`, borderRadius: '4px' }}>
								<Typography variant="body2" color="info.main" sx={{ fontWeight: 600 }}>
									Individual secrets are encrypted and managed via the identity provider.
								</Typography>
							</Box>
						) : (
							<Grid container spacing={3}>
								<Grid size={{ xs: 12, md: 6 }}>
									<Typography variant="awsFieldLabel">
										{mode === 'edit' ? 'Update Domain Password' : 'Initial Password'}
									</Typography>
									<TextField
										fullWidth
										size="small"
										type={showPassword ? 'text' : 'password'}
										value={formData.password}
										onChange={(e) => handleChange('password', e.target.value)}
										disabled={loading}
										placeholder={mode === 'edit' ? "Enter only if updating" : "Complexity required"}
										sx={inputSx}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton onClick={() => setShowPassword(!showPassword)} size="small">
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								</Grid>
								{(mode === 'add' || formData.password) && (
									<Grid size={{ xs: 12, md: 6 }}>
										<Typography variant="awsFieldLabel">Verify Lifecycle Credentials</Typography>
										<TextField
											fullWidth
											size="small"
											type={showConfirmPassword ? 'text' : 'password'}
											value={formData.confirmPassword}
											onChange={(e) => handleChange('confirmPassword', e.target.value)}
											disabled={loading}
											placeholder="Re-enter for verification"
											sx={inputSx}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} size="small">
															{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									</Grid>
								)}
							</Grid>
						)}
					</Box>
				</Box>
			)
		}
	], [formData, loading, mode, isMobile, roles, user, theme, sectionTitle, fieldLabel]);

	const getMode = () => {
		if (mode === 'add') return 'create';
		return mode;
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					bgcolor: 'transparent'
				}
			}}
		>
				<EnterpriseForm
					title={mode === 'add' ? 'Create Domain Identity' : mode === 'edit' ? 'Governance: User Context' : 'User Runtime Properties'}
					subtitle={mode === 'add' ? 'Initialize a new system entity within the secure administrative perimeter' : `Infrastructure governance for: ${user?.username}`}
					mode={getMode() as 'create' | 'edit' | 'view'}
					steps={steps}
					onSave={handleSubmit}
					onCancel={onClose}
					isSubmitting={loading}
					saveButtonText={mode === 'add' ? 'Provision Account' : 'Commit Changes'}
					error={error}
				/>
		</Dialog>
	);
};

export default UserDialog;
