import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Grid, Stack, IconButton, Tooltip, LinearProgress, Typography } from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	FilterCenterFocus as LeadIcon,
	Person as PersonIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchLeads, fetchLeadStats, createLead, updateLead } from '../../../store/slices/leadSlice';
import CRMPageHeader from '../common/CRMPageHeader';
import LeadFormDialog from './LeadFormDialog';
import CRMTable from '../common/CRMTable';
import CRMStatsCard from '../common/CRMStatsCard';
import CRMStatusBadge from '../common/CRMStatusBadge';
import type { Lead } from '../../../models/lead';

const LeadList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { list, total, stats, loading } = useAppSelector((state) => state.leads);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);

	useEffect(() => {
		dispatch(fetchLeads({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
		dispatch(fetchLeadStats());
	}, [dispatch, page, rowsPerPage, search]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchLeads({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
		dispatch(fetchLeadStats());
	};

	const handleAddLead = () => {
		setSelectedLeadForEdit(null);
		setDialogOpen(true);
	};

	const handleEditLead = (lead: Lead) => {
		setSelectedLeadForEdit(lead);
		setDialogOpen(true);
	};

	const handleDialogSubmit = async (data: any) => {
		try {
			if (selectedLeadForEdit) {
				await dispatch(updateLead({ publicId: selectedLeadForEdit.public_id, lead: data })).unwrap();
			} else {
				await dispatch(createLead(data)).unwrap();
			}
			setDialogOpen(false);
			handleRefresh();
		} catch (error) {
			console.error('Failed to save lead:', error);
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 70) return '#1d8102';
		if (score >= 40) return '#ff9900';
		return '#d13212';
	};

	const columns = [
		{
			id: 'title',
			label: 'Lead Title',
			minWidth: 220,
			format: (value: string, row: Lead) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<LeadIcon sx={{ color: '#545b64', fontSize: 20 }} />
					<Box>
						<Box sx={{ fontWeight: 700, color: '#007eb9' }}>{value}</Box>
						<Box sx={{ fontSize: '0.75rem', color: '#545b64' }}>{row.company?.name || 'Individual'}</Box>
					</Box>
				</Stack>
			)
		},
		{
			id: 'lead_status',
			label: 'Status',
			minWidth: 120,
			format: (value: string) => (
				<CRMStatusBadge label={value} status={value} type="lead" />
			)
		},
		{
			id: 'lead_score',
			label: 'Score',
			minWidth: 120,
			format: (value: number) => (
				<Box sx={{ width: '100%' }}>
					<Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, color: getScoreColor(value) }}>
							{value}%
						</Typography>
					</Stack>
					<LinearProgress
						variant="determinate"
						value={value}
						sx={{
							height: 4,
							borderRadius: 2,
							bgcolor: '#f2f3f3',
							'& .MuiLinearProgress-bar': {
								bgcolor: getScoreColor(value)
							}
						}}
					/>
				</Box>
			)
		},
		{
			id: 'assigned_to_user',
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
			id: 'estimated_value',
			label: 'Est. Value',
			minWidth: 140,
			format: (value: number, row: Lead) => value ? `${row.currency} ${value.toLocaleString()}` : '-'
		},
		{
			id: 'expected_close_date',
			label: 'Close Date',
			minWidth: 130,
			format: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
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
			<Button
				variant="contained"
				color="primary"
				startIcon={<AddIcon />}
				onClick={handleAddLead}
				sx={{ px: 3 }}
			>
				Add Lead
			</Button>
		</>
	);

	return (
		<Box>
			<CRMPageHeader
				title="Leads"
				actions={actions}
			/>

			<Grid container spacing={2} sx={{ mb: 4 }}>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Total Active Leads"
						value={stats?.total || 0}
						loading={loading}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Qualified Leads"
						value={stats?.by_status?.qualified || 0}
						loading={loading}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Avg. Score"
						value={`${stats?.average_score?.toFixed(1) || 0}%`}
						loading={loading}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<CRMStatsCard
						label="Conversion Rate"
						value={`${stats?.conversion_rate || 0}%`}
						loading={loading}
					/>
				</Grid>
			</Grid>

			<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<TextField
					size="small"
					placeholder="Search leads..."
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
				emptyMessage="No leads found. Start by adding a new lead."
				onRowClick={(row) => handleEditLead(row)}
			/>

			<LeadFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleDialogSubmit}
				lead={selectedLeadForEdit}
				loading={loading}
			/>
		</Box>
	);
};

export default LeadList;
