import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
	People as PeopleIcon,
	AssignmentInd as ProfileIcon,
	Psychology as CounselingIcon,
	Description as DocumentIcon
} from '@mui/icons-material';
import StatCard from '../../common/StatCard';
import type { AnalyticsData } from './types';

interface KpiStatsProps {
	data: AnalyticsData['metrics'];
}

const KpiStats: React.FC<KpiStatsProps> = ({ data }) => {
	const theme = useTheme();

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
			<Box sx={{ flex: '1 1 200px', minWidth: 240 }}>
				<StatCard
					title="Total Candidates"
					value={data.total_candidates}
					icon={<PeopleIcon />}
					color={theme.palette.info.main}
				/>
			</Box>
			<Box sx={{ flex: '1 1 200px', minWidth: 240 }}>
				<StatCard
					title="Active Pipeline"
					value={data.active_pipeline}
					icon={<ProfileIcon />}
					color={theme.palette.primary.main}
					trend={{ value: 12, label: 'vs last month', direction: 'up' }}
				/>
			</Box>
			<Box sx={{ flex: '1 1 200px', minWidth: 240 }}>
				<StatCard
					title="Selection Rate"
					value={`${data.selection_rate}%`}
					icon={<CounselingIcon />}
					color={theme.palette.success.main}
				/>
			</Box>
			<Box sx={{ flex: '1 1 200px', minWidth: 240 }}>
				<StatCard
					title="Placement Rate"
					value={`${data.conversion_rate}%`}
					icon={<DocumentIcon />}
					color={theme.palette.warning.main}
				/>
			</Box>
		</Box>
	);
};

export default KpiStats;
