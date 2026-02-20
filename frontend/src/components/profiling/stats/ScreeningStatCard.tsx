import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import StatCard from '../../dashboard/StatCard';
import PeopleIcon from '@mui/icons-material/People';
import WcIcon from '@mui/icons-material/Wc';
import CheckCircle from '@mui/icons-material/CheckCircle';

const ScreeningStatCard: React.FC = () => {
	// Use statsLoading specifically to avoid flicker when list refreshes
	// @ts-ignore - statsLoading is added to slice but might not be picked up by TS immediately in editor
	const { stats, statsLoading, error } = useAppSelector((state) => state.candidates);


	if (statsLoading && !stats) {
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
		<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', opacity: statsLoading ? 0.7 : 1, transition: 'opacity 0.2s' }}>
			<Box sx={{ flex: '1 1 200px' }}>
				<StatCard
					title="Total Candidates"
					count={stats.total.toString()}
					icon={<PeopleIcon fontSize="large" />}
					color="#1976d2"
				/>
			</Box>
			<Box sx={{ flex: '1 1 200px' }}>
				<StatCard
					title="Screened Candidates"
					count={stats.screened?.toString() || '0'}
					icon={<WcIcon fontSize="large" />}
					color="#2e7d32"
				/>
			</Box>
			<Box sx={{ flex: '1 1 200px' }}>
				<StatCard
					title="Selected For Counseling"
					count={stats.screening_distribution?.['Completed']?.toString() || '0'}
					icon={<CheckCircle fontSize="large" />}
					color="#4caf50"
				/>
			</Box>
			<Box sx={{ flex: '1 1 200px' }}>
				<StatCard
					title="Yet To Be Screened"
					count={stats.not_screened?.toString() || '0'}
					icon={<PeopleIcon fontSize="large" />}
					color="#ed6c02"
				/>
			</Box>
		</Box>
	);
};

export default ScreeningStatCard;
