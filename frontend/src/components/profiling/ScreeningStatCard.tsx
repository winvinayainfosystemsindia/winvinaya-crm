import React, { useEffect } from 'react';
import { Box, CircularProgress, Alert, Stack, Chip, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateStats } from '../../store/slices/candidateSlice';
import StatCard from '../dashboard/StatCard';
import PeopleIcon from '@mui/icons-material/People';
import WcIcon from '@mui/icons-material/Wc';
import CheckCircle from '@mui/icons-material/CheckCircle';

const ScreeningStatCard: React.FC = () => {
	const dispatch = useAppDispatch();
	// Use statsLoading specifically to avoid flicker when list refreshes
	// @ts-ignore - statsLoading is added to slice but might not be picked up by TS immediately in editor
	const { stats, statsLoading, error } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		dispatch(fetchCandidateStats());
	}, [dispatch]);

	if (statsLoading) {
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
					title="Selected Candidates"
					count={stats.screening_distribution?.['Completed']?.toString() || '0'}
					icon={<CheckCircle fontSize="large" />}
					color="#4caf50"
				/>
			</Box>
			<Box sx={{ flex: '1 1 200px' }}>
				<StatCard
					title="Not Screened"
					count={stats.not_screened?.toString() || '0'}
					icon={<PeopleIcon fontSize="large" />}
					color="#ed6c02"
				/>
			</Box>

			{/* Status Breakdown */}
			{stats.screening_distribution && Object.keys(stats.screening_distribution).length > 0 && (
				<Box sx={{ width: '100%', mt: 2 }}>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Screening Status Breakdown
					</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
						{Object.entries(stats.screening_distribution).map(([status, count]) => (
							<Chip
								key={status}
								label={`${status}: ${count}`}
								size="small"
								sx={{
									bgcolor: '#f5f5f5',
									fontWeight: 500,
									border: '1px solid #e0e0e0'
								}}
							/>
						))}
					</Stack>
				</Box>
			)}
		</Box>
	);
};

export default ScreeningStatCard;
