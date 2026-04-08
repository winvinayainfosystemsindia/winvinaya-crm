import React from 'react';
import {
	Grid,
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Divider,
	LinearProgress,
	Tooltip,
} from '@mui/material';
import {
	MenuBook as CourseIcon,
	Person as HRIcon,
	Assignment as InterviewIcon,
	Schedule as TotalIcon,
	Badge as TrainerIcon,
	Info as InfoIcon
} from '@mui/icons-material';
import StatCard from '../../../common/StatCard';

interface WeeklyPlanStatsProps {
	hoursBreakdown: {
		course: number;
		hr_session: number;
		mock_interview: number;
		training_total: number;
		unassigned_total: number;
		details: {
			course: Record<string, number>;
			hr_session: Record<string, number>;
			mock_interview: Record<string, number>;
			trainer: Record<string, { total: number; sessions: Record<string, { hours: number; type: string }> }>;
			unassigned: Record<string, { hours: number; type: string }>;
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
			title: 'Core Courses',
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
		},
		{
			title: 'Other Training',
			value: formatHours(hoursBreakdown.unassigned_total),
			icon: <InfoIcon />,
			color: '#545b64'
		}
	];

	const renderMetricTable = (title: string, data: Record<string, number>, icon: React.ReactNode, color: string) => {
		const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
		const maxHours = Math.max(...entries.map(([, h]) => h), 1);

		return (
			<Paper
				elevation={0}
				variant="outlined"
				sx={{
					p: 2.5,
					height: '100%',
					borderRadius: 2,
					borderColor: 'divider',
					bgcolor: 'background.paper',
					transition: 'all 0.2s',
					'&:hover': {
						borderColor: color,
						boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
					}
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
					<Box sx={{
						color: '#fff',
						bgcolor: color,
						p: 0.8,
						borderRadius: 1.5,
						display: 'flex',
						boxShadow: `0 2px 8px ${color}44`
					}}>
						{React.cloneElement(icon as React.ReactElement<any>, { fontSize: 'small' })}
					</Box>
					<Typography variant="subtitle1" fontWeight="700" color="text.primary">
						{title}
					</Typography>
				</Box>

				{entries.length === 0 ? (
					<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
						No records found for this category
					</Typography>
				) : (
					<Table size="small">
						<TableBody>
							{entries.map(([name, hours]) => {
								const percentage = (hours / maxHours) * 100;
								return (
									<TableRow key={name} sx={{ '&:last-child td': { border: 0 } }}>
										<TableCell sx={{ border: 'none', py: 1.2, pl: 0, width: '60%' }}>
											<Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
												{name}
											</Typography>
											<Tooltip title={`${Math.round(percentage)}% of max`} arrow placement="top">
												<LinearProgress
													variant="determinate"
													value={percentage}
													sx={{
														height: 4,
														borderRadius: 2,
														bgcolor: `${color}11`,
														'& .MuiLinearProgress-bar': {
															bgcolor: color,
															borderRadius: 2
														}
													}}
												/>
											</Tooltip>
										</TableCell>
										<TableCell align="right" sx={{ border: 'none', py: 1.2, pr: 0 }}>
											<Typography variant="body2" fontWeight="700" color="text.primary">
												{formatHours(hours)}
											</Typography>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</Paper>
		);
	};

	return (
		<Box sx={{ py: 1 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h5" fontWeight="600" sx={{ color: '#232f3e', mb: 1 }}>
					Training Performance Analytics
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Review hour allocations across trainers, courses, and session types for the current period.
				</Typography>
			</Box>

			<Grid container spacing={2} sx={{ mb: 5 }}>
				{stats.map((stat, index) => (
					<Grid key={index} size={{ xs: 12, sm: 6, md: 2.4 }}>
						<StatCard
							title={stat.title}
							value={stat.value}
							icon={stat.icon}
							color={stat.color}
							sx={{
								borderRadius: 2,
								boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
								minHeight: 110
							}}
						>
							{stat.title === 'Total Training' && (
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1.1, display: 'block' }}>
									Combined total of Courses, HR, Mock Interviews, Events, and Other activities.
								</Typography>
							)}
						</StatCard>
					</Grid>
				))}
			</Grid>

			<Divider sx={{ mb: 5 }} />

			<Typography variant="h6" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
				<Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
				Detailed Hours Breakdown
			</Typography>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 4 }}>
					{renderMetricTable('Course Distribution', hoursBreakdown.details.course, <CourseIcon />, '#1976d2')}
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					{renderMetricTable('HR Activity Volume', hoursBreakdown.details.hr_session, <HRIcon />, '#ed6c02')}
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					{renderMetricTable('Mock Interviews', hoursBreakdown.details.mock_interview, <InterviewIcon />, '#2e7d32')}
				</Grid>

				<Grid size={{ xs: 12, md: Object.entries(hoursBreakdown.details.unassigned).length > 0 ? 6 : 12 }}>
					<Paper
						elevation={0}
						variant="outlined"
						sx={{
							p: 3,
							borderColor: 'divider',
							bgcolor: 'rgba(240, 242, 245, 0.5)',
							borderRadius: 2,
							height: '100%'
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
							<Box sx={{ p: 1, bgcolor: '#4527a0', borderRadius: 2, color: '#fff', display: 'flex' }}>
								<TrainerIcon />
							</Box>
							<Typography variant="subtitle1" fontWeight="700">Trainer Contributions</Typography>
						</Box>

						{Object.entries(hoursBreakdown.details.trainer).length === 0 ? (
							<Box sx={{ textAlign: 'center', py: 4 }}>
								<Typography variant="body2" color="text.secondary">
									No trainer assignments detected in this period.
								</Typography>
							</Box>
						) : (
							<TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
								<Table size="small">
									<TableBody>
										{Object.entries(hoursBreakdown.details.trainer)
											.sort((a, b) => b[1].total - a[1].total)
											.map(([name, data]) => (
												<React.Fragment key={name}>
													<TableRow sx={{ bgcolor: 'rgba(69, 39, 160, 0.05)' }}>
														<TableCell sx={{ py: 1.5 }}>
															<Typography variant="body2" fontWeight="700" color="#4527a0">
																{name}
															</Typography>
														</TableCell>
														<TableCell align="right" sx={{ py: 1.5 }}>
															<Typography variant="body2" fontWeight="800" color="#4527a0">
																{formatHours(data.total)}
															</Typography>
														</TableCell>
													</TableRow>
													{Object.entries(data.sessions)
														.sort((a, b) => b[1].hours - a[1].hours)
														.map(([sessionName, sessionData]) => (
															<TableRow key={sessionName} sx={{ '&:last-child td': { borderBottom: '1px solid #eaeded' } }}>
																<TableCell sx={{ py: 1, pl: 4 }}>
																	<Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
																		{sessionName}
																	</Typography>
																	<Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8, textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 700 }}>
																		{sessionData.type.replace('_', ' ')}
																	</Typography>
																</TableCell>
																<TableCell align="right" sx={{ py: 1 }}>
																	<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
																		{formatHours(sessionData.hours)}
																	</Typography>
																</TableCell>
															</TableRow>
														))}
												</React.Fragment>
											))}
									</TableBody>
								</Table>
							</TableContainer>
						)}
					</Paper>
				</Grid>


				{Object.entries(hoursBreakdown.details.unassigned).length > 0 && (
					<Grid size={{ xs: 12, md: 6 }}>
						<Paper
							elevation={0}
							variant="outlined"
							sx={{
								p: 3,
								borderColor: 'divider',
								bgcolor: 'rgba(240, 242, 245, 0.4)',
								borderRadius: 2,
								height: '100%',
								borderLeft: '4px solid',
								borderLeftColor: 'text.secondary'
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', mb: 3 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
									<Box sx={{ p: 1, bgcolor: '#545b64', borderRadius: 2, color: '#fff', display: 'flex' }}>
										<InfoIcon />
									</Box>
									<Typography variant="subtitle1" fontWeight="700" color="text.primary">Additional Sessions</Typography>
								</Box>
								<Typography variant="caption" sx={{ bgcolor: 'rgba(0,0,0,0.08)', color: 'text.secondary', px: 1, borderRadius: 1, fontWeight: 700 }}>
									Independent
								</Typography>
							</Box>

							<TableContainer sx={{ maxHeight: 320, overflowY: 'auto' }}>
								<Table size="small">
									<TableBody>
										{Object.entries(hoursBreakdown.details.unassigned)
											.sort((a, b) => b[1].hours - a[1].hours)
											.map(([name, data]) => (
												<TableRow key={name} sx={{ '&:last-child td': { border: 0 } }}>
													<TableCell sx={{ py: 1.5 }}>
														<Typography variant="body2" fontWeight="600">{name}</Typography>
														<Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8, textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
															{data.type.replace('_', ' ')}
														</Typography>
													</TableCell>
													<TableCell align="right" sx={{ py: 1.5 }}>
														<Typography variant="body2" fontWeight="600" color="text.primary">
															{formatHours(data.hours)}
														</Typography>
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</TableContainer>
						</Paper>
					</Grid>
				)}
			</Grid>
		</Box>
	);
};

export default WeeklyPlanStats;
