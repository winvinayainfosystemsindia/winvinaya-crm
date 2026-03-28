import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	TextField,
	InputAdornment,
	Stack,
	IconButton,
	Tooltip,
	Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Business as BusinessIcon,
	Category as IndustryIcon,
	Groups as TeamIcon,
	Assessment as StatsIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCompanies, fetchCompanyStats, createCompany, updateCompany, deleteCompany } from '../../../store/slices/companySlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import CRMStatusBadge from '../common/CRMStatusBadge';
import CompanyFormDialog from './CompanyFormDialog';
import ConfirmDialog from '../../common/ConfirmDialog';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';
import StatCard from '../../common/StatCard';
import CRMRowActions from '../common/CRMRowActions';
import CRMAvatar from '../common/CRMAvatar';
import type { CompanyCreate, CompanyUpdate, Company } from '../../../models/company';
import { useSnackbar } from 'notistack';

interface CompanyListProps {
	title?: string;
	subtitle?: string;
}

const CompanyList: React.FC<CompanyListProps> = ({ title = "Companies", subtitle }) => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total, loading } = useAppSelector((state) => state.companies);
	const { user } = useAppSelector((state) => state.auth);
	const isAdmin = user?.role === 'admin';

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		dispatch(fetchCompanies({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
		dispatch(fetchCompanyStats());
	}, [dispatch, page, rowsPerPage, search, sortBy, sortOrder, activeFilters]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchCompanies({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
		dispatch(fetchCompanyStats());
	};

	const handleOpenAdd = () => {
		setSelectedCompany(null);
		setDialogOpen(true);
	};

	const handleOpenEdit = (company: Company) => {
		setSelectedCompany(company);
		setDialogOpen(true);
	};

	const handleFormSubmit = async (data: CompanyCreate | CompanyUpdate) => {
		setFormLoading(true);
		try {
			if (selectedCompany) {
				await dispatch(updateCompany({ publicId: selectedCompany.public_id, company: data as CompanyUpdate })).unwrap();
				enqueueSnackbar('Company updated successfully', { variant: 'success' });
			} else {
				await dispatch(createCompany(data as CompanyCreate)).unwrap();
				enqueueSnackbar('Company created successfully', { variant: 'success' });
			}
			setDialogOpen(false);
			handleRefresh();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to save company', { variant: 'error' });
		} finally {
			setFormLoading(false);
		}
	};

	const handleDeleteClick = (company: Company) => {
		setSelectedCompany(company);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!selectedCompany) return;
		setDeleting(true);
		try {
			await dispatch(deleteCompany(selectedCompany.public_id)).unwrap();
			enqueueSnackbar('Company deleted successfully', { variant: 'success' });
			setDeleteDialogOpen(false);
			handleRefresh();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to delete company', { variant: 'error' });
		} finally {
			setDeleting(false);
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
			key: 'status',
			label: 'Status',
			type: 'single-select',
			options: [
				{ value: 'prospect', label: 'Prospect' },
				{ value: 'customer', label: 'Customer' },
				{ value: 'active', label: 'Active' },
				{ value: 'inactive', label: 'Inactive' }
			]
		},
		{
			key: 'industry',
			label: 'Industry',
			type: 'single-select',
			options: [
				{ value: 'Technology', label: 'Technology' },
				{ value: 'Finance', label: 'Finance' },
				{ value: 'Healthcare', label: 'Healthcare' },
				{ value: 'Education', label: 'Education' },
				{ value: 'Manufacturing', label: 'Manufacturing' },
				{ value: 'Retail', label: 'Retail' },
				{ value: 'Services', label: 'Services' },
				{ value: 'Other', label: 'Other' }
			]
		}
	];

	const columns = [
		{
			id: 'name',
			label: 'Company Name',
			minWidth: 200,
			sortable: true,
			format: (value: string) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<CRMAvatar name={value} size={28} />
					<Box sx={{ fontWeight: 700, color: '#007eb9' }}>{value}</Box>
				</Stack>
			)
		},
		{ id: 'status', label: 'Status', minWidth: 120, sortable: true, format: (value: string) => <CRMStatusBadge label={value} status={value} type="company" /> },
		{ id: 'industry', label: 'Industry', minWidth: 150, sortable: true },
		{ id: 'website', label: 'Website', minWidth: 180, format: (value: string) => value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ color: '#007eb9', textDecoration: 'none' }}>{value}</a> : '-' },
		{ id: 'email', label: 'Email', minWidth: 200 },
		{ id: 'created_at', label: 'Created On', minWidth: 130, sortable: true, format: (value: string) => new Date(value).toLocaleDateString() },
		{
			id: 'actions',
			label: 'Actions',
			minWidth: 100,
			align: 'right' as const,
			format: (_: any, row: Company) => (
				<CRMRowActions
					row={row}
					onView={() => navigate(`/crm/companies/${row.public_id}`)}
					onEdit={() => handleOpenEdit(row)}
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
			<Button
				variant="contained"
				color="primary"
				startIcon={<AddIcon />}
				onClick={handleOpenAdd}
				sx={{
					px: 3,
					bgcolor: '#ec7211',
					'&:hover': { bgcolor: '#eb5f07' },
					textTransform: 'none',
					fontWeight: 600,
					boxShadow: 'none'
				}}
			>
				Add Company
			</Button>
		</>
	);

	return (
		<>
			<CRMPageHeader
				title={title}
				subtitle={subtitle}
				actions={actions}
			/>

			<Box sx={{ mt: 3 }}>
				<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Total Companies"
							value={list.length}
							icon={<BusinessIcon />}
							color="#007eb9"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Active Clients"
							value={list.filter(c => c.status === 'active' || c.status === 'customer').length}
							icon={<TeamIcon />}
							color="#1d8102"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Prospects"
							value={list.filter(c => c.status === 'prospect').length}
							icon={<StatsIcon />}
							color="#ec7211"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Industries"
							value={new Set(list.map(c => c.industry).filter(Boolean)).size}
							icon={<IndustryIcon />}
							color="#ff9900"
						/>
					</Grid>
				</Grid>

				<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<TextField
						size="small"
						placeholder="Search companies..."
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
								bgcolor: activeFilters.status || activeFilters.industry ? '#f5f8fa' : 'white'
							}}
						>
							<FilterIcon fontSize="small" sx={{ color: activeFilters.status || activeFilters.industry ? '#ec7211' : '#545b64' }} />
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
					emptyMessage="No companies found. Start by adding your first company."
					onRowClick={(row) => navigate(`/crm/companies/${row.public_id}`)}
				/>

				<CompanyFormDialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					onSubmit={handleFormSubmit}
					company={selectedCompany}
					loading={formLoading}
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
					title="Delete Company"
					message={`Are you sure you want to delete "${selectedCompany?.name}"? This will remove all associated data and cannot be undone.`}
					confirmText="Delete"
					onClose={() => setDeleteDialogOpen(false)}
					onConfirm={handleDeleteConfirm}
					loading={deleting}
					severity="error"
				/>
			</Box>
		</>
	);
};

export default CompanyList;
