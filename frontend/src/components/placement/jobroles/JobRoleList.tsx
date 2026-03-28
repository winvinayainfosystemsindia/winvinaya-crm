import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, InputAdornment, Stack, IconButton, Tooltip, Container } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchJobRoles, createJobRole, updateJobRole, deleteJobRole } from '../../../store/slices/jobRoleSlice';
import CRMPageHeader from '../../crm/common/CRMPageHeader';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';
import ConfirmDialog from '../../common/ConfirmDialog';
import { JOB_ROLE_STATUS } from '../../../models/jobRole';
import type { JobRole, JobRoleCreate, JobRoleUpdate } from '../../../models/jobRole';

// Modular Components
import JobRoleStats from './stats/JobRoleStats';
import JobRoleTable from './table/JobRoleTable';
import JobRoleFormDialog from './forms/JobRoleFormDialog';

const JobRoleList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total, loading } = useAppSelector((state: any) => state.jobRoles);
	const { user } = useAppSelector((state: any) => state.auth);
	const isAdmin = user?.role === 'admin' || user?.role === 'manager';

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedJobRole, setSelectedJobRole] = useState<JobRole | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const loadData = () => dispatch(fetchJobRoles({ skip: page * rowsPerPage, limit: rowsPerPage, search: search || undefined, ...activeFilters }));
	useEffect(() => { loadData(); }, [dispatch, page, rowsPerPage, search, activeFilters]);

	const handleFormSubmit = async (data: JobRoleCreate | JobRoleUpdate) => {
		try {
			if (selectedJobRole) {
				await dispatch(updateJobRole({ publicId: selectedJobRole.public_id, jobRole: data as JobRoleUpdate })).unwrap();
				enqueueSnackbar('Updated successfully', { variant: 'success' });
			} else {
				await dispatch(createJobRole(data as JobRoleCreate)).unwrap();
				enqueueSnackbar('Created successfully', { variant: 'success' });
			}
			setDialogOpen(false);
			loadData();
		} catch (error: any) { enqueueSnackbar(error || 'Failed to save', { variant: 'error' }); }
	};

	const handleDeleteConfirm = async () => {
		if (!selectedJobRole) return;
		try {
			await dispatch(deleteJobRole(selectedJobRole.public_id)).unwrap();
			enqueueSnackbar('Deleted successfully', { variant: 'success' });
			setDeleteDialogOpen(false);
			loadData();
		} catch (error: any) { enqueueSnackbar(error || 'Failed to delete', { variant: 'error' }); }
	};

	const filterFields: FilterField[] = [
		{ 
			key: 'status', 
			label: 'Status', 
			type: 'single-select', 
			options: [
				{ value: JOB_ROLE_STATUS.ACTIVE, label: 'Active' }, 
				{ value: JOB_ROLE_STATUS.INACTIVE, label: 'Inactive' }, 
				{ value: JOB_ROLE_STATUS.CLOSED, label: 'Closed' }
			] 
		}
	];

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh', pb: 6 }}>
			<CRMPageHeader 
				title="Job Roles Management" 
				actions={
					<Stack direction="row" spacing={2}>
						<Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ color: '#545b64', borderColor: '#d5dbdb' }}>Refresh</Button>
						<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedJobRole(null); setDialogOpen(true); }} sx={{ bgcolor: '#ec7211', px: 3, '&:hover': { bgcolor: '#eb5f07' } }}>Add Job Role</Button>
					</Stack>
				} 
			/>
			<Container maxWidth="xl" sx={{ mt: 3 }}>
				<JobRoleStats list={list} total={total} />
				<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<TextField 
						size="small" 
						placeholder="Search by title, company..." 
						value={search} 
						onChange={(e) => setSearch(e.target.value)} 
						sx={{ width: 350, bgcolor: 'white' }} 
						InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }} 
					/>
					<Tooltip title="Filter">
						<IconButton onClick={() => setFilterDrawerOpen(true)} sx={{ border: '1px solid #d5dbdb', bgcolor: activeFilters.status ? '#f1faff' : 'white' }}>
							<FilterIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
				<JobRoleTable 
					loading={loading} 
					list={list} 
					total={total} 
					page={page} 
					rowsPerPage={rowsPerPage} 
					onPageChange={(_, p) => setPage(p)} 
					onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} 
					onRowsPerPageSelectChange={(r) => setRowsPerPage(r)} 
					onEdit={(j) => { setSelectedJobRole(j); setDialogOpen(true); }} 
					onDelete={(j) => { setSelectedJobRole(j); setDeleteDialogOpen(true); }} 
					isAdmin={isAdmin} 
				/>
			</Container>

			<JobRoleFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleFormSubmit} jobRole={selectedJobRole} />
			<FilterDrawer 
				open={filterDrawerOpen} 
				onClose={() => setFilterDrawerOpen(false)} 
				fields={filterFields} 
				activeFilters={activeFilters} 
				onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
				onClearFilters={() => { setActiveFilters({}); setPage(0); setFilterDrawerOpen(false); }}
				onApplyFilters={() => { setPage(0); setFilterDrawerOpen(false); }}
			/>
			<ConfirmDialog open={deleteDialogOpen} title="Delete Job Role" message={`Are you sure you want to delete "${selectedJobRole?.title}"?`} onConfirm={handleDeleteConfirm} onClose={() => setDeleteDialogOpen(false)} />
		</Box>
	);
};

export default JobRoleList;
