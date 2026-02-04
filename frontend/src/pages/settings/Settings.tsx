import React, { useState, useEffect } from 'react';
import {
	Container,
	Box,
	Paper,
	Typography,
	Divider,
	Grid
} from '@mui/material';
import SettingsSidebar from '../../components/settings/SettingsSidebar';
import DynamicFieldsSection from '../../components/settings/DynamicFieldsSection';
import AIConfigurationSection from '../../components/settings/AIConfigurationSection';

const Settings: React.FC = () => {
	const [tabValue, setTabValue] = useState(() => {
		const saved = localStorage.getItem('settings_current_tab');
		return saved ? parseInt(saved, 10) : 0;
	});

	useEffect(() => {
		localStorage.setItem('settings_current_tab', tabValue.toString());
	}, [tabValue]);

	const renderContent = () => {
		switch (tabValue) {
			case 0:
				return <DynamicFieldsSection entityType="screening" />;
			case 1:
				return <DynamicFieldsSection entityType="counseling" />;
			case 2:
				return <AIConfigurationSection />;
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

	const getTabLabel = (id: number) => {
		switch (id) {
			case 0: return 'Screening Fields';
			case 1: return 'Counseling Fields';
			case 2: return 'AI Configuration';
			default: return 'General Settings';
		}
	};

	return (
		<Box sx={{
			bgcolor: '#f8fafc',
			minHeight: '100vh',
			display: 'flex',
			flexDirection: 'column'
		}}>
			{/* Page Header */}
			<Box sx={{
				bgcolor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
				py: 2.5,
				px: 4,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
						System Settings
					</Typography>
					<Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
						Configure global system parameters, custom fields, and AI integrations
					</Typography>
				</Box>
			</Box>

			<Grid container spacing={0} sx={{ flexGrow: 1 }}>
				{/* Sidebar */}
				<Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
					<SettingsSidebar currentTab={tabValue} onTabChange={setTabValue} />
				</Grid>

				{/* Main Content Area */}
				<Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
					<Container maxWidth="xl" sx={{ py: 5, px: { xs: 2, md: 6 } }}>
						<Paper
							elevation={0}
							sx={{
								p: { xs: 3, md: 5 },
								borderRadius: '12px',
								bgcolor: '#ffffff',
								minHeight: '700px',
								border: '1px solid #e2e8f0',
								boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
							}}
						>
							<Box sx={{ mb: 4 }}>
								<Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
									{getTabLabel(tabValue)}
								</Typography>
								<Divider sx={{ borderColor: '#f1f5f9' }} />
							</Box>

							{renderContent()}
						</Paper>
					</Container>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Settings;
