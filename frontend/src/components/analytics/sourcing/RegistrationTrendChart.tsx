import React from 'react';
import { useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import ChartCard from './ChartCard';
import type { AnalyticsData } from './types';

interface RegistrationTrendChartProps {
	data: AnalyticsData['trend'];
}

const RegistrationTrendChart: React.FC<RegistrationTrendChartProps> = ({ data }) => {
	const theme = useTheme();
	const dates = Object.keys(data);
	const values = Object.values(data);

	return (
		<ChartCard
			title="Registration Trends"
			subtitle="New candidates over time"
		>
			<LineChart
				xAxis={[{
					scaleType: 'point',
					data: dates,
					tickLabelStyle: { fontSize: 10, angle: 45, textAnchor: 'start' }
				}]}
				yAxis={[{
					label: 'Registrations'
				}]}
				series={[{
					data: values,
					area: true,
					color: theme.palette.primary.light,
					showMark: true,
					curve: 'catmullRom' // Smooth curve for professional feel
				}]}
				grid={{ vertical: true, horizontal: true }}
				margin={{ bottom: 70, left: 40, right: 10 }} // Extra bottom margin for rotated date labels
				height={350}
			/>
		</ChartCard>
	);
};

export default RegistrationTrendChart;
