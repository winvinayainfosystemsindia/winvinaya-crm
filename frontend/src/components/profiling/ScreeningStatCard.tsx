import React, { useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateStats } from '../../store/slices/candidateSlice';
import StatCard from '../dashboard/StatCard';
import PeopleIcon from '@mui/icons-material/People';
import WcIcon from '@mui/icons-material/Wc';

const ScreeningStatCard: React.FC = () => {
	const dispatch = useAppDispatch();
	const { stats, loading, error } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		dispatch(fetchCandidateStats());
	}, [dispatch]);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ mb: 3 }}>
				{error}
			</Alert>
		);
	}

	if (!stats) {
		return null;
	}

	return (
		<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Total Candidates"
					count={stats.total.toString()}
					icon={<PeopleIcon fontSize="large" />}
					color="#1976d2"
				/>
			</Box>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Screened Candidates"
					count={stats.screened?.toString() || '0'}
					icon={<WcIcon fontSize="large" />}
					color="#2e7d32"
				/>
			</Box>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Not Screened"
					count={stats.not_screened?.toString() || '0'}
					icon={<PeopleIcon fontSize="large" />}
					color="#ed6c02"
				/>
			</Box>
		</Box>
	);
};

export default ScreeningStatCard;
