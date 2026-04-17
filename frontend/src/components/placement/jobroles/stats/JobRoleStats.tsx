import React from 'react';
import { Grid, useTheme } from '@mui/material';
import {
	Work as JobIcon,
	Business as BusinessIcon,
	Visibility as VisibilityIcon,
	Groups as VacancyIcon,
} from '@mui/icons-material';
import StatCard from '../../../common/StatCard';
import { JOB_ROLE_STATUS } from '../../../../models/jobRole';

interface JobRoleStatsProps {
	list: any[];
	total: number;
}

const JobRoleStats: React.FC<JobRoleStatsProps> = ({ list, total }) => {
	const theme = useTheme();

	return (
		<Grid container spacing={3} sx={{ mb: 4 }}>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Total Job Roles"
					value={total}
					subtitle="Overall positions created"
					icon={<JobIcon />}
					color={theme.palette.primary.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Active Openings"
					value={list.filter(j => j.status === JOB_ROLE_STATUS.ACTIVE).length}
					subtitle="Accepting applications"
					icon={<VisibilityIcon />}
					color={theme.palette.success.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Total Vacancies"
					value={list.reduce((acc, j) => acc + (j.no_of_vacancies || 0), 0)}
					subtitle="Across all active roles"
					icon={<VacancyIcon />}
					color={theme.palette.warning.main}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 6, md: 3 }}>
				<StatCard
					title="Partner Companies"
					value={new Set(list.map(j => j.company_id)).size}
					subtitle="Unique organization partners"
					icon={<BusinessIcon />}
					color={theme.palette.secondary.main}
				/>
			</Grid>
		</Grid>
	);
};

export default JobRoleStats;
