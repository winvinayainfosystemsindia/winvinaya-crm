import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	TableSortLabel,
	CircularProgress,
	Box,
	Typography
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchTrainingBatches } from '../../../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../../../models/training';
import type { FilterField } from '../../../common/FilterDrawer';
import FilterDrawer from '../../../common/FilterDrawer';
import ConfirmDialog from '../../../common/ConfirmDialog';
import { getBatchFilterFields } from '../BatchFilters';

// Specialized Components
import TrainingTableHeader from './TrainingTableHeader';
import TrainingTableRow from './TrainingTableRow';
import TrainingBatchFormDialog from '../dialogs/TrainingBatchFormDialog';
import ExtendBatchDialog from '../dialogs/ExtendBatchDialog';

// Hooks
import { useTrainingTable } from '../hooks/useTrainingTable';
import { useTrainingActions } from '../hooks/useTrainingActions';

interface TrainingTableProps {
	refreshKey?: number;
}

const TrainingTable: React.FC<TrainingTableProps> = ({ refreshKey }) => {
	const dispatch = useAppDispatch();
	const { batches, loading, total: totalCount } = useAppSelector((state) => state.training);
	const user = useAppSelector((state) => state.auth.user);
	const isAdmin = user?.role === 'admin';

	// Table State Hook
	const {
		searchTerm,
		debouncedSearchTerm,
		page,
		rowsPerPage,
		order,
		orderBy,
		filterDrawerOpen,
		filters,
		setFilterDrawerOpen,
		handleSearch,
		handleChangePage,
		handleChangeRowsPerPage,
		handleRequestSort,
		handleFilterChange,
		clearFilters,
		setPage
	} = useTrainingTable();

	// Actions Hook
	const {
		handleFormSubmit,
		handleExtendConfirm,
		handleDeleteConfirm
	} = useTrainingActions();

	// Local UI State for Dialogs
	const [selectedBatch, setSelectedBatch] = useState<TrainingBatch | undefined>(undefined);
	const [formDialogOpen, setFormDialogOpen] = useState(false);
	const [extendDialogOpen, setExtendDialogOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	const fetchBatchesData = useCallback(() => {
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
	}, [dispatch, page, rowsPerPage, debouncedSearchTerm, order, orderBy, filters]);

	useEffect(() => {
		fetchBatchesData();
	}, [fetchBatchesData, refreshKey]);

	// Action Handlers
	const handleCreateClick = useCallback(() => {
		setSelectedBatch(undefined);
		setFormDialogOpen(true);
	}, []);

	const handleEditClick = useCallback((batch: TrainingBatch) => {
		setSelectedBatch(batch);
		setFormDialogOpen(true);
	}, []);

	const handleExtendClick = useCallback((batch: TrainingBatch) => {
		setSelectedBatch(batch);
		setExtendDialogOpen(true);
	}, []);

	const handleDeleteClick = useCallback((batch: TrainingBatch) => {
		setSelectedBatch(batch);
		setDeleteConfirmOpen(true);
	}, []);

	const onFormSubmit = async (data: Partial<TrainingBatch>) => {
		const success = await handleFormSubmit(data, selectedBatch);
		if (success) setFormDialogOpen(false);
	};

	const onExtendBatch = async (newDate: string, reason: string) => {
		if (selectedBatch) {
			const success = await handleExtendConfirm(selectedBatch, newDate, reason);
			if (success) setExtendDialogOpen(false);
		}
	};

	const onDeleteBatch = async () => {
		if (selectedBatch) {
			const success = await handleDeleteConfirm(selectedBatch);
			if (success) setDeleteConfirmOpen(false);
		}
	};

	const filterFields: FilterField[] = useMemo(() => getBatchFilterFields(), []);

	const activeFilterCount = (filters.status ? 1 : 0) + filters.disability_types.length;

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			<TrainingTableHeader
				searchTerm={searchTerm}
				onSearchChange={handleSearch}
				activeFilterCount={activeFilterCount}
				onFilterOpen={() => setFilterDrawerOpen(true)}
				onRefresh={fetchBatchesData}
				onCreateClick={handleCreateClick}
				loading={loading}
			/>

			<FilterDrawer
				open={filterDrawerOpen}
				onClose={() => setFilterDrawerOpen(false)}
				fields={filterFields}
				activeFilters={filters}
				onFilterChange={handleFilterChange}
				onClearFilters={clearFilters}
				onApplyFilters={() => { setPage(0); setFilterDrawerOpen(false); }}
			/>

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
							<TableCell>Category</TableCell>
							<TableCell>Courses</TableCell>
							<TableCell>Duration</TableCell>
							<TableCell>Ext. Days</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={7} align="center" sx={{ py: 4 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
										<CircularProgress size={20} />
										<Typography variant="body2" color="text.secondary">Fetching batches...</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : batches.length === 0 ? (
							<TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No batches found</TableCell></TableRow>
						) : (
							batches.map((batch) => (
								<TrainingTableRow
									key={batch.public_id}
									batch={batch}
									isAdmin={isAdmin}
									onEdit={handleEditClick}
									onExtend={handleExtendClick}
									onDelete={handleDeleteClick}
								/>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={totalCount}
				page={page}
				onPageChange={(_e, p) => handleChangePage(p)}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={(e) => handleChangeRowsPerPage(parseInt(e.target.value, 10))}
				rowsPerPageOptions={[10, 25, 50]}
				sx={{ borderTop: '1px solid #d5dbdb', bgcolor: '#fafafa' }}
			/>

			<ConfirmDialog
				open={deleteConfirmOpen}
				title="Delete Batch?"
				message={`Are you sure you want to delete "${selectedBatch?.batch_name}"? This action cannot be undone.`}
				onClose={() => setDeleteConfirmOpen(false)}
				onConfirm={onDeleteBatch}
				confirmText="Delete"
				severity="error"
			/>

			<TrainingBatchFormDialog
				open={formDialogOpen}
				onClose={() => setFormDialogOpen(false)}
				onSubmit={onFormSubmit}
				initialData={selectedBatch}
			/>

			<ExtendBatchDialog
				open={extendDialogOpen}
				onClose={() => setExtendDialogOpen(false)}
				onConfirm={onExtendBatch}
				currentCloseDate={selectedBatch?.approx_close_date || selectedBatch?.duration?.end_date || ''}
				batchName={selectedBatch?.batch_name || ''}
			/>
		</Paper>
	);
};

export default TrainingTable;
