import React from 'react';
import { Grid, Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import {
	MenuBook as CourseIcon,
	Person as HRIcon,
	Assignment as InterviewIcon,
	Schedule as TotalIcon,
	Badge as TrainerIcon
} from '@mui/icons-material';
import StatCard from '../../../common/StatCard';

interface WeeklyPlanStatsProps {
	hoursBreakdown: {
		course: number;
		hr_session: number;
		mock_interview: number;
		training_total: number;
		details: {
			course: Record<string, number>;
			hr_session: Record<string, number>;
			mock_interview: Record<string, number>;
			trainer: Record<string, number>;
		};
	};
}

const WeeklyPlanStats: React.FC<WeeklyPlanStatsProps> = ({ hoursBreakdown }) => {
	const formatHours = (hours: number) => {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		if (h === 0) return `${m}m`;
		if (m === 0) return `${h}h`;
		return `${h}h ${m}m`;
	};

	const stats = [
		{
			title: 'Total Training',
			value: formatHours(hoursBreakdown.training_total),
			icon: <TotalIcon />,
			color: '#4527a0'
		},
		{
			title: 'Courses',
			value: formatHours(hoursBreakdown.course),
			icon: <CourseIcon />,
			color: '#1976d2'
		},
		{
			title: 'HR Sessions',
			value: formatHours(hoursBreakdown.hr_session),
			icon: <HRIcon />,
			color: '#ed6c02'
		},
		{
			title: 'Mock Interviews',
			value: formatHours(hoursBreakdown.mock_interview),
			icon: <InterviewIcon />,
			color: '#2e7d32'
		}
	];

	const renderDetailTable = (title: string, data: Record<string, number>, icon: React.ReactNode, color: string) => {
		const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

		return (
			<Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: 'divider' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
					<Box sx={{ color, display: 'flex' }}>{icon}</Box>
					<Typography variant="subtitle1" fontWeight="600">{title}</Typography>
				</Box>
				{entries.length === 0 ? (
					<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
						No data for this week
					</Typography>
				) : (
					<Table size="small">
						<TableBody>
							{entries.map(([name, hours]) => (
								<TableRow key={name}>
									<TableCell sx={{ border: 'none', py: 0.5, pl: 0 }}>
										<Typography variant="body2">{name}</Typography>
									</TableCell>
									<TableCell align="right" sx={{ border: 'none', py: 0.5, pr: 0 }}>
										<Typography variant="body2" fontWeight="600">{formatHours(hours)}</Typography>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</Paper>
		);
	};

	return (
		<Box>
			<Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
				Training Hours Summary
			</Typography>

			<Grid container spacing={3} sx={{ mb: 4 }}>
				{stats.map((stat, index) => (
					<Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title={stat.title}
							value={stat.value}
							icon={stat.icon}
							color={stat.color}
						/>
					</Grid>
				))}
			</Grid>

			<Divider sx={{ mb: 4 }} />

			<Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
				Detailed Breakdown
			</Typography>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 4 }}>
					{renderDetailTable('Course Details', hoursBreakdown.details.course, <CourseIcon fontSize="small" />, '#1976d2')}
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					{renderDetailTable('HR Activities', hoursBreakdown.details.hr_session, <HRIcon fontSize="small" />, '#ed6c02')}
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					{renderDetailTable('Mock Interactions', hoursBreakdown.details.mock_interview, <InterviewIcon fontSize="small" />, '#2e7d32')}
				</Grid>

				<Grid size={{ xs: 12 }}>
					<Paper variant="outlined" sx={{ p: 2, borderColor: 'divider', bgcolor: 'grey.50' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
							<TrainerIcon sx={{ color: '#4527a0' }} />
							<Typography variant="subtitle1" fontWeight="600">Weekly Trainer Contributions</Typography>
						</Box>
						<TableContainer>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>Trainer Name</TableCell>
										<TableCell align="right">Total Hours (Training Only)</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{Object.entries(hoursBreakdown.details.trainer).length === 0 ? (
										<TableRow>
											<TableCell colSpan={2} align="center">
												<Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
													No trainers assigned to training activities this week
												</Typography>
											</TableCell>
										</TableRow>
									) : (
										Object.entries(hoursBreakdown.details.trainer)
											.sort((a, b) => b[1] - a[1])
											.map(([name, hours]) => (
												<TableRow key={name}>
													<TableCell>
														<Typography variant="body2" fontWeight="500">{name}</Typography>
													</TableCell>
													<TableCell align="right">
														<Typography variant="body2" fontWeight="700" color="primary.main">
															{formatHours(hours)}
														</Typography>
													</TableCell>
												</TableRow>
											))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default WeeklyPlanStats;
