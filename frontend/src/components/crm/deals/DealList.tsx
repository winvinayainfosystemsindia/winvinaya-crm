import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Grid, Stack, IconButton, Tooltip, Typography } from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Handshake as DealIcon,
	TrendingUp as TrendIcon,
	Person as PersonIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDeals, fetchPipelineSummary, createDeal, updateDeal } from '../../../store/slices/dealSlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import DealFormDialog from './DealFormDialog';
import CRMStatsCard from '../common/CRMStatsCard';
import CRMStatusBadge from '../common/CRMStatusBadge';
import type { Deal } from '../../../models/deal';

const DealList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { list, total, pipeline, loading } = useAppSelector((state) => state.deals);
	const { user: currentUser } = useAppSelector((state) => state.auth);

	const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'sales_manager';

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedDealForEdit, setSelectedDealForEdit] = useState<Deal | null>(null);

	useEffect(() => {
		dispatch(fetchDeals({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
		dispatch(fetchPipelineSummary());
	}, [dispatch, page, rowsPerPage, search]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchDeals({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
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
			} else {
				await dispatch(createDeal(data)).unwrap();
			}
			setDialogOpen(false);
			handleRefresh();
		} catch (error) {
			console.error('Failed to save deal:', error);
		}
	};

	const columns = [
		{
			id: 'title',
			label: 'Deal Name',
			minWidth: 220,
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
			format: (value: string) => (
				<CRMStatusBadge label={value.replace('_', ' ')} status={value} type="deal" />
			)
		},
		{
			id: 'deal_value',
			label: 'Value',
			minWidth: 140,
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
					sx={{ px: 3 }}
				>
					New Deal
				</Button>
			)}
		</>
	);

	return (
		<Box>
			<CRMPageHeader
				title="Deals"
				actions={actions}
			/>

			<Grid container spacing={2} sx={{ mb: 4 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Total Deals"
						value={pipeline?.total_count || 0}
						loading={loading}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Pipeline Value"
						value={`₹${(pipeline?.total_value || 0).toLocaleString()}`}
						loading={loading}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Closed Won"
						value={pipeline?.stages?.closed_won?.count || 0}
						loading={loading}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Proposal Stage"
						value={pipeline?.stages?.proposal?.count || 0}
						loading={loading}
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
				emptyMessage="No deals found. Open a new deal to track your sales."
				onRowClick={(row) => handleEditDeal(row)}
			/>

			<DealFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleDialogSubmit}
				deal={selectedDealForEdit}
				loading={loading}
			/>
		</Box>
	);
};

export default DealList;
