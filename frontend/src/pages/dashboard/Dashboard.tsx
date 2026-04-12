import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StatCard from '../../components/common/StatCard';
import RegistrationLinkModal from '../../components/dashboard/RegistrationLinkModal';
import BIReport from '../../components/dashboard/BIReport';
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
		candidates_not_submitted: 0
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
						title="Active Interviews"
						count="0"
						subtitle="Ongoing recruitment drives"
						icon={<WorkIcon />}
						color="#ed6c02"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Partner Companies"
						count="0"
						subtitle="Registered corporate partners"
						icon={<BusinessIcon />}
						color="#2e7d32"
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Total Placements"
						count="0"
						subtitle="Successfully placed"
						icon={<CheckCircleIcon />}
						color="#9c27b0"
					/>
				</Grid>
			</Grid>


			<BIReport />
		</Box>
	);
};

export default Dashboard;
