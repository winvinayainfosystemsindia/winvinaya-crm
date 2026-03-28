import React from 'react';
import { Box, Stack, Typography, Tooltip } from '@mui/material';
import {
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import type { JobRole } from '../../../../models/jobRole';

// Local Components
import PlacementTable, { type PlacementColumn } from './PlacementTable';
import PlacementStatusBadge from '../common/PlacementStatusBadge';
import PlacementRowActions from '../common/PlacementRowActions';
import PlacementAvatar from '../common/PlacementAvatar';

interface JobRoleTableProps {
	loading: boolean;
	list: JobRole[];
	total: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRowsPerPageSelectChange: (rows: number) => void;
	onEdit: (jobRole: JobRole) => void;
	onDelete?: (jobRole: JobRole) => void;
	isAdmin: boolean;
}

const JobRoleTable: React.FC<JobRoleTableProps> = ({
	loading,
	list,
	total,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onRowsPerPageSelectChange,
	onEdit,
	onDelete,
	isAdmin
}) => {
	const columns: PlacementColumn<JobRole>[] = [
		{
			id: 'title',
			label: 'Job Title',
			minWidth: 200,
			format: (value: string, row: JobRole) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<PlacementAvatar name={value} size={32} />
					<Box>
						<Typography sx={{ fontWeight: 700, color: '#007eb9', fontSize: '0.875rem' }}>{value}</Typography>
						<Typography variant="caption" sx={{ color: '#545b64' }}>
							{row.job_details?.designation || 'No Designation'}
						</Typography>
					</Box>
				</Stack>
			)
		},
		{
			id: 'company',
			label: 'Company & Contact',
			minWidth: 200,
			format: (_: any, row: JobRole) => (
				<Box>
					<Typography sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{row.company?.name || '-'}</Typography>
					<Typography variant="caption" sx={{ color: '#545b64' }}>
						{row.contact ? `${row.contact.first_name} ${row.contact.last_name}` : '-'}
					</Typography>
				</Box>
			)
		},
		{
			id: 'status',
			label: 'Status',
			minWidth: 120,
			format: (value: string) => <PlacementStatusBadge label={value} status={value} />
		},
		{
			id: 'location',
			label: 'Location',
			minWidth: 150,
			format: (value: any) => (
				<Typography sx={{ fontSize: '0.8125rem' }}>
					{value?.cities?.join(', ') || value?.state || '-'}
				</Typography>
			)
		},
		{
			id: 'no_of_vacancies',
			label: 'Vacancies',
			minWidth: 100,
			align: 'center',
			format: (value: number) => value || 0
		},
		{
			id: 'close_date',
			label: 'Close Date',
			minWidth: 130,
			format: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
		},
		{
			id: 'visibility',
			label: 'Sys. Vis.',
			minWidth: 80,
			align: 'center',
			format: (_: any, row: JobRole) => (
				row.is_visible ?
					<Tooltip title="Available for Mapping"><VisibilityIcon sx={{ color: '#1d8102', fontSize: 18 }} /></Tooltip> :
					<Tooltip title="Hidden from Mapping"><VisibilityOffIcon sx={{ color: '#d13212', fontSize: 18 }} /></Tooltip>
			)
		},
		{
			id: 'actions',
			label: 'Actions',
			minWidth: 80,
			align: 'right',
			format: (_: any, row: JobRole) => (
				<PlacementRowActions
					onEdit={() => onEdit(row)}
					onDelete={isAdmin && onDelete ? () => onDelete(row) : undefined}
				/>
			)
		}
	];

	return (
		<PlacementTable
			columns={columns}
			rows={list}
			total={total}
			page={page}
			rowsPerPage={rowsPerPage}
			onPageChange={onPageChange}
			onRowsPerPageChange={onRowsPerPageChange}
			onRowsPerPageSelectChange={onRowsPerPageSelectChange}
			loading={loading}
			emptyMessage="No job roles found. Create a job role to start mapping candidates."
		/>
	);
};

export default JobRoleTable;
