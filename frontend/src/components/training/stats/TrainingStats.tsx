import React, { useEffect, memo } from 'react';
import { Box, Typography, Divider, Grid, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTrainingStats } from '../../../store/slices/trainingSlice';
import StatCard from '../../common/StatCard';
import {
	BatchPrediction,
	Group,
	PersonAdd,
	CheckCircleOutline,
	TrendingUp,
	CancelOutlined
} from '@mui/icons-material';

const StatItem = ({ label, value, color }: { label: string, value: number | string, color: string }) => (
	<Box sx={{ textAlign: 'center', flex: 1 }}>
		<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.2 }}>
			{label}
		</Typography>
		<Typography variant="body2" sx={{ color: color, fontWeight: 700, fontSize: '0.9rem' }}>
			{value}
		</Typography>
	</Box>
);

const TrainingStats: React.FC = memo(() => {
	const dispatch = useAppDispatch();
	const { stats } = useAppSelector((state) => state.training);

	useEffect(() => {
		dispatch(fetchTrainingStats());
	}, [dispatch]);

	if (!stats) return null;

	return (
		<Grid container spacing={3} sx={{ mb: 3 }}>
			{/* Card 1: Batch Overview */}
			<Grid size={{ xs: 12, md: 6, lg: 3 }}>
				<StatCard
					title="Batches"
					value={stats.total ?? 0}
					icon={<BatchPrediction fontSize="small" />}
					color="#1976d2"
					sx={{ minHeight: 140 }}
				>
					<Divider sx={{ my: 1, opacity: 0.6 }} />
					<Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />}>
						<StatItem label="Running" value={stats.running} color="#2e7d32" />
						<StatItem label="Planned" value={stats.planned} color="#ed6c02" />
						<StatItem label="Closed" value={stats.completed} color="#757575" />
					</Stack>
				</StatCard>
			</Grid>

			{/* Card 2: Candidates in Training */}
			<Grid size={{ xs: 12, md: 3, lg: 3 }}>
				<StatCard
					title="Currently Training"
					value={stats.in_training ?? 0}
					icon={<Group />}
					color="#2e7d32"
					sx={{ minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
				/>
			</Grid>

			{/* Card 3: Total Graduates */}
			<Grid size={{ xs: 12, md: 3, lg: 3 }}>
				<StatCard
					title="Total Graduates"
					value={stats.completed_training ?? 0}
					icon={<CheckCircleOutline />}
					color="#00897b"
					sx={{ minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
				/>
			</Grid>

			{/* Card 4: Candidates Pipeline */}
			<Grid size={{ xs: 12, md: 6, lg: 3 }}>
				<StatCard
					title="Pipeline"
					value={stats.ready_for_training + stats.dropped_out}
					icon={<TrendingUp fontSize="small" />}
					color="#ed6c02"
					sx={{ minHeight: 140 }}
				>
					<Divider sx={{ my: 1, opacity: 0.6 }} />
					<Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />}>
						<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
							<PersonAdd sx={{ fontSize: 16, color: '#2e7d32' }} />
							<Box sx={{ textAlign: 'left' }}>
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>Ready</Typography>
								<Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>{stats.ready_for_training}</Typography>
							</Box>
						</Box>
						<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
							<CancelOutlined sx={{ fontSize: 16, color: '#d32f2f' }} />
							<Box sx={{ textAlign: 'left' }}>
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>Dropped</Typography>
								<Typography variant="body2" sx={{ fontWeight: 700, color: '#d32f2f' }}>{stats.dropped_out}</Typography>
							</Box>
						</Box>
					</Stack>
				</StatCard>
			</Grid>
		</Grid>
	);
});

TrainingStats.displayName = 'TrainingStats';

export default TrainingStats;
