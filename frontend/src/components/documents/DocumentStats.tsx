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
			<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Total to Collect"
						count={stats.docs_total?.toString() || '0'}
						icon={<DescriptionIcon fontSize="large" />}
						color="#1976d2"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Fully Collected"
						count={stats.docs_completed?.toString() || '0'}
						icon={<CheckCircleIcon fontSize="large" />}
						color="#2e7d32"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Pending Collection"
						count={stats.docs_pending?.toString() || '0'}
						icon={<PendingActionsIcon fontSize="large" />}
						color="#ed6c02"
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default DocumentStats;
