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
				p: 2.5,
				border: '1px solid #d5dbdb',
				borderRadius: '2px',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				transition: 'border-color 0.2s ease',
				'&:hover': {
					borderColor: '#aab7b7'
				}
			}}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
				<Box>
					<Typography
						variant="body2"
						sx={{
							color: '#545b64',
							fontWeight: 700,
							mb: 0.5,
							textTransform: 'uppercase',
							fontSize: '0.75rem',
							letterSpacing: '0.05em'
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
								fontWeight: 300,
								color: '#16191f'
							}}
						>
							{value}
						</Typography>
					)}
				</Box>

				{icon && (
					<Box sx={{ color: '#545b64', opacity: 0.8 }}>
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
