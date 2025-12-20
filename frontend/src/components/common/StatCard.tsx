import React from 'react';
import { Box, Paper, Typography, SvgIcon } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode | SvgIconComponent;
	trend?: {
		value: number;
		label: string;
		direction: 'up' | 'down' | 'neutral';
	};
	color?: string; // Accent color
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'primary.main' }) => {
	// Determine trend color
	const getTrendColor = () => {
		if (!trend) return 'text.secondary';
		if (trend.direction === 'up') return 'success.main';
		if (trend.direction === 'down') return 'error.main';
		return 'text.secondary';
	};

	return (
		<Paper
			elevation={0}
			variant="outlined"
			sx={{
				p: 2.5,
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				borderLeft: `4px solid`,
				borderLeftColor: color,
				transition: 'transform 0.2s, box-shadow 0.2s',
				'&:hover': {
					transform: 'translateY(-2px)',
					boxShadow: 2
				}
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
				<Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
					{title}
				</Typography>
				{icon && (
					<Box sx={{ color: color, opacity: 0.8 }}>
						{/* Check if icon is a component or node */}
						{/* @ts-ignore - Handle SvgIconComponent vs value gracefully */}
						{typeof icon === 'object' ? icon : <SvgIcon component={icon as any} />}
					</Box>
				)}
			</Box>

			<Box>
				<Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1f36' }}>
					{value}
				</Typography>

				{trend && (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<Typography variant="caption" sx={{ fontWeight: 600, color: getTrendColor() }}>
							{trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '•'} {Math.abs(trend.value)}%
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{trend.label}
						</Typography>
					</Box>
				)}
			</Box>
		</Paper>
	);
};

export default StatCard;
