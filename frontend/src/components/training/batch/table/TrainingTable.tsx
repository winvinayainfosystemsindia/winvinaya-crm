import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchTrainingBatches } from '../../../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../../../models/training';
import type { FilterField } from '../../../common/FilterDrawer';
import FilterDrawer from '../../../common/FilterDrawer';
import ConfirmationDialog from '../../../common/dialogbox/ConfirmationDialog';
import DataTable, { type ColumnDefinition } from '../../../common/table/DataTable';
import { getBatchFilterFields } from '../BatchFilters';

// Specialized Components
import TrainingTableRow from './TrainingTableRow';
import TrainingBatchFormDialog from '../form/TrainingBatchFormDialog';
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
	const isAdmin = user?.role === 'admin' || user?.is_superuser;
	const isManager = user?.role === 'manager';
	const canManage = isAdmin || isManager;

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
		handleRequestSort,
		handleFilterChange,
		clearFilters,
		handleRowsPerPageSelectChange,
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
	const [isDeleting, setIsDeleting] = useState(false);

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
			setIsDeleting(true);
			try {
				const success = await handleDeleteConfirm(selectedBatch);
				if (success) setDeleteConfirmOpen(false);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const filterFields: FilterField[] = useMemo(() => getBatchFilterFields(), []);

	const columns: ColumnDefinition<TrainingBatch>[] = useMemo(() => [
		{ id: 'batch_name', label: 'Batch Name', sortable: true },
		{ id: 'disability_types' as any, label: 'Category', sortable: false },
		{ id: 'tag' as any, label: 'Tag', sortable: false },
		{ id: 'domain' as any, label: 'Domain', sortable: false },
		{ id: 'training_mode' as any, label: 'Mode', sortable: false },
		{ id: 'courses' as any, label: 'Courses', sortable: false },
		{ id: 'duration' as any, label: 'Duration', sortable: false },
		{ id: 'total_extension_days' as any, label: 'Ext. Days', sortable: false },
		{ id: 'status', label: 'Status', sortable: false },
		{ id: 'actions', label: 'Actions', sortable: false, align: 'right' },
	], []);

	const activeFilterCount = (filters.status ? 1 : 0) + filters.disability_types.length;

	return (
		<>
			<DataTable
				columns={columns}
				data={batches}
				loading={loading}
				totalCount={totalCount}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={(_e, p) => handleChangePage(p)}
				onRowsPerPageChange={handleRowsPerPageSelectChange}
				searchTerm={searchTerm}
				onSearchChange={handleSearch}
				searchPlaceholder="Search batches..."
				orderBy={orderBy}
				order={order}
				onSortRequest={handleRequestSort as any}
				onRefresh={fetchBatchesData}
				onFilterOpen={() => setFilterDrawerOpen(true)}
				activeFilterCount={activeFilterCount}
				onCreateClick={handleCreateClick}
				canCreate={canManage}
				createButtonText="Create Batch"
				renderRow={(batch) => (
					<TrainingTableRow
						key={batch.public_id}
						batch={batch}
						isAdmin={!!isAdmin}
						canEdit={!!canManage}
						onEdit={handleEditClick}
						onExtend={handleExtendClick}
						onDelete={handleDeleteClick}
					/>
				)}
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

			<ConfirmationDialog
				open={deleteConfirmOpen}
				title="Delete Batch?"
				message={`Are you sure you want to delete "${selectedBatch?.batch_name}"? This action cannot be undone.`}
				onClose={() => setDeleteConfirmOpen(false)}
				onConfirm={onDeleteBatch}
				confirmLabel="Delete"
				severity="error"
				loading={isDeleting}
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
		</>
	);
};

export default TrainingTable;
