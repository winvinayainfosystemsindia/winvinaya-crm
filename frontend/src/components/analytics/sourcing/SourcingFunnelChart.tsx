import React from 'react';
import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ChartCard from './ChartCard';
import type { AnalyticsData } from './types';

interface SourcingFunnelChartProps {
	data: AnalyticsData['funnel'];
}

const SourcingFunnelChart: React.FC<SourcingFunnelChartProps> = ({ data }) => {
	const theme = useTheme();

	const funnelSeries = [{
		data: [
			data.registered,
			data.profiled,
			data.counseled,
			data.selected,
			data.documents_collected
		],
		color: theme.palette.primary.main,
		// Gradient or pattern could be applied here if MUI X Charts supports it fully in this version,
		// but solid professional color is safer.
		label: 'Candidates'
	}];

	return (
		<ChartCard
			title="Sourcing Funnel"
			subtitle="Conversion from Registration to Document Collection"
		>
			<BarChart
				xAxis={[{
					scaleType: 'band',
					data: ['Registered', 'Profiled', 'Counseled', 'Selected', 'Collected'],
					tickLabelStyle: { fill: theme.palette.text.secondary, fontSize: 12 }
				}]}
				yAxis={[{
					label: 'Candidates',
					labelStyle: { fill: theme.palette.text.secondary }
				}]}
				series={funnelSeries}
				borderRadius={6}
				barLabel="value"
				hideLegend
				margin={{ bottom: 30, left: 50, right: 10, top: 10 }}
				height={300}
				grid={{ horizontal: true }}
			/>
		</ChartCard>
	);
};

export default SourcingFunnelChart;
