import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import ChartCard from './ChartCard';
import type { AnalyticsData } from './types';

interface DemographicsChartsProps {
	data: AnalyticsData['demographics'];
}

const DemographicsCharts: React.FC<DemographicsChartsProps> = ({ data }) => {
	const theme = useTheme();

	const genderData = Object.entries(data.gender).map(([label, value], id) => ({
		id, value, label,
		color: id === 0 ? theme.palette.primary.main : (id === 1 ? theme.palette.secondary.main : theme.palette.warning.main)
	}));

	const disabilityData = Object.entries(data.disability).map(([label, value], id) => ({
		id, value, label,
		// Generate colors dynamically or map a palette
		color: [
			'#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'
		][id % 5]
	}));

	return (
		<ChartCard
			title="Demographics"
			subtitle="Breakdown by Gender and Disability"
			sx={{ minHeight: 400 }}
		>
			<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, height: '100%' }}>

				{/* Gender Section */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Gender Distribution</Typography>
					<Box sx={{ width: '100%', height: 200 }}>
						<PieChart
							series={[{
								data: genderData,
								innerRadius: 60,
								paddingAngle: 2,
								cornerRadius: 4,
								cx: '50%', cy: '50%'
							}]}
							hideLegend
						/>
					</Box>
					<Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
						{genderData.map((d) => (
							<Box key={d.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
								<Typography variant="caption" color="text.secondary">{d.label}: <b>{d.value}</b></Typography>
							</Box>
						))}
					</Box>
				</Box>

				{/* Divider (Visual only, via spacing) */}

				{/* Disability Section */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Disability Types</Typography>
					<Box sx={{ width: '100%', height: 200 }}>
						<PieChart
							series={[{
								data: disabilityData,
								innerRadius: 0,
								paddingAngle: 1,
								cornerRadius: 4,
								cx: '50%', cy: '50%'
							}]}
							hideLegend
						/>
					</Box>
					<Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
						{disabilityData.map((d) => (
							<Box key={d.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
								<Typography variant="caption" color="text.secondary">{d.label}: <b>{d.value}</b></Typography>
							</Box>
						))}
					</Box>
				</Box>

			</Box>
		</ChartCard>
	);
};

export default DemographicsCharts;
