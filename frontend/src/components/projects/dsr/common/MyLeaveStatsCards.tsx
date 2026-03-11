import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import {
	EventNote as TotalIcon,
	PendingActions as PendingIcon,
	CheckCircle as ApprovedIcon,
	Cancel as RejectedIcon
} from '@mui/icons-material';
import type { DSRLeaveStats } from '../../../../models/dsr';
import StatCard from '../../../common/StatCard';

interface MyLeaveStatsCardsProps {
	stats: DSRLeaveStats | null;
	loading?: boolean;
}

const MyLeaveStatsCards: React.FC<MyLeaveStatsCardsProps> = ({ stats, loading }) => {
	if (!stats && !loading) return null;

	const dummyStats: DSRLeaveStats = {
		total_apps: 0,
		total_days: 0,
		pending_apps: 0,
		pending_days: 0,
		approved_apps: 0,
		approved_days: 0,
		rejected_apps: 0,
		rejected_days: 0
	};

	const displayStats = stats || dummyStats;

	const StatValue = ({ days, apps }: { days: number, apps: number }) => (
		<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
			<Typography variant="h4" component="span" sx={{ fontWeight: 700, color: '#1a1f36' }}>
				{days}
			</Typography>
			<Typography variant="body2" component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
				days ({apps} {apps === 1 ? 'app' : 'apps'})
			</Typography>
		</Box>
	);

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Total Applied"
					value=""
					icon={<TotalIcon />}
					color="#0067b0"
				>
					<StatValue days={displayStats.total_days} apps={displayStats.total_apps} />
				</StatCard>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Pending Approval"
					value=""
					icon={<PendingIcon />}
					color="#ec7211"
				>
					<StatValue days={displayStats.pending_days} apps={displayStats.pending_apps} />
				</StatCard>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Approved"
					value=""
					icon={<ApprovedIcon />}
					color="#1d8102"
				>
					<StatValue days={displayStats.approved_days} apps={displayStats.approved_apps} />
				</StatCard>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Rejected"
					value=""
					icon={<RejectedIcon />}
					color="#d13212"
				>
					<StatValue days={displayStats.rejected_days} apps={displayStats.rejected_apps} />
				</StatCard>
			</Grid>
		</Grid>
	);
};

export default MyLeaveStatsCards;
