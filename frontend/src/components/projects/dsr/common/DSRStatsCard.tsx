import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface DSRStatsCardProps {
	label: string;
	value: string | number;
	color?: string;
}

const DSRStatsCard: React.FC<DSRStatsCardProps> = ({ label, value, color = 'text.primary' }) => {
	return (
		<Card variant="outlined" sx={{ minWidth: 200, bgcolor: '#f8f9fa', borderRadius: '2px', border: '1px solid #d5dbdb' }}>
			<CardContent sx={{ py: '12px !important', textAlign: 'center' }}>
				<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					{label}
				</Typography>
				<Typography variant="h5" sx={{ fontWeight: 700, color }}>
					{value}
				</Typography>
			</CardContent>
		</Card>
	);
};

export default DSRStatsCard;
