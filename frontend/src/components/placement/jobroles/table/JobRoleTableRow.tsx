import React from 'react';
import { TableRow, TableCell, Stack, Typography, Box, Tooltip, useTheme } from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import type { JobRole } from '../../../../models/jobRole';

// Local Components
import PlacementStatusBadge from '../common/PlacementStatusBadge';
import PlacementRowActions from '../common/PlacementRowActions';
import PlacementAvatar from '../common/PlacementAvatar';

interface JobRoleTableRowProps {
	jobRole: JobRole;
	onEdit: (jobRole: JobRole) => void;
	onDelete: (jobRole: JobRole) => void;
	isAdmin: boolean;
}

const JobRoleTableRow: React.FC<JobRoleTableRowProps> = ({ jobRole, onEdit, onDelete, isAdmin }) => {
	const theme = useTheme();

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return '-';
		try {
			return format(new Date(dateString), 'd MMM yyyy');
		} catch {
			return '-';
		}
	};

	const toTitleCase = (str: string) => {
		if (!str) return '';
		return str.replace(
			/\w\S*/g,
			(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
		);
	};

	return (
		<TableRow
			hover
			sx={{
				height: '60px',
				'&:last-child td, &:last-child th': { border: 0 },
				'&:hover': { bgcolor: 'action.hover' },
				transition: 'background-color 0.2s',
				cursor: 'default'
			}}
		>
			<TableCell>
				<Box>
					<Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
						{toTitleCase(jobRole.title)}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
						{jobRole.job_details?.designation || 'No Designation'}
					</Typography>
				</Box>
			</TableCell>

			<TableCell>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<PlacementAvatar name={jobRole.company?.name || 'C'} size={32} />
					<Box>
						<Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
							{jobRole.company?.name || '-'}
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							{jobRole.contact ? `${jobRole.contact.first_name} ${jobRole.contact.last_name}` : '-'}
						</Typography>
					</Box>
				</Stack>
			</TableCell>

			<TableCell>
				<PlacementStatusBadge label={jobRole.status} status={jobRole.status} />
			</TableCell>

			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					{jobRole.location?.cities?.join(', ') || jobRole.location?.state || '-'}
				</Typography>
			</TableCell>

			<TableCell align="center" sx={{ fontWeight: 500, color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>
				{jobRole.no_of_vacancies || 0}
			</TableCell>

			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					{formatDate(jobRole.close_date)}
				</Typography>
			</TableCell>

			<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
					{jobRole.creator?.full_name || jobRole.creator?.username || '-'}
				</Typography>
			</TableCell>

			<TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
				<Tooltip title={jobRole.is_visible ? "Available for Mapping" : "Hidden from Mapping"}>
					{jobRole.is_visible ? (
						<VisibilityIcon sx={{ color: 'success.main', fontSize: 18 }} />
					) : (
						<VisibilityOffIcon sx={{ color: 'error.main', fontSize: 18 }} />
					)}
				</Tooltip>
			</TableCell>

			<TableCell align="right">
				<PlacementRowActions
					onEdit={() => onEdit(jobRole)}
					onDelete={isAdmin ? () => onDelete(jobRole) : undefined}
				/>
			</TableCell>
		</TableRow>
	);
};

export default JobRoleTableRow;
