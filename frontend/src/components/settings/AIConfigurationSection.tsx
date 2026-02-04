import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	Switch,
	TextField,
	IconButton,
	Button,
	Paper,
	useTheme,
	alpha,
	Tooltip
} from '@mui/material';
import {
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon,
	CheckCircle as CheckCircleIcon,
	SaveOutlined as SaveIcon,
	SpeedOutlined as SpeedIcon,
	LockOutlined as LockIcon
} from '@mui/icons-material';
import { settingsService, type SystemSetting } from '../../services/settingsService';
import { chatService } from '../../services/chatService';
import { useSnackbar } from 'notistack';

const AIConfigurationSection: React.FC = () => {
	const theme = useTheme();
	const { enqueueSnackbar } = useSnackbar();
	const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
	const [loading, setLoading] = useState(false);
	const [savingSettings, setSavingSettings] = useState(false);
	const [testingConnection, setTestingConnection] = useState(false);
	const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});

	useEffect(() => {
		loadSystemSettings();
	}, []);

	const loadSystemSettings = async () => {
		setLoading(true);
		try {
			const data = await settingsService.getSystemSettings();
			setSystemSettings(data);
		} catch (error) {
			enqueueSnackbar('Failed to load system settings', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleSaveSetting = async (id: number, value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue === '********') return;
		try {
			await settingsService.updateSystemSetting(id, { value: trimmedValue });
		} catch (error) {
			enqueueSnackbar('Failed to update setting', { variant: 'error' });
		}
	};

	const handleBulkSave = async () => {
		setSavingSettings(true);
		try {
			const savePromises = systemSettings
				.filter((s: SystemSetting) => !(s.is_secret && s.value === '********'))
				.map((s: SystemSetting) => settingsService.updateSystemSetting(s.id, { value: s.value.trim() }));

			await Promise.all(savePromises);
			enqueueSnackbar('All AI settings saved successfully', { variant: 'success' });
			loadSystemSettings();
		} catch (error) {
			enqueueSnackbar('Failed to save some settings', { variant: 'error' });
		} finally {
			setSavingSettings(false);
		}
	};

	const handleTestConnection = async () => {
		setTestingConnection(true);
		try {
			const result = await chatService.testConnection();
			if (result.status === 'success') {
				enqueueSnackbar(result.message, { variant: 'success' });
			} else {
				enqueueSnackbar(result.message, { variant: 'error' });
			}
		} catch (error) {
			enqueueSnackbar('Failed to test connection. Please ensure all settings are saved.', { variant: 'error' });
		} finally {
			setTestingConnection(false);
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2 }}>
				<CircularProgress size={36} thickness={4} />
				<Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
					Loading configuration...
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				mb: 4,
				pb: 3,
				borderBottom: '1px solid #f2f3f3'
			}}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1c21', mb: 0.5 }}>
						Sarathi Engine Configuration
					</Typography>
					<Typography variant="body2" sx={{ color: '#64748b' }}>
						Manage API keys and global settings for Sarathi, your AI-powered candidate screening and counseling assistant.
					</Typography>
				</Box>
				<Stack direction="row" spacing={2}>
					<Button
						variant="outlined"
						startIcon={testingConnection ? <CircularProgress size={16} color="inherit" /> : <SpeedIcon />}
						onClick={handleTestConnection}
						disabled={testingConnection || savingSettings}
						sx={{
							borderRadius: '6px',
							textTransform: 'none',
							fontWeight: 600,
							borderColor: '#e2e8f0',
							color: '#475569',
							'&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
						}}
					>
						Test Connectivity
					</Button>
					<Button
						variant="contained"
						disableElevation
						startIcon={savingSettings ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
						onClick={handleBulkSave}
						disabled={savingSettings || testingConnection}
						sx={{
							bgcolor: theme.palette.primary.main,
							borderRadius: '6px',
							textTransform: 'none',
							fontWeight: 600,
							px: 3
						}}
					>
						Save All Settings
					</Button>
				</Stack>
			</Box>

			<Stack spacing={3}>
				{systemSettings
					.filter((s: SystemSetting) => s.key !== 'ai_provider')
					.map((setting: SystemSetting) => (
						<Paper
							key={setting.id}
							elevation={0}
							sx={{
								p: 3,
								borderRadius: '8px',
								border: '1px solid #e2e8f0',
								bgcolor: '#ffffff',
								display: 'flex',
								flexDirection: { xs: 'column', sm: 'row' },
								alignItems: { xs: 'flex-start', sm: 'center' },
								gap: 3,
								'&:hover': { borderColor: '#cbd5e1' }
							}}
						>
							<Box sx={{ flexGrow: 1, minWidth: { sm: 250 } }}>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
										{setting.description || setting.key.replace(/_/g, ' ').toUpperCase()}
									</Typography>
									{setting.is_secret && (
										<Tooltip title="Secure Sensitive Information">
											<LockIcon sx={{ fontSize: '0.875rem', color: '#94a3b8' }} />
										</Tooltip>
									)}
								</Stack>
								<Typography variant="caption" sx={{ color: '#64748b' }}>
									Internal Key: <code>{setting.key}</code>
								</Typography>
							</Box>

							<Box sx={{ width: '100%', maxWidth: { sm: 500 } }}>
								{setting.key === 'ai_enabled' ? (
									<Box sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										px: 2,
										py: 1,
										bgcolor: setting.value === 'true' ? alpha(theme.palette.success.main, 0.05) : '#f8fafc',
										borderRadius: '6px',
										border: '1px solid',
										borderColor: setting.value === 'true' ? alpha(theme.palette.success.main, 0.2) : '#e2e8f0'
									}}>
										<Typography variant="body2" sx={{
											fontWeight: 600,
											color: setting.value === 'true' ? theme.palette.success.main : '#64748b'
										}}>
											{setting.value === 'true' ? "Currently Enabled" : "Currently Disabled"}
										</Typography>
										<Switch
											size="small"
											checked={setting.value === 'true'}
											onChange={(e) => {
												const val = e.target.checked ? 'true' : 'false';
												setSystemSettings((prev: SystemSetting[]) => prev.map((s: SystemSetting) => s.id === setting.id ? { ...s, value: val } : s));
												handleSaveSetting(setting.id, val);
											}}
										/>
									</Box>
								) : (
									<TextField
										fullWidth
										size="small"
										type={setting.is_secret ? (showSecrets[setting.id] ? "text" : "password") : "text"}
										value={setting.value}
										onChange={(e) => {
											const val = e.target.value;
											setSystemSettings((prev: SystemSetting[]) => prev.map((s: SystemSetting) => s.id === setting.id ? { ...s, value: val } : s));
										}}
										onBlur={(e) => handleSaveSetting(setting.id, e.target.value)}
										placeholder={setting.is_secret ? "••••••••••••••••" : `Enter ${setting.key}`}
										InputProps={{
											sx: { borderRadius: '6px' },
											endAdornment: setting.is_secret ? (
												<Stack direction="row" spacing={0.5} alignItems="center">
													{setting.value === '********' && (
														<CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main, mr: 0.5 }} />
													)}
													<IconButton
														size="small"
														onClick={() => setShowSecrets(prev => ({ ...prev, [setting.id]: !prev[setting.id] }))}
														sx={{ color: '#94a3b8' }}
													>
														{showSecrets[setting.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
													</IconButton>
												</Stack>
											) : null
										}}
										helperText={
											setting.is_secret && setting.value === '********'
												? "API key is securely stored."
												: null
										}
										FormHelperTextProps={{ sx: { color: theme.palette.success.main, fontWeight: 500 } }}
									/>
								)}
							</Box>
						</Paper>
					))}
			</Stack>

			<Box sx={{ mt: 5, p: 3, bgcolor: '#fdf2f2', border: '1px solid #fee2e2', borderRadius: '8px' }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b', mb: 1 }}>
					Important Note
				</Typography>
				<Typography variant="body2" sx={{ color: '#b91c1c' }}>
					Changes to these settings take effect immediately across all system modules. Always test the connection after updating API keys to ensure uninterrupted service.
				</Typography>
			</Box>
		</Box>
	);
};

export default AIConfigurationSection;
