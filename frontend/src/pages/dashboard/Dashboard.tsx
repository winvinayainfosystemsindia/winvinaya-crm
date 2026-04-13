import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StatCard from '../../components/common/StatCard';
import RegistrationLinkModal from '../../components/dashboard/RegistrationLinkModal';
import BIReport from '../../components/dashboard/BIReport';
import ApiSpeedometer from '../../components/dashboard/ApiSpeedometer';
import SystemHealthMonitor from '../../components/dashboard/SystemHealthMonitor';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateStats } from '../../store/slices/candidateSlice';

const Dashboard: React.FC = () => {
	const dispatch = useAppDispatch();
	const { stats } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		dispatch(fetchCandidateStats());
	}, [dispatch]);

	const defaultStats = {
		total: 0,
		male: 0,
		female: 0,
		others: 0,
		today: 0,
		weekly: [],
		screened: 0,
		not_screened: 0,
		total_counseled: 0,
		counseling_pending: 0,
		counseling_selected: 0,
		counseling_rejected: 0,
		docs_total: 0,
		docs_completed: 0,
		docs_pending: 0,
		files_collected: 0,
		files_to_collect: 0,
		candidates_fully_submitted: 0,
		candidates_partially_submitted: 0,
		candidates_not_submitted: 0,
		in_training: 0,
		moved_to_placement: 0,
		got_job: 0
	};

	const currentStats = stats || defaultStats;

	return (
		<Box component="main" sx={{ p: { xs: 1, sm: 0 } }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#16191f' }}>
					Dashboard
				</Typography>
				<RegistrationLinkModal />
			</Box>

			<Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Total Candidates"
						count={(currentStats.total || 0).toLocaleString()}
						subtitle="Total registered candidates"
						icon={<PeopleIcon />}
						color="#1976d2"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="In Training"
						count={(currentStats.in_training || 0).toLocaleString()}
						subtitle="Candidates currently in batches"
						icon={<SchoolIcon />}
						color="#ed6c02"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Moved to Placement"
						count={(currentStats.moved_to_placement || 0).toLocaleString()}
						subtitle="Candidates in pipeline"
						icon={<TrendingUpIcon />}
						color="#2e7d32"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Got Job"
						count={(currentStats.got_job || 0).toLocaleString()}
						subtitle="Successfully placed"
						icon={<CheckCircleIcon />}
						color="#9c27b0"
					/>
				</Grid>
			</Grid>


			<Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
				<Grid size={{ xs: 12, lg: 9 }}>
					<BIReport />
				</Grid>
				<Grid size={{ xs: 12, lg: 3 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
						<ApiSpeedometer />
						<SystemHealthMonitor />
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Dashboard;
