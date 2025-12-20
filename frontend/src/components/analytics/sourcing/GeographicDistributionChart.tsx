import React from 'react';
import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartCard from './ChartCard';
import type { AnalyticsData } from './types';

interface GeographicDistributionChartProps {
	data: AnalyticsData['geography'];
}

const GeographicDistributionChart: React.FC<GeographicDistributionChartProps> = ({ data }) => {
	const theme = useTheme();

	// Sort logic handled in backend but ensuring order here if needed
	const cityLabels = Object.keys(data);
	const cityValues = Object.values(data);

	return (
		<ChartCard
			title="Top Locations"
			subtitle="Candidate distribution by City"
		>
			<BarChart
				layout="horizontal"
				yAxis={[{
					scaleType: 'band',
					data: cityLabels,
					tickLabelStyle: { fontSize: 11, fontWeight: 500, fill: theme.palette.text.primary }
				}]}
				xAxis={[{ label: 'Candidates' }]}
				series={[{
					data: cityValues,
					color: theme.palette.secondary.main,
					valueFormatter: (v) => v?.toString() ?? ''
				}]}
				borderRadius={4}
				margin={{ left: 100, right: 20 }} // Space for city names
				height={300}
				grid={{ vertical: true }}
			/>
		</ChartCard>
	);
};

export default GeographicDistributionChart;
