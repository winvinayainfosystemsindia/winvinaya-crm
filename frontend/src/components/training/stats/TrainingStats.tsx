import React, { useEffect, memo } from 'react';
import { Box } from '@mui/material';
import StatCard from '../../dashboard/StatCard';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTrainingStats } from '../../../store/slices/trainingSlice';
import { BatchPrediction, PlayArrow, DoneAll, EventNote } from '@mui/icons-material';

const TrainingStats: React.FC = memo(() => {
	const dispatch = useAppDispatch();
	const { stats } = useAppSelector((state) => state.training);

	useEffect(() => {
		dispatch(fetchTrainingStats());
	}, [dispatch]);

	if (!stats) return null;

	return (
		<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Total Batches"
					count={stats.total?.toString() ?? '0'}
					icon={<BatchPrediction fontSize="large" />}
					color="#1976d2"
				/>
			</Box>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Planned"
					count={stats.planned?.toString() ?? '0'}
					icon={<EventNote fontSize="large" />}
					color="#ed6c02"
				/>
			</Box>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Running"
					count={stats.running?.toString() ?? '0'}
					icon={<PlayArrow fontSize="large" />}
					color="#2e7d32"
				/>
			</Box>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Closed"
					count={stats.closed?.toString() ?? '0'}
					icon={<DoneAll fontSize="large" />}
					color="#d32f2f"
				/>
			</Box>
		</Box>
	);
});

TrainingStats.displayName = 'TrainingStats';

export default TrainingStats;
