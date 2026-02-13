import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { People, Today, PieChart, Man, Woman, Transgender } from '@mui/icons-material';
import { SparkLineChart } from '@mui/x-charts';
import type { CandidateStats } from '../../../models/candidate';

interface CandidateStatCardsProps {
	stats: CandidateStats;
}

// Sparkline helper
const StatSparkLine = ({ color, data }: { color: string, data: number[] }) => (
	<Box sx={{ width: 100, height: 40 }}>
		<SparkLineChart
			data={data}
			height={40}
			// @ts-expect-error - The type definition might be lagging or 'colors' vs 'color' ambiguity
			colors={[color]}
			showHighlight={true}
			showTooltip={true}
		/>
	</Box>
);

const CandidateStatCards: React.FC<CandidateStatCardsProps> = ({ stats }) => {
	const theme = useTheme();

	const cardStyle = {
		height: '100%',
		border: '1px solid #d5dbdb',
		boxShadow: 'none',
		borderRadius: 0,
		'&:hover': {
			borderColor: theme.palette.primary.main,
			boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
		},
		transition: 'all 0.3s ease'
	};

	return (
		<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
			{/* Card 1: Total Candidates */}
			<Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
				<Card sx={cardStyle}>
					<CardContent>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Box>
								<Typography variant="subtitle2" color="textSecondary" fontWeight="bold">
									Total Candidates
								</Typography>
								<Typography variant="h3" sx={{ mt: 2, fontWeight: 300, color: theme.palette.primary.main }}>
									{(stats.total || 0).toLocaleString()}
								</Typography>
								<Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
									<StatSparkLine color={theme.palette.primary.light} data={stats.weekly.length > 0 ? stats.weekly : [0, 0, 0, 0, 0, 0, 0]} />
									<Typography variant="caption" color="success.main" sx={{ ml: 1, fontWeight: 'bold' }}>
										{stats.weekly[stats.weekly.length - 1] > 0 ? `+${stats.weekly[stats.weekly.length - 1]} today` : 'No new'}
									</Typography>
								</Box>
							</Box>
							<People sx={{ fontSize: 40, color: 'action.disabled' }} />
						</Box>
					</CardContent>
				</Card>
			</Box>

			{/* Card 2: Gender Distribution */}
			<Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
				<Card sx={cardStyle}>
					<CardContent>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Typography variant="subtitle2" color="textSecondary" fontWeight="bold">
								Gender Distribution
							</Typography>
							<PieChart sx={{ fontSize: 40, color: 'action.disabled' }} />
						</Box>

						<Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 1 }}>
							{/* Male */}
							<Box sx={{ textAlign: 'center' }}>
								<Man sx={{ color: '#1976d2', fontSize: 24 }} />
								<Typography variant="h4" sx={{ fontWeight: 300, color: '#1976d2', mb: 0.5 }}>
									{stats.male}
								</Typography>
								<Typography variant="caption" color="textSecondary" fontWeight="bold">
									MALE
								</Typography>
							</Box>

							{/* Divider */}
							<Box sx={{ width: '1px', height: '40px', bgcolor: '#e0e0e0', mb: 1 }} />

							{/* Female */}
							<Box sx={{ textAlign: 'center' }}>
								<Woman sx={{ color: '#9c27b0', fontSize: 24 }} />
								<Typography variant="h4" sx={{ fontWeight: 300, color: '#9c27b0', mb: 0.5 }}>
									{stats.female}
								</Typography>
								<Typography variant="caption" color="textSecondary" fontWeight="bold">
									FEMALE
								</Typography>
							</Box>

							{/* Divider */}
							<Box sx={{ width: '1px', height: '40px', bgcolor: '#e0e0e0', mb: 1 }} />

							{/* Other */}
							<Box sx={{ textAlign: 'center' }}>
								<Transgender sx={{ color: '#ed6c02', fontSize: 24 }} />
								<Typography variant="h4" sx={{ fontWeight: 300, color: '#ed6c02', mb: 0.5 }}>
									{stats.others}
								</Typography>
								<Typography variant="caption" color="textSecondary" fontWeight="bold">
									OTHER
								</Typography>
							</Box>
						</Box>
					</CardContent>
				</Card>
			</Box>

			{/* Card 3: Registered Today */}
			<Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
				<Card sx={cardStyle}>
					<CardContent>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Box>
								<Typography variant="subtitle2" color="textSecondary" fontWeight="bold">
									Registered Today
								</Typography>
								<Typography variant="h3" sx={{ mt: 2, fontWeight: 300, color: theme.palette.success.main }}>
									{(stats.today || 0).toLocaleString()}
								</Typography>
								<Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
									<StatSparkLine color={theme.palette.success.light} data={stats.weekly.length > 0 ? stats.weekly : [0, 0, 0, 0, 0, 0, 0]} />
									<Typography variant="caption" color="textSecondary" sx={{ ml: 1, fontWeight: 'bold' }}>
										Last 7 days
									</Typography>
								</Box>
							</Box>
							<Today sx={{ fontSize: 40, color: 'action.disabled' }} />
						</Box>
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
};

export default CandidateStatCards;
