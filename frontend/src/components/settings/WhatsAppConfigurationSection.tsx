import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	TextField,
	IconButton,
	Button,
	Paper,
	useTheme,
	Tooltip
} from '@mui/material';
import {
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon,
	CheckCircle as CheckCircleIcon,
	SaveOutlined as SaveIcon,
	LockOutlined as LockIcon,
	WhatsApp as WhatsAppIcon,
	HelpOutline as HelpIcon
} from '@mui/icons-material';
import { settingsService, type SystemSetting } from '../../services/settingsService';
import { useSnackbar } from 'notistack';

const WhatsAppConfigurationSection: React.FC = () => {
	const theme = useTheme();
	const { enqueueSnackbar } = useSnackbar();
	const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
	const [loading, setLoading] = useState(false);
	const [savingSettings, setSavingSettings] = useState(false);
	const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});

	useEffect(() => {
		loadWhatsAppSettings();
	}, []);

	const loadWhatsAppSettings = async () => {
		setLoading(true);
		try {
			const data = await settingsService.getSystemSettings();
			// Filter for only WhatsApp settings
			const waSettings = data.filter((s: SystemSetting) => s.key.startsWith('whatsapp_'));
			setSystemSettings(waSettings);
		} catch (error) {
			enqueueSnackbar('Failed to load WhatsApp settings', { variant: 'error' });
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
			enqueueSnackbar('WhatsApp settings saved successfully', { variant: 'success' });
			loadWhatsAppSettings();
		} catch (error) {
			enqueueSnackbar('Failed to save some settings', { variant: 'error' });
		} finally {
			setSavingSettings(false);
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2 }}>
				<CircularProgress size={36} thickness={4} />
				<Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
					Loading WhatsApp configuration...
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
					<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
						<WhatsAppIcon sx={{ color: '#25D366' }} />
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1c21' }}>
							WhatsApp Business API Integration
						</Typography>
					</Stack>
					<Typography variant="body2" sx={{ color: '#64748b' }}>
						Manage credentials for Meta WhatsApp Cloud API to enable automated lead ingestion and employee forwarding.
					</Typography>
				</Box>
				<Button
					variant="contained"
					disableElevation
					startIcon={savingSettings ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
					onClick={handleBulkSave}
					disabled={savingSettings}
					sx={{
						bgcolor: theme.palette.primary.main,
						borderRadius: '6px',
						textTransform: 'none',
						fontWeight: 600,
						px: 3
					}}
				>
					Save All
				</Button>
			</Box>

			<Stack spacing={3}>
				{systemSettings.map((setting: SystemSetting) => (
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
							<Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
								Key: <code>{setting.key}</code>
								{setting.key === 'whatsapp_verify_token' && (
									<Tooltip title="Used for webhook verification in Meta Developer Portal">
										<HelpIcon sx={{ fontSize: 14, cursor: 'help' }} />
									</Tooltip>
								)}
							</Typography>
						</Box>

						<Box sx={{ width: '100%', maxWidth: { sm: 500 } }}>
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
								placeholder={setting.is_secret ? "••••••••••••••••" : `Enter ${setting.key.replace('whatsapp_', '').replace(/_/g, ' ')}`}
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
									) : (
										setting.value && <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main, mr: 1 }} />
									)
								}}
								helperText={
									setting.is_secret && setting.value === '********'
										? "Encrypted & securely stored."
										: null
								}
								FormHelperTextProps={{ sx: { color: theme.palette.success.main, fontWeight: 500 } }}
							/>
						</Box>
					</Paper>
				))}
			</Stack>

			<Box sx={{ mt: 5, p: 3, bgcolor: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '8px' }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0369a1', mb: 1 }}>
					Setup Guide
				</Typography>
				<Typography variant="body2" sx={{ color: '#075985', mb: 1 }}>
					1. Get your <b>Permanent Access Token</b> and <b>Phone Number ID</b> from the Meta App Dashboard (WhatsApp {'->'} Getting Started).
				</Typography>
				<Typography variant="body2" sx={{ color: '#075985', mb: 1 }}>
					2. Set the <b>Webhook URL</b> in Meta to: <code>https://your-crm-domain.com/api/v1/webhooks/whatsapp</code>
				</Typography>
				<Typography variant="body2" sx={{ color: '#075985' }}>
					3. Use the <b>Verify Token</b> from above to complete the webhook verification step in Meta.
				</Typography>
			</Box>
		</Box>
	);
};

export default WhatsAppConfigurationSection;
