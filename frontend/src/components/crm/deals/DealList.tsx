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
	Container,
	Grid
} from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Handshake as DealIcon,
	TrendingUp as TrendIcon,
	Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDeals, fetchPipelineSummary, createDeal, updateDeal, deleteDeal } from '../../../store/slices/dealSlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import DealFormDialog from './DealFormDialog';
import CRMStatusBadge from '../common/CRMStatusBadge';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';
import ConfirmDialog from '../../common/ConfirmDialog';
import StatCard from '../../common/StatCard';
import CRMRowActions from '../common/CRMRowActions';
import type { Deal } from '../../../models/deal';
import { useSnackbar } from 'notistack';

const DealList: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total, pipeline, loading } = useAppSelector((state) => state.deals);
	const { user: currentUser } = useAppSelector((state) => state.auth);

	const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'sales_manager';
	const isAdmin = currentUser?.role === 'admin';

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedDealForEdit, setSelectedDealForEdit] = useState<Deal | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		dispatch(fetchDeals({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
		dispatch(fetchPipelineSummary());
	}, [dispatch, page, rowsPerPage, search, sortBy, sortOrder, activeFilters]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchDeals({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
		dispatch(fetchPipelineSummary());
	};

	const handleAddDeal = () => {
		setSelectedDealForEdit(null);
		setDialogOpen(true);
	};

	const handleEditDeal = (deal: Deal) => {
		setSelectedDealForEdit(deal);
		setDialogOpen(true);
	};

	const handleDialogSubmit = async (data: any) => {
		try {
			if (selectedDealForEdit) {
				await dispatch(updateDeal({ publicId: selectedDealForEdit.public_id, deal: data })).unwrap();
				enqueueSnackbar('Deal updated successfully', { variant: 'success' });
			} else {
				await dispatch(createDeal(data)).unwrap();
				enqueueSnackbar('Deal created successfully', { variant: 'success' });
			}
			setDialogOpen(false);
			handleRefresh();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to save deal', { variant: 'error' });
		}
	};

	const handleDeleteClick = (deal: Deal) => {
		setDealToDelete(deal);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (dealToDelete) {
			setDeleting(true);
			try {
				await dispatch(deleteDeal(dealToDelete.public_id)).unwrap();
				enqueueSnackbar('Deal deleted successfully', { variant: 'success' });
				setDeleteDialogOpen(false);
				setDealToDelete(null);
				handleRefresh();
			} catch (error: any) {
				enqueueSnackbar(error || 'Failed to delete deal', { variant: 'error' });
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

	const filterFields: FilterField[] = [
		{
			key: 'stage',
			label: 'Stage',
			type: 'single-select',
			options: [
				{ value: 'discovery', label: 'Discovery' },
				{ value: 'qualification', label: 'Qualification' },
				{ value: 'proposal', label: 'Proposal' },
				{ value: 'negotiation', label: 'Negotiation' },
				{ value: 'closed_won', label: 'Closed Won' },
				{ value: 'closed_lost', label: 'Closed Lost' }
			]
		},
		{
			key: 'dealType',
			label: 'Type',
			type: 'single-select',
			options: [
				{ value: 'new_business', label: 'New Business' },
				{ value: 'existing_business', label: 'Existing Business' }
			]
		}
	];

	const columns = [
		{
			id: 'title',
			label: 'Deal Name',
			minWidth: 220,
			sortable: true,
			format: (value: string, row: Deal) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<DealIcon sx={{ color: '#545b64', fontSize: 20 }} />
					<Box>
						<Box sx={{ fontWeight: 700, color: '#007eb9' }}>{value}</Box>
						<Box sx={{ fontSize: '0.75rem', color: '#545b64' }}>{row.company?.name || 'Individual'}</Box>
					</Box>
				</Stack>
			)
		},
		{
			id: 'deal_stage',
			label: 'Stage',
			minWidth: 140,
			sortable: true,
			format: (value: string) => (
				<CRMStatusBadge label={value.replace('_', ' ')} status={value} type="deal" />
			)
		},
		{
			id: 'deal_value',
			label: 'Value',
			minWidth: 140,
			sortable: true,
			format: (value: number, row: Deal) => (
				<Box sx={{ fontWeight: 700 }}>
					{row.currency} {value.toLocaleString()}
				</Box>
			)
		},
		{
			id: 'win_probability',
			label: 'Probability',
			minWidth: 120,
			format: (value: number) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<TrendIcon sx={{ fontSize: 16, color: value >= 70 ? '#1d8102' : '#545b64' }} />
					<Typography variant="body2">{value}%</Typography>
				</Stack>
			)
		},
		{
			id: 'deal_type',
			label: 'Type',
			minWidth: 130,
			format: (value: string) => value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
		},
		{
			id: 'expected_close_date',
			label: 'Expected Close',
			minWidth: 150,
			sortable: true,
			format: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
		},
		{
			id: 'assigned_user',
			label: 'Owner',
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
			format: (_: any, row: Deal) => (
				<CRMRowActions
					row={row}
					onView={() => navigate(`/crm/deals/${row.public_id}`)}
					onEdit={() => handleEditDeal(row)}
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
				sx={{ color: '#545b64', borderColor: '#d5dbdb' }}
			>
				Refresh
			</Button>
			{isManager && (
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={handleAddDeal}
					sx={{
						px: 3,
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' },
						textTransform: 'none',
						fontWeight: 600,
						boxShadow: 'none'
					}}
				>
					New Deal
				</Button>
			)}
		</>
	);

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh', pb: 6 }}>
			<CRMPageHeader
				title="Deals"
				actions={actions}
			/>

			<Container maxWidth="xl" sx={{ mt: 3 }}>
				<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Total Deals"
							value={pipeline?.total_count || 0}
							icon={<DealIcon />}
							color="#007eb9"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Pipeline Value"
							value={`₹${(pipeline?.total_value || 0).toLocaleString()}`}
							icon={<TrendIcon />}
							color="#1d8102"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Closed Won"
							value={pipeline?.stages?.closed_won?.count || 0}
							icon={<PersonIcon />}
							color="#ff9900"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Proposal Stage"
							value={pipeline?.stages?.proposal?.count || 0}
							icon={<AddIcon />}
							color="#ec7211"
						/>
					</Grid>
				</Grid>

				<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<TextField
						size="small"
						placeholder="Search deals..."
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

					<Tooltip title="Filter">
						<IconButton
							onClick={() => setFilterDrawerOpen(true)}
							sx={{
								border: '1px solid #d5dbdb',
								borderRadius: '2px',
								bgcolor: activeFilters.stage || activeFilters.dealType ? '#f5f8fa' : 'white'
							}}
						>
							<FilterIcon fontSize="small" sx={{ color: activeFilters.stage || activeFilters.dealType ? '#ec7211' : '#545b64' }} />
						</IconButton>
					</Tooltip>
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
					emptyMessage="No deals found. Open a new deal to track your sales."
					onRowClick={(row) => navigate(`/crm/deals/${row.public_id}`)}
				/>

				<DealFormDialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					onSubmit={handleDialogSubmit}
					deal={selectedDealForEdit}
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
					title="Delete Deal"
					message={`Are you sure you want to delete deal "${dealToDelete?.title}"? This action cannot be undone.`}
					confirmText="Delete"
					onClose={() => setDeleteDialogOpen(false)}
					onConfirm={handleConfirmDelete}
					loading={deleting}
					severity="error"
				/>
			</Container>
		</Box>
	);
};

export default DealList;
