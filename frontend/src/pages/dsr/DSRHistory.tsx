import React, { useEffect, useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Chip,
	IconButton,
	Tooltip,
	Collapse,
	CircularProgress,
	Grid,
	TextField,
	MenuItem
} from '@mui/material';
import {
	KeyboardArrowDown as ExpandMoreIcon,
	KeyboardArrowUp as ExpandLessIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { DSREntry, DSRStatus } from '../../models/dsr';
import { DSRStatusValues } from '../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEntries, deleteEntry } from '../../store/slices/dsrSlice';
import useToast from '../../hooks/useToast';
import CustomTablePagination from '../../components/common/CustomTablePagination';

const DSRHistory: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const toast = useToast();

	const { entries, totalEntries: total, loading } = useAppSelector((state) => state.dsr);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [expandedRow, setExpandedRow] = useState<string | null>(null);

	// Filters
	const [status, setStatus] = useState<DSRStatus | ''>('');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');

	useEffect(() => {
		dispatch(fetchEntries({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			date_from: dateFrom || undefined,
			date_to: dateTo || undefined,
			status: (status as DSRStatus) || undefined
		}));
	}, [dispatch, page, rowsPerPage, status, dateFrom, dateTo]);

	const handleDelete = async (publicId: string) => {
		if (window.confirm('Are you sure you want to delete this draft?')) {
			try {
				await dispatch(deleteEntry(publicId)).unwrap();
				toast.success('Draft deleted successfully');
			} catch (error: any) {
				toast.error(error || 'Failed to delete draft');
			}
		}
	};

	const getStatusColor = (s: DSRStatus) => {
		switch (s) {
			case DSRStatusValues.SUBMITTED: return 'primary';
			case DSRStatusValues.APPROVED: return 'success';
			case DSRStatusValues.REJECTED: return 'error';
			default: return 'default';
		}
	};

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary', mb: 0.5 }}>
							DSR History
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Your past Daily Status Reports and their current status
						</Typography>
					</Box>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => navigate('/dashboard/dsr/submission')}
						sx={{ bgcolor: '#232f3e', '&:hover': { bgcolor: '#1a242f' } }}
					>
						New DSR
					</Button>
				</Box>

				{/* Filters */}
				<Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 1 }}>
					<Grid container spacing={2} alignItems="center">
						<Grid size={{ xs: 12, sm: 3 } as any}>
							<TextField
								select
								label="Status"
								fullWidth
								size="small"
								value={status}
								onChange={(e) => setStatus(e.target.value as DSRStatus | '')}
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
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 3 } as any} sx={{ display: 'flex', gap: 1 }}>
							<Button
								variant="outlined"
								onClick={() => dispatch(fetchEntries({
									skip: page * rowsPerPage,
									limit: rowsPerPage,
									date_from: dateFrom || undefined,
									date_to: dateTo || undefined,
									status: (status as DSRStatus) || undefined
								}))}
								startIcon={<RefreshIcon />}
							>
								Refresh
							</Button>
							<Button onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); }}>
								Clear
							</Button>
						</Grid>
					</Grid>
				</Paper>

				<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
					<Table>
						<TableHead sx={{ bgcolor: '#f2f3f3' }}>
							<TableRow>
								<TableCell width="50px" />
								<TableCell sx={{ fontWeight: 700 }}>Report Date</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Total Hours</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
										<CircularProgress size={24} color="inherit" />
									</TableCell>
								</TableRow>
							) : entries.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
										No records found.
									</TableCell>
								</TableRow>
							) : (
								entries.map((entry: DSREntry) => (
									<React.Fragment key={entry.public_id}>
										<TableRow hover>
											<TableCell>
												<IconButton
													size="small"
													onClick={() => setExpandedRow(expandedRow === entry.public_id ? null : entry.public_id)}
												>
													{expandedRow === entry.public_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
												</IconButton>
											</TableCell>
											<TableCell sx={{ fontWeight: 600 }}>{new Date(entry.report_date).toLocaleDateString()}</TableCell>
											<TableCell>
												<Chip
													label={entry.status.toUpperCase()}
													color={getStatusColor(entry.status)}
													size="small"
													variant="outlined"
												/>
											</TableCell>
											<TableCell>
												{entry.items.reduce((sum, item) => sum + item.hours, 0).toFixed(1)} hrs
											</TableCell>
											<TableCell>
												{entry.submitted_at ? new Date(entry.submitted_at).toLocaleString() : 'N/A'}
											</TableCell>
											<TableCell align="right">
												{entry.status === DSRStatusValues.DRAFT && (
													<>
														<Tooltip title="Edit Draft">
															<IconButton size="small" onClick={() => navigate(`/dashboard/dsr/submission?id=${entry.public_id}`)}>
																<EditIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														<IconButton size="small" color="error" onClick={() => handleDelete(entry.public_id)}>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</>
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell sx={{ py: 0 }} colSpan={6}>
												<Collapse in={expandedRow === entry.public_id} timeout="auto" unmountOnExit>
													<Box sx={{ p: 3, bgcolor: '#fcfcfc' }}>
														<Typography variant="subtitle2" gutterBottom fontWeight={700}>
															Activity Breakdown
														</Typography>
														<Table size="small">
															<TableHead>
																<TableRow>
																	<TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
																	<TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
																	<TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
																	<TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
																</TableRow>
															</TableHead>
															<TableBody>
																{entry.items.map((item, idx) => (
																	<TableRow key={idx}>
																		<TableCell>{item.project_name}</TableCell>
																		<TableCell>{item.activity_name}</TableCell>
																		<TableCell>{item.start_time} - {item.end_time} ({item.hours}h)</TableCell>
																		<TableCell>{item.description}</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</Box>
												</Collapse>
											</TableCell>
										</TableRow>
									</React.Fragment>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>

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
