import React from 'react';
import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartCard from './ChartCard';
import type { AnalyticsData } from './types';

interface ReadinessChartProps {
	data: AnalyticsData['readiness'];
}

const ReadinessChart: React.FC<ReadinessChartProps> = ({ data }) => {
	const theme = useTheme();
	const labels = Object.keys(data);
	const values = Object.values(data);

	return (
		<ChartCard
			title="Candidate Readiness"
			subtitle="Key employability indicators (%)"
		>
			<BarChart
				layout="horizontal"
				xAxis={[{
					max: 100,
					label: 'Percentage',
					valueFormatter: (v: number) => `${v}%`
				}]}
				yAxis={[{
					scaleType: 'band',
					data: labels,
					tickLabelStyle: { fontSize: 11, fontWeight: 500, fill: theme.palette.text.primary }
				}]}
				series={[{
					data: values,
					color: theme.palette.success.light,
					valueFormatter: (v) => `${v}%`
				}]}
				borderRadius={4}
				margin={{ left: 120, right: 30 }}
				height={300}
				grid={{ vertical: true }}
			/>
		</ChartCard>
	);
};

export default ReadinessChart;
