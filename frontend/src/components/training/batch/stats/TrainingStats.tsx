import React, { useEffect, memo } from 'react';
import { Box, Typography, Divider, Grid, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchTrainingStats } from '../../../../store/slices/trainingSlice';
import StatCard from '../../../common/stats/StatCard';
import {
	BatchPrediction,
	Group,
	PersonAdd,
	CheckCircleOutline,
	TrendingUp,
	CancelOutlined
} from '@mui/icons-material';

const StatItem = ({ label, value, color, icon, align = 'center' }: { label: string, value: number | string, color: string, icon?: React.ReactNode, align?: 'center' | 'left' }) => (
	<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: icon ? 1 : 0 }}>
		{icon && React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 16, color } })}
		<Box sx={{ textAlign: align }}>
			<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: align === 'center' ? 0.2 : 0 }}>
				{label}
			</Typography>
			<Typography variant="body2" sx={{ color: color, fontWeight: 700, fontSize: '0.9rem' }}>
				{value}
			</Typography>
		</Box>
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
					title="Batches Overview"
					value={stats.total ?? 0}
					icon={<BatchPrediction fontSize="small" />}
					color="#1976d2"
					sx={{ minHeight: 140 }}
				>
					<Divider sx={{ my: 1, opacity: 0.6 }} />
					<Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />}>
						<StatItem label="Running" value={stats.running ?? 0} color="#2e7d32" />
						<StatItem label="Planned" value={stats.planned ?? 0} color="#ed6c02" />
						<StatItem label="Closed" value={stats.completed ?? 0} color="#757575" />
					</Stack>
				</StatCard>
			</Grid>

			{/* Card 2: Candidates Pipeline */}
			<Grid size={{ xs: 12, md: 6, lg: 4 }}>
				<StatCard
					title="Total Selected Candidates"
					value={stats.total_selected ?? 0}
					icon={<Group />}
					color="#2e7d32"
					sx={{ minHeight: 140 }}
				>
					<Divider sx={{ my: 1, opacity: 0.6 }} />
					<Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />}>
						<StatItem 
							label="In Training" 
							value={stats.in_training ?? 0} 
							color="#1976d2" 
							icon={<TrendingUp />} 
							align="left"
						/>
						<StatItem 
							label="Ready" 
							value={stats.ready_for_training ?? 0} 
							color="#ed6c02" 
							icon={<PersonAdd />} 
							align="left"
						/>
					</Stack>
				</StatCard>
			</Grid>

			{/* Card 3: Training Outcomes */}
			<Grid size={{ xs: 12, md: 12, lg: 5 }}>
				<StatCard
					title="Training Outcomes"
					value={stats.completed_training ?? 0}
					icon={<CheckCircleOutline />}
					color="#00897b"
					sx={{ minHeight: 140 }}
				>
					<Divider sx={{ my: 1, opacity: 0.6 }} />
					<Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />}>
						<StatItem label="Completed" value={stats.completed_candidates ?? 0} color="#2e7d32" />
						<StatItem label="Placement" value={stats.moved_to_placement ?? 0} color="#1565c0" />
						<StatItem 
							label="Dropped" 
							value={stats.dropped_out ?? 0} 
							color="#d32f2f" 
							icon={<CancelOutlined />} 
							align="left"
						/>
					</Stack>
				</StatCard>
			</Grid>
		</Grid>
	);
});

TrainingStats.displayName = 'TrainingStats';

export default TrainingStats;
