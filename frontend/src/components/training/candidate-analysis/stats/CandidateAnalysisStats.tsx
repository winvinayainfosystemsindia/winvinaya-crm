import React from 'react';
import { Grid, useTheme } from '@mui/material';
import {
	AssessmentOutlined as TotalIcon,
	VerifiedOutlined as ReadyIcon
} from '@mui/icons-material';
import StatCard from '../../../common/stats/StatCard';

interface CandidateAnalysisStatsProps {
	stats: {
		total: number;
		ready: number;
	};
}

const CandidateAnalysisStats: React.FC<CandidateAnalysisStatsProps> = ({ stats }) => {
	const theme = useTheme();

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 6 }}>
				<StatCard
					title="Total Assessed"
					value={stats.total}
					icon={TotalIcon}
					color={theme.palette.primary.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6 }}>
				<StatCard
					title="Ready for Placement"
					value={stats.ready}
					icon={ReadyIcon}
					color={theme.palette.success.main}
					subtitle={`${((stats.ready / (stats.total || 1)) * 100).toFixed(0)}% ready rate`}
				/>
			</Grid>
		</Grid>
	);
};

export default CandidateAnalysisStats;
