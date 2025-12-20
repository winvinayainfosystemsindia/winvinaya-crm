import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { Refresh as RefreshIcon, Download as DownloadIcon } from '@mui/icons-material';

import api from '../../services/api';
import type { AnalyticsData } from '../../components/analytics/sourcing/types';

import KpiStats from '../../components/analytics/sourcing/KpiStats';
import SourcingFunnelChart from '../../components/analytics/sourcing/SourcingFunnelChart';
import GeographicDistributionChart from '../../components/analytics/sourcing/GeographicDistributionChart';
import DemographicsCharts from '../../components/analytics/sourcing/DemographicsCharts';
import ReadinessChart from '../../components/analytics/sourcing/ReadinessChart';
import RegistrationTrendChart from '../../components/analytics/sourcing/RegistrationTrendChart';

const SourcingAnalytics: React.FC = () => {
	// const theme = useTheme();
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const response = await api.get('/analytics/sourcing-overview');
			setData(response.data);
			setError(null);
		} catch (err) {
			console.error('Failed to fetch analytics:', err);
			setError('Failed to load analytics data.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading && !data) return (
		<Box sx={{ display: 'flex', justifyContent: 'center', height: '80vh', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
			<CircularProgress size={40} thickness={4} />
			<Typography variant="body2" color="text.secondary">Loading Analytics...</Typography>
		</Box>
	);

	if (error || !data) return (
		<Box sx={{ p: 4 }}>
			<Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>}>
				{error || 'No data available'}
			</Alert>
		</Box>
	);

	return (
		<Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 4 }}>

			{/* Header Section */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
				<Box>
					<Typography variant="h4"
						component="h1"
						sx={{
							fontWeight: 300,
							color: 'text.primary',
							mb: 0.5
						}}
					>
						Sourcing Analytics
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Real-time insights into candidate sourcing, conversion, and pipeline health.
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button
						variant="outlined"
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
						onClick={fetchData}
						disabled={loading}
						sx={{ textTransform: 'none' }}
					>
						{loading ? 'Refreshing...' : 'Refresh'}
					</Button>
					<Button variant="contained" startIcon={<DownloadIcon />} disabled sx={{ textTransform: 'none' }}>
						Export Report
					</Button>
				</Box>
			</Box>

			{/* 1. Key Performance Indicators */}
			<KpiStats data={data.metrics} />

			{/* 2. Pipeline & Geography Row */}
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
				<Box sx={{ flex: '2 1 600px', minWidth: 300 }}>
					<SourcingFunnelChart data={data.funnel} />
				</Box>
				<Box sx={{ flex: '1 1 350px', minWidth: 300 }}>
					<GeographicDistributionChart data={data.geography} />
				</Box>
			</Box>

			{/* 3. Detailed Demographics */}
			<Box sx={{ width: '100%' }}>
				<DemographicsCharts data={data.demographics} />
			</Box>

			{/* 4. Readiness & Trends Row */}
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
				<Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
					<ReadinessChart data={data.readiness} />
				</Box>
				<Box sx={{ flex: '2 1 500px', minWidth: 300 }}>
					<RegistrationTrendChart data={data.trend} />
				</Box>
			</Box>

		</Box>
	);
};

export default SourcingAnalytics;
