import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	TextField,
	InputAdornment,
	Stack,
	IconButton,
	Tooltip,
	Typography,
	Checkbox,
	Container,
	Grid
} from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Schedule as DueIcon,
	PriorityHigh as PriorityIcon,
	Person as PersonIcon,
	CheckCircle as CompletedIcon,
	Pending as PendingIcon,
	Error as OverdueIcon,
	Assignment as TaskIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCRMTasks, updateCRMTask, createCRMTask, deleteCRMTask } from '../../../store/slices/crmTaskSlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import CRMTaskFormDialog from './CRMTaskFormDialog';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';
import ConfirmDialog from '../../common/ConfirmDialog';
import StatCard from '../../common/StatCard';
import CRMRowActions from '../common/CRMRowActions';
import type { CRMTask } from '../../../models/crmTask';
import { useSnackbar } from 'notistack';

const CRMTaskList: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total, loading } = useAppSelector((state) => state.crmTasks);
	const { user: currentUser } = useAppSelector((state) => state.auth);

	const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'sales_manager';
	const isAdmin = currentUser?.role === 'admin';

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState('due_date');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<CRMTask | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [taskToDelete, setTaskToDelete] = useState<CRMTask | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		dispatch(fetchCRMTasks({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
	}, [dispatch, page, rowsPerPage, search, sortBy, sortOrder, activeFilters]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchCRMTasks({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
	};

	const handleAddTask = () => {
		setSelectedTaskForEdit(null);
		setDialogOpen(true);
	};

	const handleEditTask = (task: CRMTask) => {
		setSelectedTaskForEdit(task);
		setDialogOpen(true);
	};

	const handleDialogSubmit = async (data: any) => {
		try {
			if (selectedTaskForEdit) {
				await dispatch(updateCRMTask({ publicId: selectedTaskForEdit.public_id, task: data })).unwrap();
				enqueueSnackbar('Task updated successfully', { variant: 'success' });
			} else {
				await dispatch(createCRMTask(data)).unwrap();
				enqueueSnackbar('Task created successfully', { variant: 'success' });
			}
			setDialogOpen(false);
			handleRefresh();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to save task', { variant: 'error' });
		}
	};

	const handleDeleteClick = (task: CRMTask) => {
		setTaskToDelete(task);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (taskToDelete) {
			setDeleting(true);
			try {
				await dispatch(deleteCRMTask(taskToDelete.public_id)).unwrap();
				enqueueSnackbar('Task deleted successfully', { variant: 'success' });
				setDeleteDialogOpen(false);
				setTaskToDelete(null);
				handleRefresh();
			} catch (error: any) {
				enqueueSnackbar(error || 'Failed to delete task', { variant: 'error' });
			} finally {
				setDeleting(false);
			}
		}
	};

	const handleSort = (columnId: string) => {
		const isAsc = sortBy === columnId && sortOrder === 'asc';
		setSortOrder(isAsc ? 'desc' : 'asc');
		setSortBy(columnId);
		setPage(0);
	};

	const handleFilterChange = (key: string, value: any) => {
		setActiveFilters(prev => ({ ...prev, [key]: value }));
	};

	const handleApplyFilters = () => {
		setFilterDrawerOpen(false);
		setPage(0);
	};

	const handleClearFilters = () => {
		setActiveFilters({});
		setFilterDrawerOpen(false);
		setPage(0);
	};

	const handleQuickFilter = (type: 'upcoming' | 'overdue') => {
		if (type === 'overdue') {
			setActiveFilters({ overdueOnly: true });
		} else {
			setActiveFilters({ dueSoonOnly: true });
		}
		setPage(0);
	};

	const filterFields: FilterField[] = [
		{
			key: 'status',
			label: 'Status',
			type: 'single-select',
			options: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'in_progress', label: 'In Progress' },
				{ value: 'completed', label: 'Completed' },
				{ value: 'cancelled', label: 'Cancelled' }
			]
		},
		{
			key: 'priority',
			label: 'Priority',
			type: 'single-select',
			options: [
				{ value: 'low', label: 'Low' },
				{ value: 'medium', label: 'Medium' },
				{ value: 'high', label: 'High' },
				{ value: 'urgent', label: 'Urgent' }
			]
		},
		{
			key: 'overdueOnly',
			label: 'Overdue Only',
			type: 'boolean'
		},
		{
			key: 'dueSoonOnly',
			label: 'Due Soon (Next 24h)',
			type: 'boolean'
		}
	];

	const handleToggleComplete = async (task: CRMTask) => {
		const newStatus = task.status === 'completed' ? 'pending' : 'completed';
		await dispatch(updateCRMTask({
			publicId: task.public_id,
			task: { status: newStatus }
		})).unwrap();
		enqueueSnackbar(`Task marked as ${newStatus}`, { variant: 'info' });
		handleRefresh();
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'urgent': return '#d13212';
			case 'high': return '#ff9900';
			case 'medium': return '#007eb9';
			default: return '#545b64';
		}
	};

	const columns = [
		{
			id: 'status',
			label: '',
			minWidth: 50,
			format: (value: string, row: CRMTask) => (
				<Checkbox
					size="small"
					checked={value === 'completed'}
					onChange={(e) => {
						e.stopPropagation();
						handleToggleComplete(row);
					}}
					sx={{ color: '#d5dbdb' }}
				/>
			)
		},
		{
			id: 'title',
			label: 'Task',
			minWidth: 250,
			sortable: true,
			format: (value: string, row: CRMTask) => (
				<Box>
					<Box
						sx={{
							fontWeight: 700,
							color: row.status === 'completed' ? '#aab7b7' : '#16191f',
							textDecoration: row.status === 'completed' ? 'line-through' : 'none'
						}}
					>
						{value}
					</Box>
					<Box sx={{ fontSize: '0.75rem', color: '#545b64' }}>
						{row.related_to_type?.toUpperCase()}: {row.related_to_id || 'Global'}
					</Box>
				</Box>
			)
		},
		{
			id: 'task_type',
			label: 'Type',
			minWidth: 100,
			format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
		},
		{
			id: 'priority',
			label: 'Priority',
			minWidth: 120,
			sortable: true,
			format: (value: string) => (
				<Stack direction="row" spacing={0.5} alignItems="center">
					<PriorityIcon sx={{ fontSize: 14, color: getPriorityColor(value) }} />
					<Typography
						variant="caption"
						sx={{
							fontWeight: 700,
							color: getPriorityColor(value),
							textTransform: 'uppercase'
						}}
					>
						{value}
					</Typography>
				</Stack>
			)
		},
		{
			id: 'due_date',
			label: 'Due Date',
			minWidth: 160,
			sortable: true,
			format: (value: string, row: CRMTask) => {
				if (!value) return '-';
				const date = new Date(value);
				const isOverdue = date < new Date() && row.status !== 'completed';
				return (
					<Stack direction="row" spacing={1} alignItems="center">
						<DueIcon sx={{ fontSize: 16, color: isOverdue ? '#d13212' : '#aab7b7' }} />
						<Typography
							variant="body2"
							sx={{ color: isOverdue ? '#d13212' : '#16191f', fontWeight: isOverdue ? 700 : 400 }}
						>
							{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</Typography>
					</Stack>
				);
			}
		},
		{
			id: 'assigned_user',
			label: 'Assigned To',
			minWidth: 150,
			format: (value: any) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<PersonIcon sx={{ fontSize: 16, color: '#aab7b7' }} />
					<Typography variant="body2">{value?.full_name || 'Unassigned'}</Typography>
				</Stack>
			)
		},
		{
			id: 'actions',
			label: 'Actions',
			minWidth: 100,
			align: 'right' as const,
			format: (_: any, row: CRMTask) => (
				<CRMRowActions
					row={row}
					onView={() => navigate(`/crm/tasks/${row.public_id}`)}
					onEdit={() => handleEditTask(row)}
					onDelete={isAdmin ? () => handleDeleteClick(row) : undefined}
				/>
			)
		}
	];

	const actions = (
		<>
			<Button
				variant="outlined"
				startIcon={<RefreshIcon />}
				onClick={handleRefresh}
				sx={{ color: '#545b64', borderColor: '#d5dbdb', textTransform: 'none', fontWeight: 700 }}
			>
				Refresh
			</Button>
			{isManager && (
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={handleAddTask}
					sx={{
						px: 3,
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' },
						textTransform: 'none',
						fontWeight: 600,
						boxShadow: 'none'
					}}
				>
					Create Task
				</Button>
			)}
		</>
	);

	// Calculate stats from the list
	const overdueCount = list.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
	const pendingCount = list.filter(t => t.status !== 'completed').length;
	const completedCount = list.filter(t => t.status === 'completed').length;

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh', pb: 6 }}>
			<CRMPageHeader
				title="Tasks"
				actions={actions}
			/>

			<Container maxWidth="xl" sx={{ mt: 3 }}>
				<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Total Tasks"
							value={total}
							icon={<TaskIcon />}
							color="#007eb9"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Pending"
							value={pendingCount}
							icon={<PendingIcon />}
							color="#ff9900"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Overdue"
							value={overdueCount}
							icon={<OverdueIcon />}
							color="#d13212"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Completed"
							value={completedCount}
							icon={<CompletedIcon />}
							color="#1d8102"
						/>
					</Grid>
				</Grid>

				<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<TextField
						size="small"
						placeholder="Search tasks..."
						value={search}
						onChange={handleSearchChange}
						sx={{ width: 320, bgcolor: 'white' }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon fontSize="small" sx={{ color: '#545b64' }} />
								</InputAdornment>
							),
						}}
					/>

					<Stack direction="row" spacing={1}>
						<Button
							size="small"
							variant="outlined"
							onClick={() => handleQuickFilter('upcoming')}
							sx={{
								color: activeFilters.dueSoonOnly ? '#ec7211' : '#545b64',
								borderColor: activeFilters.dueSoonOnly ? '#ec7211' : '#d5dbdb',
								textTransform: 'none',
								fontWeight: 700
							}}
						>
							Upcoming
						</Button>
						<Button
							size="small"
							variant="outlined"
							onClick={() => handleQuickFilter('overdue')}
							sx={{
								color: activeFilters.overdueOnly ? '#ec7211' : '#545b64',
								borderColor: activeFilters.overdueOnly ? '#ec7211' : '#d5dbdb',
								textTransform: 'none',
								fontWeight: 700
							}}
						>
							Overdue
						</Button>
						<Tooltip title="Filter">
							<IconButton
								onClick={() => setFilterDrawerOpen(true)}
								sx={{
									border: '1px solid #d5dbdb',
									borderRadius: '2px',
									bgcolor: activeFilters.status || activeFilters.priority ? '#f5f8fa' : 'white'
								}}
							>
								<FilterIcon fontSize="small" sx={{ color: activeFilters.status || activeFilters.priority ? '#ec7211' : '#545b64' }} />
							</IconButton>
						</Tooltip>
					</Stack>
				</Box>

				<CRMTable
					columns={columns}
					rows={list}
					total={total}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
					onRowsPerPageSelectChange={(rows) => {
						setRowsPerPage(rows);
						setPage(0);
					}}
					orderBy={sortBy}
					order={sortOrder}
					onSort={handleSort}
					loading={loading}
					emptyMessage="No tasks found. Stay on top of your deals by creating tasks."
					onRowClick={(row) => navigate(`/crm/tasks/${row.public_id}`)}
				/>

				<CRMTaskFormDialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					onSubmit={handleDialogSubmit}
					task={selectedTaskForEdit}
					loading={loading}
				/>

				<FilterDrawer
					open={filterDrawerOpen}
					onClose={() => setFilterDrawerOpen(false)}
					fields={filterFields}
					activeFilters={activeFilters}
					onFilterChange={handleFilterChange}
					onClearFilters={handleClearFilters}
					onApplyFilters={handleApplyFilters}
				/>

				<ConfirmDialog
					open={deleteDialogOpen}
					title="Delete Task"
					message={`Are you sure you want to delete task "${taskToDelete?.title}"? This action cannot be undone.`}
					confirmText="Delete"
					onClose={() => setDeleteDialogOpen(false)}
					onConfirm={handleDeleteConfirm}
					loading={deleting}
					severity="error"
				/>
			</Container>
		</Box>
	);
};

export default CRMTaskList;
