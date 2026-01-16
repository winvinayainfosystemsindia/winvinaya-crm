import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Grid, Stack, IconButton, Tooltip } from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Business as BusinessIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCompanies, fetchCompanyStats } from '../../../store/slices/companySlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import CRMStatsCard from '../common/CRMStatsCard';
import CRMStatusBadge from '../common/CRMStatusBadge';

const CompanyList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { list, total, stats, loading } = useAppSelector((state) => state.companies);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');

	useEffect(() => {
		dispatch(fetchCompanies({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
		dispatch(fetchCompanyStats());
	}, [dispatch, page, rowsPerPage, search]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchCompanies({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
		dispatch(fetchCompanyStats());
	};

	const columns = [
		{
			id: 'name',
			label: 'Company Name',
			minWidth: 200,
			format: (value: string) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<BusinessIcon sx={{ color: '#545b64', fontSize: 20 }} />
					<Box sx={{ fontWeight: 700, color: '#007eb9' }}>{value}</Box>
				</Stack>
			)
		},
		{ id: 'status', label: 'Status', minWidth: 120, format: (value: string) => <CRMStatusBadge label={value} status={value} type="company" /> },
		{ id: 'industry', label: 'Industry', minWidth: 150 },
		{ id: 'website', label: 'Website', minWidth: 180, format: (value: string) => value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ color: '#007eb9', textDecoration: 'none' }}>{value}</a> : '-' },
		{ id: 'email', label: 'Email', minWidth: 200 },
		{ id: 'created_at', label: 'Created On', minWidth: 130, format: (value: string) => new Date(value).toLocaleDateString() }
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
			<Button
				variant="contained"
				color="primary"
				startIcon={<AddIcon />}
				sx={{ px: 3 }}
			>
				Add Company
			</Button>
		</>
	);

	return (
		<Box>
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
						value={stats?.by_status?.client || 0}
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
					<IconButton sx={{ border: '1px solid #d5dbdb', borderRadius: '2px', bgcolor: 'white' }}>
						<FilterIcon fontSize="small" sx={{ color: '#545b64' }} />
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
				loading={loading}
				emptyMessage="No companies found. Start by adding your first company."
				onRowClick={(row) => console.log('Clicked Company', row.public_id)}
			/>
		</Box>
	);
};

export default CompanyList;
