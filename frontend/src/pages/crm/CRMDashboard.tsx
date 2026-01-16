import React from 'react';
import { Box, Grid, Typography, Paper, Stack, Container } from '@mui/material';
import CRMPageHeader from '../../components/crm/common/CRMPageHeader';
import CRMStatsCard from '../../components/crm/common/CRMStatsCard';
import { useAppSelector } from '../../store/hooks';

const CRMDashboard: React.FC = () => {
	const { stats: companyStats } = useAppSelector((state) => state.companies);
	const { stats: leadStats } = useAppSelector((state) => state.leads);
	const { pipeline } = useAppSelector((state) => state.deals);

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
				<CRMPageHeader
					title="CRM Dashboard"
				/>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 4 }}>
						<CRMStatsCard
							label="Active Companies"
							value={companyStats?.total || 0}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<CRMStatsCard
							label="Pipeline Leads"
							value={leadStats?.total || 0}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<CRMStatsCard
							label="Pipeline Value"
							value={`₹${(pipeline?.total_value || 0).toLocaleString()}`}
						/>
					</Grid>

					<Grid size={{ xs: 12, md: 8 }}>
						<Paper sx={{ p: 3, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Stack spacing={2} alignItems="center">
								<Typography variant="h6" color="text.secondary">Sales Pipeline Chart</Typography>
								<Typography variant="body2" color="text.disabled">Chart visualization will be implemented in the next phase.</Typography>
							</Stack>
						</Paper>
					</Grid>

					<Grid size={{ xs: 12, md: 4 }}>
						<Paper sx={{ p: 3, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Stack spacing={2} alignItems="center">
								<Typography variant="h6" color="text.secondary">Recent Activities</Typography>
								<Typography variant="body2" color="text.disabled">Activity feed will be implemented in the next phase.</Typography>
							</Stack>
						</Paper>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default CRMDashboard;
