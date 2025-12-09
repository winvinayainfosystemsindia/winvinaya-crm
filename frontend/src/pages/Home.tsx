import React from 'react';
import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import SystemStatus from '../components/dashboard/SystemStatus';

const Home: React.FC = () => {
	return (
		<Box>
			<Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#16191f' }}>
				Dashboard
			</Typography>

			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard title="Total Candidates" count="1,248" icon={<PeopleIcon fontSize="large" />} color="#1976d2" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard title="Active Interviews" count="45" icon={<WorkIcon fontSize="large" />} color="#ed6c02" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard title="Partner Companies" count="86" icon={<BusinessIcon fontSize="large" />} color="#2e7d32" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard title="Total Placements" count="312" icon={<CheckCircleIcon fontSize="large" />} color="#9c27b0" />
				</Grid>
			</Grid>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 8 }}>
					<RecentActivity />
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					<SystemStatus />
				</Grid>
			</Grid>
		</Box>
	);
};

export default Home;
