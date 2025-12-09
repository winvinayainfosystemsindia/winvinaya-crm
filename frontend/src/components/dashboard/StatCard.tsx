import React from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';

interface StatCardProps {
	title: string;
	count: string;
	icon: React.ReactNode;
	color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color }) => (
	<Card sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
		<CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<Box>
				<Typography color="textSecondary" gutterBottom variant="overline" sx={{ fontWeight: 'bold' }}>
					{title}
				</Typography>
				<Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
					{count}
				</Typography>
			</Box>
			<Box sx={{ color: color, p: 1, borderRadius: '50%', backgroundColor: `${color}20` }}>
				{icon}
			</Box>
		</CardContent>
	</Card>
);

export default StatCard;
