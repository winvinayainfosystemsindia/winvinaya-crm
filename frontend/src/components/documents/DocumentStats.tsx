import React, { useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateStats } from '../../store/slices/candidateSlice';
import StatCard from '../dashboard/StatCard';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const DocumentStats: React.FC = () => {
	const dispatch = useAppDispatch();
	const { stats, loading, error } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		dispatch(fetchCandidateStats());
	}, [dispatch]);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
				<CircularProgress size={24} />
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
		<Box sx={{ mb: 4 }}>
			<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
				<StatCard
					title="Files Collected"
					count={stats.files_collected?.toString() || '0'}
					subtitle={`Yet to collect: ${(stats.files_to_collect || 0) - (stats.files_collected || 0)}`}
					icon={<DescriptionIcon fontSize="large" />}
					color="#1976d2"
				/>
				<StatCard
					title="Fully Submitted"
					count={stats.candidates_fully_submitted?.toString() || '0'}
					subtitle="Candidates with all docs"
					icon={<CheckCircleIcon fontSize="large" />}
					color="#2e7d32"
				/>
				<StatCard
					title="Partially Submitted"
					count={stats.candidates_partially_submitted?.toString() || '0'}
					subtitle="Candidates with some docs"
					icon={<PendingActionsIcon fontSize="large" />}
					color="#ed6c02"
				/>
				<StatCard
					title="Not Submitted"
					count={stats.candidates_not_submitted?.toString() || '0'}
					subtitle="Candidates with 0 docs"
					icon={<DescriptionIcon fontSize="large" />}
					color="#d32f2f"
				/>
			</Box>
		</Box>
	);
};

export default DocumentStats;
