import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import {
	FileUpload as RaisedIcon,
	CheckCircle as ApprovedIcon,
	Cancel as RejectedIcon
} from '@mui/icons-material';
import type { DSRPermissionStats } from '../../../../models/dsr';

interface PermissionStatsCardsProps {
	stats: DSRPermissionStats | null;
	loading?: boolean;
}

const StatCard: React.FC<{
	label: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	bgcolor: string;
}> = ({ label, value, icon, color, bgcolor }) => (
	<Paper
		variant="outlined"
		sx={{
			p: 2,
			display: 'flex',
			alignItems: 'center',
			gap: 2,
			borderRadius: '2px',
			borderColor: '#d5dbdb',
			bgcolor: 'white',
			height: '100%'
		}}
	>
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 48,
				height: 48,
				borderRadius: '4px',
				bgcolor: bgcolor,
				color: color
			}}
		>
			{icon}
		</Box>
		<Box>
			<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
				{label}
			</Typography>
			<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e', lineHeight: 1 }}>
				{value}
			</Typography>
		</Box>
	</Paper>
);

const PermissionStatsCards: React.FC<PermissionStatsCardsProps> = ({ stats }) => {
	if (!stats) return null;

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 4 }}>
				<StatCard
					label="Requests Raised"
					value={stats.raised}
					icon={<RaisedIcon />}
					color="#0067b0"
					bgcolor="#f1faff"
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 4 }}>
				<StatCard
					label="Approved"
					value={stats.approved}
					icon={<ApprovedIcon />}
					color="#1d8102"
					bgcolor="#e6f4ea"
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 4 }}>
				<StatCard
					label="Rejected"
					value={stats.rejected}
					icon={<RejectedIcon />}
					color="#d13212"
					bgcolor="#fdf3f1"
				/>
			</Grid>
		</Grid>
	);
};

export default PermissionStatsCards;
