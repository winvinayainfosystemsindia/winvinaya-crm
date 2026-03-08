import React from 'react';
import { Grid } from '@mui/material';
import {
	FileUpload as RaisedIcon,
	CheckCircle as ApprovedIcon,
	Cancel as RejectedIcon
} from '@mui/icons-material';
import type { DSRPermissionStats } from '../../../../models/dsr';
import StatCard from '../../../common/StatCard';

interface PermissionStatsCardsProps {
	stats: DSRPermissionStats | null;
	loading?: boolean;
}

const PermissionStatsCards: React.FC<PermissionStatsCardsProps> = ({ stats }) => {
	if (!stats) return null;

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 4 }}>
				<StatCard
					title="Requests Raised"
					value={stats.raised}
					icon={<RaisedIcon />}
					color="#0067b0"
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 4 }}>
				<StatCard
					title="Approved"
					value={stats.approved}
					icon={<ApprovedIcon />}
					color="#1d8102"
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 4 }}>
				<StatCard
					title="Rejected"
					value={stats.rejected}
					icon={<RejectedIcon />}
					color="#d13212"
				/>
			</Grid>
		</Grid>
	);
};

export default PermissionStatsCards;
