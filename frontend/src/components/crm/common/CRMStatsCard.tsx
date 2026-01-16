import React from 'react';
import { Paper, Box, Typography, Stack, Skeleton } from '@mui/material';

interface CRMStatsCardProps {
	label: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: {
		value: string | number;
		isPositive: boolean;
	};
	loading?: boolean;
}

const CRMStatsCard: React.FC<CRMStatsCardProps> = ({ label, value, icon, trend, loading }) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				borderLeft: '5px solid #ff9900',
				borderRadius: '4px',
				boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center'
			}}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
				<Box>
					<Typography
						variant="overline"
						sx={{
							color: 'text.secondary',
							fontWeight: 'bold',
							display: 'block',
							lineHeight: 1.2,
							mb: 1
						}}
					>
						{label}
					</Typography>

					{loading ? (
						<Skeleton width={80} height={40} />
					) : (
						<Typography
							variant="h4"
							sx={{
								fontWeight: 'bold',
								color: '#232f3e'
							}}
						>
							{value}
						</Typography>
					)}
				</Box>

				{icon && (
					<Box sx={{
						color: '#ff9900',
						p: 1.5,
						borderRadius: '50%',
						backgroundColor: 'rgba(255, 153, 0, 0.1)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
						{icon}
					</Box>
				)}
			</Stack>

			{trend && !loading && (
				<Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.5 }}>
					<Typography
						variant="caption"
						sx={{
							color: trend.isPositive ? '#1d8102' : '#d13212',
							fontWeight: 700
						}}
					>
						{trend.isPositive ? '+' : ''}{trend.value}
					</Typography>
					<Typography variant="caption" sx={{ color: '#545b64' }}>
						vs last month
					</Typography>
				</Stack>
			)}
		</Paper>
	);
};

export default CRMStatsCard;
