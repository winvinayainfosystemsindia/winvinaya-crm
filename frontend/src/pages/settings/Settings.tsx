import React, { useState, useEffect } from 'react';
import {
	Container,
	Box,
	Paper,
	Typography,
	Tabs,
	Tab,
	Stack
} from '@mui/material';
import {
	Assignment as ScreeningIcon,
	FactCheck as CounselingIcon,
	SmartToy as AIIcon,
	School as SchoolIcon
} from '@mui/icons-material';
import DynamicFieldsSection from '../../components/settings/DynamicFieldsSection';
import AIConfigurationSection from '../../components/settings/AIConfigurationSection';
import TrainingConfigurationSection from '../../components/settings/TrainingConfigurationSection';

const Settings: React.FC = () => {
	const [tabValue, setTabValue] = useState(() => {
		const saved = localStorage.getItem('settings_current_tab');
		return saved ? parseInt(saved, 10) : 0;
	});

	useEffect(() => {
		localStorage.setItem('settings_current_tab', tabValue.toString());
	}, [tabValue]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const renderContent = () => {
		switch (tabValue) {
			case 0:
				return <DynamicFieldsSection entityType="screening" />;
			case 1:
				return <DynamicFieldsSection entityType="counseling" />;
			case 2:
				return <AIConfigurationSection />;
			case 3:
				return <TrainingConfigurationSection />;
			default:
				return (
					<Box sx={{ p: 8, textAlign: 'center' }}>
						<Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
							This section is currently under development.
						</Typography>
					</Box>
				);
		}
	};

	return (
		<Box sx={{
			minHeight: '100vh',
			display: 'flex',
			flexDirection: 'column'
		}}>
			{/* Page Header */}
			<Box sx={{
				bgcolor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
				pt: 3,
				pb: 0,
				px: 4
			}}>
				<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b', letterSpacing: '-0.02em', mb: 0.5 }}>
							System Settings
						</Typography>
						<Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
							Manage your CRM's custom fields, AI configurations, and overall system behavior.
						</Typography>
					</Box>
				</Stack>

				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.95rem',
							minWidth: 120,
							px: 3,
							minHeight: 48,
							color: '#64748b',
							transition: 'all 0.2s',
							'&.Mui-selected': {
								color: '#ec7211',
							}
						},
						'& .MuiTabs-indicator': {
							backgroundColor: '#ec7211',
							height: 3,
							borderRadius: '3px 3px 0 0'
						}
					}}
				>
					<Tab icon={<ScreeningIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Screening Fields" />
					<Tab icon={<CounselingIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Counseling Fields" />
					<Tab icon={<AIIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="AI Configuration" />
					<Tab icon={<SchoolIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Training Config" />
				</Tabs>
			</Box>

			<Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
				<Container maxWidth="xl" sx={{ p: 0 }}>
					<Paper
						elevation={0}
						sx={{
							p: { xs: 3, md: 4 },
							borderRadius: '12px',
							bgcolor: '#ffffff',
							minHeight: '600px',
							border: '1px solid #e2e8f0',
							boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
						}}
					>
						{renderContent()}
					</Paper>
				</Container>
			</Box>
		</Box>
	);
};

export default Settings;
