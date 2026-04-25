import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import ConfirmDialog from '../../common/ConfirmDialog';
import { useCandidateTable } from '../hooks/useCandidateTable';
import { getCandidateFilterFields } from './CandidateFilters';

import CandidateTableRow from './CandidateTableRow';
import AssignCandidateDialog from '../AssignCandidateDialog';
import { DataTable } from '../../common/table';
import { candidateColumns } from './CandidateTableHead';
import FilterDrawer from '../../common/FilterDrawer';

interface CandidateTableProps {
	onEditCandidate?: (candidateId: string) => void;
	onViewCandidate?: (candidateId: string) => void;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ onEditCandidate, onViewCandidate }) => {
	const {
		candidates,
		loading,
		totalCount,
		user,
		searchTerm,
		page,
		rowsPerPage,
		order,
		orderBy,
		filterDrawerOpen,
		filters,
		filterOptions,
		deleteDialogOpen,
		candidateToDelete,
		deleteLoading,
		assignDialogOpen,
		candidateForAssignment,
		notification,
		fetchCandidatesData,
		handleChangePage,
		handleSearch,
		handleRequestSort,
		handleFilterOpen,
		handleFilterClose,
		handleFilterChange,
		applyFilters,
		clearFilters,
		handleDeleteClick,
		handleDeleteConfirm,
		handleDeleteCancel,
		handleAssignClick,
		handleAssignCancel,
		handleCloseNotification,
		setRowsPerPage
	} = useCandidateTable();

	const activeFilterCount = (
		filters.disability_type.length +
		filters.education_level.length +
		filters.city.length
	);

	const filterFields = getCandidateFilterFields(filterOptions);

	return (
		<>
			<DataTable
				columns={candidateColumns}
				data={candidates}
				loading={loading}
				totalCount={totalCount}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={(newPage) => handleChangePage(null, newPage)}
				onRowsPerPageChange={setRowsPerPage}
				searchTerm={searchTerm}
				onSearchChange={(value) => handleSearch({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
				onRefresh={fetchCandidatesData}
				orderBy={orderBy as any}
				order={order}
				onSortRequest={handleRequestSort as any}
				activeFilterCount={activeFilterCount}
				onFilterOpen={handleFilterOpen}
				renderRow={(candidate) => (
					<CandidateTableRow
						key={candidate.public_id}
						candidate={candidate}
						userRole={user?.role || null}
						onView={(id) => onViewCandidate?.(id)}
						onEdit={(id) => onEditCandidate?.(id)}
						onDelete={handleDeleteClick}
						onAssign={handleAssignClick}
					/>
				)}
			/>

			<FilterDrawer
				open={filterDrawerOpen}
				onClose={handleFilterClose}
				fields={filterFields}
				activeFilters={filters}
				onFilterChange={handleFilterChange}
				onClearFilters={clearFilters}
				onApplyFilters={applyFilters}
			/>

			{/* Dialogs & Notifications */}
			<ConfirmDialog
				open={deleteDialogOpen}
				title="Delete Candidate"
				message={`Are you sure you want to delete "${candidateToDelete?.name}"? This action is permanent and will remove all associated data, documents, and training history.`}
				onClose={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				confirmText="Delete permanently"
				loading={deleteLoading}
				severity="error"
			/>

			<AssignCandidateDialog
				open={assignDialogOpen}
				onClose={handleAssignCancel}
				onSuccess={fetchCandidatesData}
				candidate={candidateForAssignment}
			/>

			<Snackbar
				open={notification.open}
				autoHideDuration={6000}
				onClose={handleCloseNotification}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert
					onClose={handleCloseNotification}
					severity={notification.severity}
					variant="filled"
					sx={{ width: '100%' }}
				>
					{notification.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default CandidateTable;
