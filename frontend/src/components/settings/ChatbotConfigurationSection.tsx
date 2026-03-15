import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	Switch,
	Paper,
	useTheme,
	alpha
} from '@mui/material';
import {
	SmartToyOutlined as ChatbotIcon,
	InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { settingsService, type SystemSetting } from '../../services/settingsService';
import { useSnackbar } from 'notistack';

const CHATBOT_KEYS = ['chatbot_enabled', 'ai_enabled'];

const ChatbotConfigurationSection: React.FC = () => {
	const theme = useTheme();
	const { enqueueSnackbar } = useSnackbar();
	const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadChatbotSettings();
	}, []);

	const loadChatbotSettings = async () => {
		setLoading(true);
		try {
			const data = await settingsService.getSystemSettings();
			// Filter for chatbot specific toggles
			const filtered = data.filter((s: SystemSetting) => CHATBOT_KEYS.includes(s.key));
			setSystemSettings(filtered);
		} catch (error) {
			enqueueSnackbar('Failed to load chatbot configuration', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleToggle = async (id: number, currentValue: string) => {
		const newValue = currentValue === 'true' ? 'false' : 'true';
		try {
			// Optimistic update
			setSystemSettings(prev => prev.map(s => s.id === id ? { ...s, value: newValue } : s));
			await settingsService.updateSystemSetting(id, { value: newValue });
			enqueueSnackbar('Setting updated successfully', { variant: 'success' });
		} catch (error) {
			// Rollback
			setSystemSettings(prev => prev.map(s => s.id === id ? { ...s, value: currentValue } : s));
			enqueueSnackbar('Failed to update setting', { variant: 'error' });
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2 }}>
				<CircularProgress size={36} thickness={4} />
				<Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
					Loading chatbot settings...
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
						<ChatbotIcon sx={{ color: theme.palette.primary.main }} />
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1c21' }}>
							AI Chatbot Configuration
						</Typography>
					</Stack>
					<Typography variant="body2" sx={{ color: '#64748b' }}>
						Enable or disable the interactive AI assistant for candidates and employees.
					</Typography>
				</Box>
			</Box>

			<Stack spacing={3}>
				{systemSettings.map((setting: SystemSetting) => (
					<Paper
						key={setting.id}
						elevation={0}
						sx={{
							p: 3,
							borderRadius: '12px',
							border: '1px solid #e2e8f0',
							bgcolor: '#ffffff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 3,
							transition: 'all 0.2s',
							'&:hover': { 
								borderColor: theme.palette.primary.main,
								boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
							}
						}}
					>
						<Box>
							<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
								{setting.key === 'chatbot_enabled' ? "Enable Public Chatbot" : "Enable Internal AI (Global Toggle)"}
							</Typography>
							<Typography variant="body2" sx={{ color: '#64748b' }}>
								{setting.description || "Toggle this feature on or off globally."}
							</Typography>
						</Box>

						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Typography variant="body2" sx={{ 
								fontWeight: 700, 
								color: setting.value === 'true' ? theme.palette.success.main : '#94a3b8'
							}}>
								{setting.value === 'true' ? "ACTIVE" : "INACTIVE"}
							</Typography>
							<Switch
								checked={setting.value === 'true'}
								onChange={() => handleToggle(setting.id, setting.value)}
								color="primary"
								sx={{
									'& .MuiSwitch-switchBase.Mui-checked': {
										color: theme.palette.primary.main,
									},
									'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
										backgroundColor: theme.palette.primary.main,
									},
								}}
							/>
						</Box>
					</Paper>
				))}
			</Stack>

			<Box sx={{ 
				mt: 6, 
				p: 3, 
				borderRadius: '12px', 
				bgcolor: alpha(theme.palette.info.main, 0.05),
				border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
				display: 'flex',
				gap: 2
			}}>
				<InfoIcon color="info" />
				<Box>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.info.main, mb: 0.5 }}>
						Note on Intelligence
					</Typography>
					<Typography variant="body2" sx={{ color: theme.palette.info.dark }}>
						The Chatbot uses the centralized "AI Engine" credentials. If the AI Engine is not configured with a valid API key, the Chatbot will remain inactive even if toggled ON.
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default ChatbotConfigurationSection;
