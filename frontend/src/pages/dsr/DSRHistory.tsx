import React from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	Button,
	Grid,
	TextField,
	MenuItem
} from '@mui/material';
import {
	Add as AddIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DSRStatusValues } from '../../models/dsr';
import type { DSRStatus } from '../../models/dsr';
import { useDSRHistory } from '../../components/projects/dsr/hooks/useDSRHistory';
import HistoryTable from '../../components/projects/dsr/history/HistoryTable';
import CustomTablePagination from '../../components/common/CustomTablePagination';

const DSRHistory: React.FC = () => {
	const navigate = useNavigate();
	const {
		entries,
		total,
		loading,
		page,
		setPage,
		rowsPerPage,
		setRowsPerPage,
		expandedRow,
		setExpandedRow,
		status,
		setStatus,
		dateFrom,
		setDateFrom,
		dateTo,
		setDateTo,
		handleDelete,
		handleClearFilters,
		fetchHistory
	} = useDSRHistory();

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="xl">
				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h4" sx={{ fontWeight: 300, color: '#232f3e', mb: 0.5, letterSpacing: '-0.01em' }}>
							DSR History
						</Typography>
						<Typography variant="body2" sx={{ color: '#5f6368' }}>
							Your past Daily Status Reports and their current status
						</Typography>
					</Box>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => navigate('/dashboard/dsr/submission')}
						sx={{
							bgcolor: '#232f3e',
							'&:hover': { bgcolor: '#1a242f' },
							borderRadius: '2px',
							textTransform: 'none',
							fontWeight: 700,
							px: 3
						}}
					>
						New DSR
					</Button>
				</Box>

				{/* Filters */}
				<Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '2px', border: '1px solid #d5dbdb' }}>
					<Grid container spacing={2} alignItems="center">
						<Grid size={{ xs: 12, sm: 3 } as any}>
							<TextField
								select
								label="Status"
								fullWidth
								size="small"
								value={status}
								onChange={(e) => setStatus(e.target.value as DSRStatus | '')}
								sx={{ '& .MuiInputBase-root': { borderRadius: '2px' } }}
							>
								<MenuItem value="">All Statuses</MenuItem>
								{Object.values(DSRStatusValues).map(s => (
									<MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={{ xs: 12, sm: 3 } as any}>
							<TextField
								label="From Date"
								type="date"
								fullWidth
								size="small"
								value={dateFrom}
								onChange={(e) => setDateFrom(e.target.value)}
								InputLabelProps={{ shrink: true }}
								sx={{ '& .MuiInputBase-root': { borderRadius: '2px' } }}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 3 } as any}>
							<TextField
								label="To Date"
								type="date"
								fullWidth
								size="small"
								value={dateTo}
								onChange={(e) => setDateTo(e.target.value)}
								InputLabelProps={{ shrink: true }}
								sx={{ '& .MuiInputBase-root': { borderRadius: '2px' } }}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 3 } as any} sx={{ display: 'flex', gap: 1 }}>
							<Button
								variant="outlined"
								onClick={fetchHistory}
								startIcon={<RefreshIcon />}
								size="small"
								sx={{
									color: '#232f3e',
									borderColor: '#d5dbdb',
									textTransform: 'none',
									fontWeight: 700,
									borderRadius: '2px',
									'&:hover': { bgcolor: '#f3f3f3', borderColor: '#aab7bd' }
								}}
							>
								Refresh
							</Button>
							<Button
								onClick={handleClearFilters}
								size="small"
								sx={{ textTransform: 'none', color: '#5f6368', fontWeight: 600 }}
							>
								Clear
							</Button>
						</Grid>
					</Grid>
				</Paper>

				<HistoryTable
					entries={entries}
					loading={loading}
					expandedRow={expandedRow}
					onToggleReplace={setExpandedRow}
					onDelete={handleDelete}
				/>

				<CustomTablePagination
					count={total}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(_, p) => setPage(p)}
					onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
					onRowsPerPageSelectChange={(rows) => { setRowsPerPage(rows); setPage(0); }}
				/>
			</Container>
		</Box>
	);
};

export default DSRHistory;
