import React, { useEffect } from 'react';
import {
	Typography,
	Paper,
	Box,
	Chip,
	LinearProgress,
	Grid,
	Tooltip,
	IconButton,
	Divider,
	Stack
} from '@mui/material';
import {
	CheckCircle as CheckCircleIcon,
	Warning as WarningIcon,
	ErrorOutline as ErrorIcon,
	Refresh as RefreshIcon,
	Storage as StorageIcon,
	Cloud as CloudIcon,
	Speed as SpeedIcon,
	Memory as MemoryIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchHealthStatus } from '../../store/slices/healthSlice';

const SystemStatus: React.FC = () => {
	const dispatch = useAppDispatch();
	const { health, loading } = useAppSelector((state) => state.health);

	useEffect(() => {
		// Initial fetch
		dispatch(fetchHealthStatus());

		// Auto-refresh every 2 minutes
		const interval = setInterval(() => {
			dispatch(fetchHealthStatus());
		}, 120000);

		return () => clearInterval(interval);
	}, [dispatch]);

	const handleRefresh = () => {
		dispatch(fetchHealthStatus());
	};

	const getStatusColor = (status: 'operational' | 'degraded' | 'down') => {
		switch (status) {
			case 'operational':
				return '#067F68'; // AWS green
			case 'degraded':
				return '#FF9900'; // AWS orange
			case 'down':
				return '#D13212'; // AWS red
			default:
				return '#545B64';
		}
	};

	const getStatusIcon = (status: 'operational' | 'degraded' | 'down') => {
		const color = getStatusColor(status);
		switch (status) {
			case 'operational':
				return <CheckCircleIcon fontSize="small" sx={{ color }} />;
			case 'degraded':
				return <WarningIcon fontSize="small" sx={{ color }} />;
			case 'down':
				return <ErrorIcon fontSize="small" sx={{ color }} />;
		}
	};

	const getOverallStatusColor = () => {
		if (!health) return '#545B64';
		switch (health.overall) {
			case 'healthy':
				return '#067F68';
			case 'degraded':
				return '#FF9900';
			case 'critical':
				return '#D13212';
		}
	};

	const formatUptime = (uptime?: number) => {
		if (uptime === undefined) return 'N/A';
		return `${uptime.toFixed(2)}%`;
	};

	const formatResponseTime = (time?: number) => {
		if (time === undefined) return 'N/A';
		return `${time}ms`;
	};

	const getTimeSinceLastCheck = () => {
		if (!health?.lastCheck) return 'Never';
		const diff = Date.now() - new Date(health.lastCheck).getTime();
		const minutes = Math.floor(diff / 60000);
		const seconds = Math.floor((diff % 60000) / 1000);

		if (minutes > 0) {
			return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
		}
		return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
	};

	const getIconForMetric = (metricName: string) => {
		switch (metricName) {
			case 'API Server':
				return <CloudIcon fontSize="small" />;
			case 'Database':
				return <StorageIcon fontSize="small" />;
			case 'Cache Layer':
				return <SpeedIcon fontSize="small" />;
			case 'Memory Usage':
				return <MemoryIcon fontSize="small" />;
			default:
				return <CloudIcon fontSize="small" />;
		}
	};

	if (!health) {
		return (
			<Paper
				elevation={0}
				sx={{
					height: '100%',
					background: '#FFFFFF',
					border: '1px solid #D5DBDB',
					borderRadius: '8px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					p: 3,
				}}
			>
				<Typography color="text.secondary">Loading system status...</Typography>
			</Paper>
		);
	}

	return (
		<Paper
			component="section"
			aria-labelledby="system-status-title"
			elevation={0}
			sx={{
				height: '100%',
				maxHeight: '480px', // Match RecentActivity height
				background: '#FFFFFF',
				border: '1px solid #D5DBDB',
				borderRadius: '8px',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* AWS-style Header */}
			<Box
				sx={{
					px: 3,
					py: 2,
					background: '#FAFAFA',
					borderBottom: '1px solid #D5DBDB',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexShrink: 0,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						component="span"
						sx={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							bgcolor: getOverallStatusColor(),
							flexShrink: 0,
						}}
						aria-hidden="true"
					/>
					<Typography
						variant="h6"
						id="system-status-title"
						component="h2"
						sx={{
							fontWeight: 700,
							fontSize: '18px',
							color: '#16191F',
							letterSpacing: '-0.01em',
						}}
					>
						System Status
					</Typography>
				</Box>

				<Tooltip title="Refresh status">
					<span>
						<IconButton
							size="small"
							onClick={handleRefresh}
							disabled={loading}
							sx={{
								color: '#545B64',
								'&:hover': {
									bgcolor: '#EAEDED',
								},
								'&.Mui-disabled': {
									color: '#AAB7B8',
								},
							}}
						>
							<RefreshIcon fontSize="small" />
						</IconButton>
					</span>
				</Tooltip>
			</Box>

			{/* Content - Scrollable */}
			<Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
				{/* Status Badge */}
				<Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
					<Chip
						label={health.overall === 'healthy' ? 'All Systems Operational' : 'System Issues Detected'}
						sx={{
							bgcolor: health.overall === 'healthy' ? '#E6F2F0' : '#FFF4E5',
							color: getOverallStatusColor(),
							fontWeight: 700,
							fontSize: '12px',
							height: '24px',
							border: `1px solid ${getOverallStatusColor()}`,
							'& .MuiChip-label': {
								px: 1.5,
							},
						}}
					/>
					{health.environment && (
						<>
							<Chip
								label={`v${health.apiVersion || 'N/A'}`}
								size="small"
								sx={{
									bgcolor: '#F2F3F3',
									color: '#545B64',
									fontSize: '11px',
									height: '22px',
									fontWeight: 600,
								}}
							/>
							<Chip
								label={health.environment}
								size="small"
								sx={{
									bgcolor: '#F2F3F3',
									color: '#545B64',
									fontSize: '11px',
									height: '22px',
									fontWeight: 600,
									textTransform: 'capitalize',
								}}
							/>
						</>
					)}
				</Box>

				{/* System Metrics */}
				<Stack spacing={2.5}>
					{health.metrics.map((metric, index) => (
						<Box key={index}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<Box
										sx={{
											color: '#545B64',
											display: 'flex',
											alignItems: 'center',
											bgcolor: '#F2F3F3',
											p: 0.75,
											borderRadius: '4px',
										}}
									>
										{getIconForMetric(metric.name)}
									</Box>
									<Typography
										variant="body2"
										sx={{
											fontWeight: 600,
											color: '#16191F',
											fontSize: '14px',
										}}
									>
										{metric.name}
									</Typography>
								</Box>
								{getStatusIcon(metric.status)}
							</Box>

							<Grid container spacing={2} sx={{ pl: 5 }}>
								{metric.responseTime !== undefined && (
									<Grid size={{ xs: 6 }}>
										<Typography
											variant="caption"
											sx={{
												color: '#545B64',
												fontSize: '12px',
												display: 'block',
											}}
										>
											Response
										</Typography>
										<Typography
											variant="body2"
											sx={{
												color: '#16191F',
												fontWeight: 600,
												fontSize: '13px',
												fontFamily: 'Monaco, Consolas, monospace',
											}}
										>
											{formatResponseTime(metric.responseTime)}
										</Typography>
									</Grid>
								)}
								<Grid size={{ xs: 6 }}>
									<Typography
										variant="caption"
										sx={{
											color: '#545B64',
											fontSize: '12px',
											display: 'block',
										}}
									>
										{metric.name === 'Memory Usage' ? 'Usage' : 'Uptime'}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: '#16191F',
											fontWeight: 600,
											fontSize: '13px',
											fontFamily: 'Monaco, Consolas, monospace',
										}}
									>
										{formatUptime(metric.uptime)}
									</Typography>
								</Grid>
							</Grid>

							{metric.name === 'Memory Usage' && metric.uptime && (
								<LinearProgress
									variant="determinate"
									value={metric.uptime}
									sx={{
										mt: 1.5,
										ml: 5,
										height: 6,
										borderRadius: 3,
										bgcolor: '#EAEDED',
										'& .MuiLinearProgress-bar': {
											borderRadius: 3,
											bgcolor: metric.uptime > 80 ? '#FF9900' : '#067F68',
										},
									}}
								/>
							)}

							{index < health.metrics.length - 1 && (
								<Divider sx={{ mt: 2.5, borderColor: '#EAEDED' }} />
							)}
						</Box>
					))}
				</Stack>

				{/* Footer */}
				<Box
					sx={{
						mt: 3,
						pt: 2.5,
						borderTop: '1px solid #EAEDED',
					}}
				>
					<Typography
						variant="caption"
						sx={{
							color: '#545B64',
							fontSize: '12px',
							display: 'block',
							textAlign: 'center',
						}}
					>
						Last updated: {getTimeSinceLastCheck()}
					</Typography>
				</Box>
			</Box>
		</Paper>
	);
};

export default SystemStatus;
