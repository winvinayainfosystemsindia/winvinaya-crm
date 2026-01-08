import React, { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	TextField,
	Button,
	InputAdornment,
	Typography,
	useTheme,
	Chip,
	TableSortLabel,
	Tooltip,
	Badge,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	CircularProgress
} from '@mui/material';
import { Search, Edit, EventRepeat, Delete, FilterList, Refresh } from '@mui/icons-material';
import { format, isValid } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTrainingBatches, createTrainingBatch, updateTrainingBatch, extendTrainingBatch, deleteTrainingBatch } from '../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../models/training';
import TrainingBatchFormDialog from './form/TrainingBatchFormDialog';
import ExtendBatchDialog from './form/ExtendBatchDialog';
import FilterDrawer, { type FilterField } from '../common/FilterDrawer';

interface TrainingTableProps {
	refreshKey?: number;
}

const TrainingTable: React.FC<TrainingTableProps> = ({ refreshKey }) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { batches, loading, total: totalCount } = useAppSelector((state) => state.training);
	const user = useAppSelector((state) => state.auth.user);
	const isAdmin = user?.role === 'admin';

	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof TrainingBatch>('created_at');

	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [filters, setFilters] = useState({
		status: '' as string,
		disability_types: [] as string[]
	});

	const [dialogOpen, setDialogOpen] = useState(false);
	const [extendDialogOpen, setExtendDialogOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [selectedBatch, setSelectedBatch] = useState<TrainingBatch | undefined>(undefined);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const fetchBatchesData = () => {
		const params: any = {
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: debouncedSearchTerm,
			sortBy: orderBy,
			sortOrder: order
		};
		if (filters.status) params.status = filters.status;
		if (filters.disability_types.length > 0) params.disability_types = filters.disability_types.join(',');

		dispatch(fetchTrainingBatches(params));
	};

	useEffect(() => {
		fetchBatchesData();
	}, [dispatch, page, rowsPerPage, debouncedSearchTerm, order, orderBy, filters, refreshKey]);

	const handleCreateClick = () => {
		setSelectedBatch(undefined);
		setDialogOpen(true);
	};

	const handleEditClick = (batch: TrainingBatch) => {
		setSelectedBatch(batch);
		setDialogOpen(true);
	};

	const handleFormSubmit = async (data: Partial<TrainingBatch>) => {
		try {
			if (selectedBatch) {
				await dispatch(updateTrainingBatch({ publicId: selectedBatch.public_id, data })).unwrap();
			} else {
				await dispatch(createTrainingBatch(data)).unwrap();
			}
		} catch (error) {
			console.error('Failed to save batch:', error);
		}
	};

	const handleExtendClick = (batch: TrainingBatch) => {
		setSelectedBatch(batch);
		setExtendDialogOpen(true);
	};

	const handleExtendConfirm = async (newDate: string, reason: string) => {
		if (selectedBatch) {
			try {
				await dispatch(extendTrainingBatch({ publicId: selectedBatch.public_id, new_close_date: newDate, reason })).unwrap();
			} catch (error) {
				console.error('Failed to extend batch:', error);
			}
		}
	};

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(0);
	};

	const handleRequestSort = (property: keyof TrainingBatch) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleDeleteClick = (batch: TrainingBatch) => {
		setSelectedBatch(batch);
		setDeleteConfirmOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (selectedBatch) {
			try {
				await dispatch(deleteTrainingBatch(selectedBatch.public_id)).unwrap();
				setDeleteConfirmOpen(false);
				setSelectedBatch(undefined);
			} catch (error) {
				console.error('Failed to delete batch:', error);
			}
		}
	};

	const handleFilterOpen = () => setFilterDrawerOpen(true);
	const handleFilterClose = () => setFilterDrawerOpen(false);
	const handleFilterChange = (key: string, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }));
	};
	const clearFilters = () => {
		setFilters({ status: '', disability_types: [] });
		setPage(0);
	};
	const applyFilters = () => {
		setPage(0);
		handleFilterClose();
	};

	const filterFields: FilterField[] = [
		{
			key: 'status',
			label: 'Operational Status',
			type: 'single-select',
			options: [
				{ value: 'planned', label: 'Planned' },
				{ value: 'running', label: 'Running' },
				{ value: 'closed', label: 'Closed' }
			]
		},
		{
			key: 'disability_types',
			label: 'Candidate Disability',
			type: 'multi-select',
			options: [
				{ value: 'Locomotor Disability', label: 'Locomotor Disability' },
				{ value: 'Hearing Impairment', label: 'Hearing Impairment' },
				{ value: 'Visual Impairment', label: 'Visual Impairment' },
				{ value: 'Speech and Language Disability', label: 'Speech and Language Disability' },
				{ value: 'IDD', label: 'IDD' }
			]
		}
	];

	const activeFilterCount = (filters.status ? 1 : 0) + filters.disability_types.length;

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			<Box sx={{
				p: 2,
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				justifyContent: 'space-between',
				alignItems: { xs: 'stretch', sm: 'center' },
				borderBottom: '1px solid #d5dbdb',
				bgcolor: '#fafafa',
				gap: 2
			}}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
					<TextField
						placeholder="Search batches..."
						value={searchTerm}
						onChange={handleSearch}
						size="small"
						sx={{
							maxWidth: { xs: '100%', sm: '350px' },
							'& .MuiOutlinedInput-root': {
								bgcolor: 'white',
								'& fieldset': { borderColor: '#d5dbdb' },
								'&:hover fieldset': { borderColor: theme.palette.primary.main },
							}
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search sx={{ color: 'text.secondary', fontSize: 20 }} />
								</InputAdornment>
							),
						}}
					/>
				</Box>

				<Box sx={{ display: 'flex', gap: 1 }}>
					<Tooltip title="Refresh Data">
						<IconButton
							onClick={fetchBatchesData}
							disabled={loading}
							sx={{
								border: '1px solid #d5dbdb',
								borderRadius: 1,
								color: 'text.secondary',
								'&:hover': {
									borderColor: theme.palette.primary.main,
									color: theme.palette.primary.main,
									bgcolor: 'white'
								}
							}}
						>
							<Refresh fontSize="small" className={loading ? 'spin-animation' : ''} />
						</IconButton>
					</Tooltip>

					<Badge badgeContent={activeFilterCount} color="primary">
						<Button
							variant="outlined"
							startIcon={<FilterList />}
							onClick={handleFilterOpen}
							sx={{
								borderColor: '#d5dbdb',
								color: 'text.secondary',
								textTransform: 'none',
								'&:hover': {
									borderColor: theme.palette.primary.main,
									color: theme.palette.primary.main,
									bgcolor: 'white'
								}
							}}
						>
							Filter
						</Button>
					</Badge>

					<Button
						variant="contained"
						onClick={handleCreateClick}
						sx={{
							bgcolor: '#ec7211',
							color: 'white',
							textTransform: 'none',
							fontWeight: 600,
							'&:hover': {
								bgcolor: '#eb5f07',
							}
						}}
					>
						Create Batch
					</Button>
				</Box>
			</Box>

			<FilterDrawer
				open={filterDrawerOpen}
				onClose={handleFilterClose}
				fields={filterFields}
				activeFilters={filters}
				onFilterChange={handleFilterChange}
				onClearFilters={clearFilters}
				onApplyFilters={applyFilters}
			/>

			<style>
				{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .spin-animation {
                        animation: spin 1s linear infinite;
                    }
                `}
			</style>

			<TableContainer>
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							<TableCell>
								<TableSortLabel
									active={orderBy === 'batch_name'}
									direction={orderBy === 'batch_name' ? order : 'asc'}
									onClick={() => handleRequestSort('batch_name')}
								>
									Batch Name
								</TableSortLabel>
							</TableCell>
							<TableCell>Disability Type</TableCell>
							<TableCell>Courses</TableCell>
							<TableCell>Duration</TableCell>
							<TableCell>Ext. Days</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}><CircularProgress size={20} /><Typography variant="body2" color="text.secondary">Fetching batches...</Typography></Box></TableCell></TableRow>
						) : batches.length === 0 ? (
							<TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No batches found</TableCell></TableRow>
						) : (
							batches.map((batch) => (
								<TableRow key={batch.public_id} sx={{ '&:hover': { bgcolor: '#f5f8fa' } }}>
									<TableCell>
										<Typography variant="body2" sx={{ fontWeight: 500 }}>
											{batch.batch_name}
										</Typography>
									</TableCell>
									<TableCell>
										{batch.disability_type || '-'}
									</TableCell>
									<TableCell>
										{batch.courses?.map((course, idx) => (
											<Chip key={idx} label={course} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
										)) || '-'}
									</TableCell>
									<TableCell>
										{(() => {
											const start = batch.start_date || batch.duration?.start_date;
											const end = batch.approx_close_date || batch.duration?.end_date;
											if (start && end) {
												const dStart = new Date(start);
												const dEnd = new Date(end);
												if (isValid(dStart) && isValid(dEnd)) {
													return (
														<Typography variant="body2" color="text.secondary">
															{format(dStart, 'dd MMM yyyy')} - {format(dEnd, 'dd MMM yyyy')}
														</Typography>
													);
												}
											}
											return '-';
										})()}
									</TableCell>
									<TableCell>
										{batch.total_extension_days ? (
											<Tooltip title={
												<Box sx={{ p: 1 }}>
													<Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Extension History:</Typography>
													{batch.extensions?.map((ext, i) => {
														const extDate = new Date(ext.new_close_date);
														return (
															<Box key={i} sx={{ mb: i === (batch.extensions?.length || 0) - 1 ? 0 : 1, borderLeft: '2px solid #ec7211', pl: 1 }}>
																<Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
																	{isValid(extDate) ? format(extDate, 'dd MMM yyyy') : ext.new_close_date} (+{ext.extension_days}d)
																</Typography>
																<Typography variant="caption" sx={{ fontStyle: 'italic' }}>
																	{ext.reason || 'No reason provided'}
																</Typography>
															</Box>
														);
													})}
												</Box>
											} arrow>
												<Chip
													label={`+${batch.total_extension_days} days`}
													size="small"
													color="warning"
													variant="outlined"
													sx={{ cursor: 'help' }}
												/>
											</Tooltip>
										) : '-'}
									</TableCell>
									<TableCell>
										<Chip
											label={batch.status.toUpperCase()}
											size="small"
											color={
												batch.status === 'running' ? 'success' :
													batch.status === 'planned' ? 'warning' : 'default'
											}
										/>
									</TableCell>
									<TableCell align="right">
										<Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
											<Tooltip title="Extend Batch">
												<IconButton
													size="small"
													onClick={() => handleExtendClick(batch)}
													sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
												>
													<EventRepeat fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Edit Batch">
												<IconButton
													size="small"
													onClick={() => handleEditClick(batch)}
													sx={{ color: 'text.secondary', '&:hover': { color: 'warning.main' } }}
												>
													<Edit fontSize="small" />
												</IconButton>
											</Tooltip>
											{isAdmin && (
												<Tooltip title="Delete Batch">
													<IconButton
														size="small"
														onClick={() => handleDeleteClick(batch)}
														sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
													>
														<Delete fontSize="small" />
													</IconButton>
												</Tooltip>
											)}
										</Box>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={totalCount}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[10, 25, 50]}
				sx={{
					borderTop: '1px solid #d5dbdb',
					bgcolor: '#fafafa'
				}}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteConfirmOpen}
				onClose={() => setDeleteConfirmOpen(false)}
			>
				<DialogTitle sx={{ fontWeight: 600 }}>Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete the batch <strong>{selectedBatch?.batch_name}</strong>?
						This action cannot be undone and will remove all associated data.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 0 }}>
					<Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant="contained"
						color="error"
						sx={{ textTransform: 'none', fontWeight: 600 }}
					>
						Delete Batch
					</Button>
				</DialogActions>
			</Dialog>
			<TrainingBatchFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleFormSubmit}
				initialData={selectedBatch}
			/>
			<ExtendBatchDialog
				open={extendDialogOpen}
				onClose={() => setExtendDialogOpen(false)}
				onConfirm={handleExtendConfirm}
				currentCloseDate={selectedBatch?.approx_close_date || selectedBatch?.duration?.end_date || ''}
				batchName={selectedBatch?.batch_name || ''}
			/>
		</Paper>
	);
};

export default TrainingTable;
