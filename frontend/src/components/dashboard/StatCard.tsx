import React from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';

interface StatCardProps {
	title: string;
	count: string;
	icon: React.ReactNode;
	color: string;
	subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color, subtitle }) => (
	<Card
		sx={{ height: '100%', borderLeft: `5px solid ${color}` }}
		aria-label={`${title}: ${count}${subtitle ? `. ${subtitle}` : ''}`}
	>
		<CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<Box aria-hidden="true">
				<Typography color="textSecondary" gutterBottom variant="overline" sx={{ fontWeight: 'bold', display: 'block' }}>
					{title}
				</Typography>
				<Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
					{count}
				</Typography>
				{subtitle && (
					<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			<Box
				sx={{ color: color, p: 1, borderRadius: '50%', backgroundColor: `${color}20` }}
				aria-hidden="true"
			>
				{icon}
			</Box>
		</CardContent>
	</Card>
);


export default StatCard;
