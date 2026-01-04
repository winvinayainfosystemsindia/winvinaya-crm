import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import SystemStatus from '../components/dashboard/SystemStatus';
import RegistrationLinkModal from '../components/dashboard/RegistrationLinkModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCandidates } from '../store/slices/candidateSlice';

const Home: React.FC = () => {
	const dispatch = useAppDispatch();
	const { list: candidates } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		dispatch(fetchCandidates());
	}, [dispatch]);

	return (
		<Box component="main" sx={{ p: { xs: 1, sm: 0 } }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#16191f' }}>
					Dashboard
				</Typography>
				<RegistrationLinkModal />
			</Box>


			<Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Total Candidates"
						count={(candidates?.length || 0).toLocaleString()}
						icon={<PeopleIcon fontSize="large" />}
						color="#1976d2"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard title="Active Interviews" count="0" icon={<WorkIcon fontSize="large" />} color="#ed6c02" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard title="Partner Companies" count="0" icon={<BusinessIcon fontSize="large" />} color="#2e7d32" />
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard title="Total Placements" count="0" icon={<CheckCircleIcon fontSize="large" />} color="#9c27b0" />
				</Grid>
			</Grid>

			<Grid container spacing={{ xs: 2, sm: 3 }}>
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
