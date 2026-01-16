import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Stack, IconButton, Tooltip, Typography, Checkbox } from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Schedule as DueIcon,
	PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCRMTasks, updateCRMTask } from '../../../store/slices/crmTaskSlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import type { CRMTask } from '../../../models/crmTask';

const CRMTaskList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { list, total, loading } = useAppSelector((state) => state.crmTasks);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');

	useEffect(() => {
		dispatch(fetchCRMTasks({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
	}, [dispatch, page, rowsPerPage, search]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchCRMTasks({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
	};

	const handleToggleComplete = async (task: CRMTask) => {
		const newStatus = task.status === 'completed' ? 'pending' : 'completed';
		await dispatch(updateCRMTask({
			publicId: task.public_id,
			task: { status: newStatus }
		}));
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
			format: (value: string, row: CRMTask) => {
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
			id: 'assigned_to_user',
			label: 'Assigned To',
			minWidth: 150,
			format: (value: any) => value?.full_name || 'Unassigned'
		}
	];

	return (
		<Box>
			<CRMPageHeader
				title="Tasks"
				actions={
					<>
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={handleRefresh}
							sx={{ color: '#545b64', borderColor: '#d5dbdb' }}
						>
							Refresh
						</Button>
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							sx={{ px: 3 }}
						>
							Create Task
						</Button>
					</>
				}
			/>

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
					<Button size="small" variant="outlined" sx={{ color: '#545b64', borderColor: '#d5dbdb' }}>Upcoming</Button>
					<Button size="small" variant="outlined" sx={{ color: '#545b64', borderColor: '#d5dbdb' }}>Overdue</Button>
					<Tooltip title="Filter">
						<IconButton sx={{ border: '1px solid #d5dbdb', borderRadius: '2px', bgcolor: 'white' }}>
							<FilterIcon fontSize="small" sx={{ color: '#545b64' }} />
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
				loading={loading}
				emptyMessage="No tasks found. Stay on top of your deals by creating tasks."
				onRowClick={(row) => console.log('Clicked Task', row.public_id)}
			/>
		</Box>
	);
};

export default CRMTaskList;
