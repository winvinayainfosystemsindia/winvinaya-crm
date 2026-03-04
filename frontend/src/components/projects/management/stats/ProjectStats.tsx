import React, { useState, useEffect } from 'react';
import { Grid, useTheme } from '@mui/material';
import {
	Assignment as ProjectIcon,
	CheckCircle as ActiveIcon,
	ListAlt as ActivityIcon,
	DoneAll as CompletedIcon
} from '@mui/icons-material';
import StatCard from '../../../common/StatCard';
import dsrProjectService from '../../../../services/dsrProjectService';
import dsrActivityService from '../../../../services/dsrActivityService';

interface ProjectStatsProps {
	refreshKey?: number;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ refreshKey = 0 }) => {
	const theme = useTheme();
	const [stats, setStats] = useState({
		totalProjects: 0,
		activeProjects: 0,
		totalActivities: 0,
		completedActivities: 0
	});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [projectsRes, activeProjectsRes, activitiesRes, completedActivitiesRes] = await Promise.all([
					dsrProjectService.getProjects(0, 1),
					dsrProjectService.getProjects(0, 1, true),
					dsrActivityService.getActivities(0, 1),
					dsrActivityService.getActivities(0, 1, undefined, 'completed')
				]);

				setStats({
					totalProjects: projectsRes.total,
					activeProjects: activeProjectsRes.total,
					totalActivities: activitiesRes.total,
					completedActivities: completedActivitiesRes.total
				});
			} catch (error) {
				console.error('Failed to fetch project stats', error);
			}
		};
		fetchStats();
	}, [refreshKey]);

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Total Projects"
					value={stats.totalProjects}
					icon={ProjectIcon}
					color={theme.palette.primary.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Active Projects"
					value={stats.activeProjects}
					icon={ActiveIcon}
					color="#34a853" // Success color
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Total Activities"
					value={stats.totalActivities}
					icon={ActivityIcon}
					color={theme.palette.secondary.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Completed Activities"
					value={stats.completedActivities}
					icon={CompletedIcon}
					color="#ea4335" // Error/Warning color
				/>
			</Grid>
		</Grid>
	);
};

export default ProjectStats;
