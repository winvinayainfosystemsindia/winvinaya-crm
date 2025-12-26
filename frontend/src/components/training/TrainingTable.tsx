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
	TableSortLabel
} from '@mui/material';
import { Search, Edit } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTrainingBatches, createTrainingBatch, updateTrainingBatch } from '../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../models/training';
import TrainingBatchFormDialog from './form/TrainingBatchFormDialog';

interface TrainingTableProps {
	refreshKey?: number;
}

const TrainingTable: React.FC<TrainingTableProps> = ({ refreshKey }) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { batches, loading } = useAppSelector((state) => state.training);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof TrainingBatch>('created_at');

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedBatch, setSelectedBatch] = useState<TrainingBatch | undefined>(undefined);

	useEffect(() => {
		dispatch(fetchTrainingBatches({ skip: page * rowsPerPage, limit: rowsPerPage }));
	}, [dispatch, page, rowsPerPage, refreshKey]);

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

	const filteredBatches = batches.filter(batch =>
		batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(batch.courses && batch.courses.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
	).sort((a, b) => {
		const isAsc = order === 'asc';
		const aValue = a[orderBy];
		const bValue = b[orderBy];

		if (aValue === null || aValue === undefined) return 1;
		if (bValue === null || bValue === undefined) return -1;

		if (aValue < bValue) return isAsc ? -1 : 1;
		if (aValue > bValue) return isAsc ? 1 : -1;
		return 0;
	});

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			<Box sx={{
				p: 2,
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				justifyContent: 'space-between',
				alignItems: { xs: 'stretch', sm: 'center' },
				borderBottom: '1px solid #d5dbdb',
				bgcolor: '#fafafa'
			}}>
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
				<Button
					variant="contained"
					onClick={handleCreateClick}
					sx={{
						mt: { xs: 2, sm: 0 },
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
							<TableCell>Courses</TableCell>
							<TableCell>Duration</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
						) : filteredBatches.length === 0 ? (
							<TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No batches found</TableCell></TableRow>
						) : (
							filteredBatches.map((batch) => (
								<TableRow key={batch.public_id} sx={{ '&:hover': { bgcolor: '#f5f8fa' } }}>
									<TableCell>
										<Typography variant="body2" sx={{ fontWeight: 500 }}>
											{batch.batch_name}
										</Typography>
									</TableCell>
									<TableCell>
										{batch.courses?.map((course, idx) => (
											<Chip key={idx} label={course} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
										)) || '-'}
									</TableCell>
									<TableCell>
										{batch.duration ? (
											<Typography variant="body2" color="text.secondary">
												{format(new Date(batch.duration.start_date), 'dd MMM yyyy')} - {format(new Date(batch.duration.end_date), 'dd MMM yyyy')}
												<br />
												({batch.duration.weeks} weeks)
											</Typography>
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
										<Button
											size="small"
											variant="outlined"
											startIcon={<Edit />}
											sx={{ textTransform: 'none' }}
											onClick={() => handleEditClick(batch)}
										>
											Edit
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={filteredBatches.length}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[10, 25, 50]}
			/>
			<TrainingBatchFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleFormSubmit}
				initialData={selectedBatch}
			/>
		</Paper>
	);
};

export default TrainingTable;
