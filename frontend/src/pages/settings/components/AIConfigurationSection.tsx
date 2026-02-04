import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	FormControlLabel,
	Switch,
	TextField,
	IconButton,
	Button
} from '@mui/material';
import {
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon,
	CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { settingsService, type SystemSetting } from '../../../services/settingsService';
import { chatService } from '../../../services/chatService';
import { useSnackbar } from 'notistack';

const AIConfigurationSection: React.FC = () => {
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
				.filter(s => !(s.is_secret && s.value === '********'))
				.map(s => settingsService.updateSystemSetting(s.id, { value: s.value.trim() }));

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
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
				<CircularProgress size={32} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{ mb: 4 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#545b64', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
					AI Chatbot Configuration
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Configure the backend AI features. Settings saved here impact all users.
				</Typography>
			</Box>

			<Stack spacing={4}>
				{systemSettings
					.filter(s => s.key !== 'ai_provider')
					.map((setting) => (
						<Box key={setting.id}>
							<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
								{setting.description || setting.key.replace(/_/g, ' ').toUpperCase()}
							</Typography>
							{setting.key === 'ai_enabled' ? (
								<FormControlLabel
									control={
										<Switch
											checked={setting.value === 'true'}
											onChange={(e) => {
												const val = e.target.checked ? 'true' : 'false';
												setSystemSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
												handleSaveSetting(setting.id, val);
											}}
										/>
									}
									label={setting.value === 'true' ? "Enabled" : "Disabled"}
								/>
							) : (
								<TextField
									fullWidth
									size="small"
									type={setting.is_secret ? (showSecrets[setting.id] ? "text" : "password") : "text"}
									value={setting.value}
									onChange={(e) => {
										const val = e.target.value;
										setSystemSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
									}}
									onBlur={(e) => handleSaveSetting(setting.id, e.target.value)}
									placeholder={setting.is_secret ? "••••••••••••••••" : `Enter ${setting.key}`}
									sx={{ maxWidth: 600 }}
									InputProps={{
										endAdornment: setting.is_secret ? (
											<Stack direction="row" spacing={1} alignItems="center">
												{setting.value === '********' && (
													<CheckCircleIcon color="success" sx={{ fontSize: 18, mr: 0.5 }} />
												)}
												<IconButton
													size="small"
													onClick={() => setShowSecrets(prev => ({ ...prev, [setting.id]: !prev[setting.id] }))}
												>
													{showSecrets[setting.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
												</IconButton>
											</Stack>
										) : null
									}}
									helperText={setting.is_secret && (setting.value === '********' ? "Configuration is securely saved." : "Editing key...")}
								/>
							)}
						</Box>
					))}

				<Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
					<Button
						variant="contained"
						onClick={handleBulkSave}
						disabled={savingSettings}
						sx={{
							bgcolor: '#ec7211',
							'&:hover': { bgcolor: '#eb5f07' },
							borderRadius: '2px',
							textTransform: 'none',
							fontWeight: 700,
							boxShadow: 'none',
							px: 3
						}}
					>
						{savingSettings ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save AI Configuration'}
					</Button>

					<Button
						variant="outlined"
						onClick={handleTestConnection}
						disabled={testingConnection}
						sx={{
							borderColor: '#545b64',
							color: '#232f3e',
							'&:hover': { borderColor: '#232f3e', bgcolor: '#f2f3f3' },
							borderRadius: '2px',
							textTransform: 'none',
							fontWeight: 700,
							px: 3
						}}
					>
						{testingConnection ? <CircularProgress size={20} /> : 'Test AI Connection'}
					</Button>
				</Box>
			</Stack>
		</Box>
	);
};

export default AIConfigurationSection;
