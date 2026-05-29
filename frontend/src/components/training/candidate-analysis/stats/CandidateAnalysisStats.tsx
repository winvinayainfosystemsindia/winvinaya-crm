import React from 'react';
import { Grid, useTheme } from '@mui/material';
import {
	AssessmentOutlined as TotalIcon,
	VerifiedOutlined as ReadyIcon,
	PsychologyOutlined as TechIcon,
	RecordVoiceOverOutlined as CommIcon,
	EmojiEmotionsOutlined as AttitudeIcon
} from '@mui/icons-material';
import StatCard from '../../../common/stats/StatCard';

interface CandidateAnalysisStatsProps {
	stats: {
		total: number;
		ready: number;
		avgTech: number | string;
		avgComm: number | string;
		avgAttitude: number | string;
	};
}

const CandidateAnalysisStats: React.FC<CandidateAnalysisStatsProps> = ({ stats }) => {
	const theme = useTheme();

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
				<StatCard
					title="Total Assessed"
					value={stats.total}
					icon={TotalIcon}
					color={theme.palette.primary.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
				<StatCard
					title="Ready for Placement"
					value={stats.ready}
					icon={ReadyIcon}
					color={theme.palette.success.main}
					subtitle={`${((stats.ready / (stats.total || 1)) * 100).toFixed(0)}% ready rate`}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
				<StatCard
					title="Avg Technical"
					value={stats.avgTech}
					unit="/ 10"
					icon={TechIcon}
					color={theme.palette.info.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
				<StatCard
					title="Avg Communication"
					value={stats.avgComm}
					unit="/ 10"
					icon={CommIcon}
					color={theme.palette.warning.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
				<StatCard
					title="Avg Attitude"
					value={stats.avgAttitude}
					unit="/ 10"
					icon={AttitudeIcon}
					color={theme.palette.secondary.main}
				/>
			</Grid>
		</Grid>
	);
};

export default CandidateAnalysisStats;
