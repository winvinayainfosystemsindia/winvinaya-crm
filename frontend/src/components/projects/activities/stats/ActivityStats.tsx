import React, { useState, useEffect } from 'react';
import { Grid, useTheme } from '@mui/material';
import {
	ListAlt as ActivityIcon,
	PendingActions as InProgressIcon,
	DoneAll as CompletedIcon,
	EventNote as PlannedIcon
} from '@mui/icons-material';
import StatCard from '../../../common/StatCard';
import dsrActivityService from '../../../../services/dsrActivityService';
import { DSRActivityStatusValues } from '../../../../models/dsr';

interface ActivityStatsProps {
	projectId: string;
	refreshKey?: number;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ projectId, refreshKey = 0 }) => {
	const theme = useTheme();
	const [stats, setStats] = useState({
		total: 0,
		inProgress: 0,
		completed: 0,
		planned: 0
	});

	useEffect(() => {
		const fetchStats = async () => {
			if (!projectId) return;
			try {
				const [totalRes, inProgressRes, completedRes, plannedRes] = await Promise.all([
					dsrActivityService.getActivities(0, 1, projectId),
					dsrActivityService.getActivities(0, 1, projectId, DSRActivityStatusValues.IN_PROGRESS),
					dsrActivityService.getActivities(0, 1, projectId, DSRActivityStatusValues.COMPLETED),
					dsrActivityService.getActivities(0, 1, projectId, DSRActivityStatusValues.PLANNED)
				]);

				setStats({
					total: totalRes.total,
					inProgress: inProgressRes.total,
					completed: completedRes.total,
					planned: plannedRes.total
				});
			} catch (error) {
				console.error('Failed to fetch activity stats', error);
			}
		};
		fetchStats();
	}, [projectId, refreshKey]);

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Total Activities"
					value={stats.total}
					icon={ActivityIcon}
					color={theme.palette.secondary.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Planned"
					value={stats.planned}
					icon={PlannedIcon}
					color="#545b64" // Muted gray
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="In Progress"
					value={stats.inProgress}
					icon={InProgressIcon}
					color={theme.palette.primary.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Completed"
					value={stats.completed}
					icon={CompletedIcon}
					color="#34a853" // Success green
				/>
			</Grid>
		</Grid>
	);
};

export default ActivityStats;
