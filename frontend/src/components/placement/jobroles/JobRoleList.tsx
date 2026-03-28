import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createJobRole, updateJobRole, fetchJobRoles } from '../../../store/slices/jobRoleSlice';
import CRMPageHeader from '../../crm/common/CRMPageHeader';
import type { JobRole, JobRoleCreate, JobRoleUpdate } from '../../../models/jobRole';

// Modular Components
import JobRoleStats from './stats/JobRoleStats';
import JobRoleTable from './table/JobRoleTable';
import JobRoleFormDialog from './forms/JobRoleFormDialog';

interface JobRoleListProps {
	title?: string;
	subtitle?: string;
}

const JobRoleList: React.FC<JobRoleListProps> = ({ title = "Job Role Management", subtitle }) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total } = useAppSelector((state: any) => state.jobRoles);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedJobRole, setSelectedJobRole] = useState<JobRole | null>(null);

	const handleFormSubmit = async (data: JobRoleCreate | JobRoleUpdate) => {
		try {
			if (selectedJobRole) {
				await dispatch(updateJobRole({ publicId: selectedJobRole.public_id, jobRole: data as JobRoleUpdate })).unwrap();
				enqueueSnackbar('Job Role updated successfully', { variant: 'success' });
			} else {
				await dispatch(createJobRole(data as JobRoleCreate)).unwrap();
				enqueueSnackbar('Job Role created successfully', { variant: 'success' });
			}
			setDialogOpen(false);
			// Trigger a refresh of the table data
			dispatch(fetchJobRoles({ skip: 0, limit: 10 }));
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to save job role', { variant: 'error' });
		}
	};

	const handleEdit = (jobRole: JobRole) => {
		setSelectedJobRole(jobRole);
		setDialogOpen(true);
	};

	const handleAdd = () => {
		setSelectedJobRole(null);
		setDialogOpen(true);
	};

	return (
		<>
			<CRMPageHeader
				title={title}
				subtitle={subtitle}
				actions={
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleAdd}
						sx={{ bgcolor: '#ec7211', px: 3, fontWeight: 700, borderRadius: '2px', '&:hover': { bgcolor: '#eb5f07' } }}
					>
						Add Job Role
					</Button>
				}
			/>

			<Box sx={{ mt: { xs: 2, md: 3 } }}>
				<JobRoleStats list={list} total={total} />
				<Box sx={{ mt: { xs: 2, md: 3 } }}>
					<JobRoleTable onEditJobRole={handleEdit} />
				</Box>
			</Box>

			<JobRoleFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleFormSubmit}
				jobRole={selectedJobRole}
			/>
		</>
	);
};

export default JobRoleList;
