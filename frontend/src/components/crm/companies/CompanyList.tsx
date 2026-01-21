import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Grid, Stack, IconButton, Tooltip } from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Business as BusinessIcon,
	Visibility as ViewIcon,
	Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCompanies, fetchCompanyStats, createCompany, updateCompany } from '../../../store/slices/companySlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import CRMStatsCard from '../common/CRMStatsCard';
import CRMStatusBadge from '../common/CRMStatusBadge';
import CompanyFormDialog from './CompanyFormDialog';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';
import type { CompanyCreate, CompanyUpdate, Company } from '../../../models/company';
import { useSnackbar } from 'notistack';

const CompanyList: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total, stats, loading } = useAppSelector((state) => state.companies);

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
					<BusinessIcon sx={{ color: '#545b64', fontSize: 20 }} />
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
			format: (_: any, row: Company) => (
				<Stack direction="row" spacing={1}>
					<Tooltip title="View Details">
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/crm/companies/${row.public_id}`);
							}}
							sx={{ color: '#007eb9' }}
						>
							<ViewIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Edit">
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenEdit(row);
							}}
							sx={{ color: '#545b64' }}
						>
							<EditIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
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
					bgcolor: '#ff9900',
					'&:hover': { bgcolor: '#ec7211' },
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
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
			<Box sx={{ px: { xs: 2, sm: 3 } }}>
				<CRMPageHeader
					title="Companies"
					actions={actions}
				/>

				<Grid container spacing={2} sx={{ mb: 4 }}>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<CRMStatsCard
							label="Total Companies"
							value={stats?.total || 0}
							loading={loading}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<CRMStatsCard
							label="Active Clients"
							value={stats?.by_status?.active || stats?.by_status?.customer || 0}
							loading={loading}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<CRMStatsCard
							label="Prospects"
							value={stats?.by_status?.prospect || 0}
							loading={loading}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<CRMStatsCard
							label="Industries"
							value={stats?.top_industries?.length || 0}
							loading={loading}
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
			</Box>
		</Box>
	);
};

export default CompanyList;
