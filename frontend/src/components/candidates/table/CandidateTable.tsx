import React from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableContainer,
	Snackbar,
	Alert
} from '@mui/material';
import ConfirmDialog from '../../common/ConfirmDialog';
import { useCandidateTable } from '../hooks/useCandidateTable';
import { getCandidateFilterFields } from './CandidateFilters';

// Sub-components
import CandidateTableHeader from './CandidateTableHeader';
import CandidateTableHead from './CandidateTableHead';
import CandidateTableRow from './CandidateTableRow';
import CustomTablePagination from '../../common/CustomTablePagination';
import CandidateTableLoader from './CandidateTableLoader';
import CandidateTableEmpty from './CandidateTableEmpty';

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
		notification,
		fetchCandidatesData,
		handleChangePage,
		handleChangeRowsPerPage,
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
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			<CandidateTableHeader
				searchTerm={searchTerm}
				onSearchChange={handleSearch}
				onRefresh={fetchCandidatesData}
				loading={loading}
				activeFilterCount={activeFilterCount}
				filterDrawerOpen={filterDrawerOpen}
				onFilterOpen={handleFilterOpen}
				onFilterClose={handleFilterClose}
				filterFields={filterFields}
				filters={filters}
				onFilterChange={handleFilterChange}
				onClearFilters={clearFilters}
				onApplyFilters={applyFilters}
			/>

			<TableContainer>
				<Table sx={{ minWidth: 650 }} aria-label="candidate table">
					<CandidateTableHead
						order={order}
						orderBy={orderBy}
						onRequestSort={handleRequestSort}
					/>
					<TableBody>
						{loading ? (
							<CandidateTableLoader rowsPerPage={rowsPerPage} />
						) : candidates.length === 0 ? (
							<CandidateTableEmpty />
						) : (
							candidates.map((candidate) => (
								<CandidateTableRow
									key={candidate.public_id}
									candidate={candidate}
									userRole={user?.role || null}
									onView={(id) => onViewCandidate?.(id)}
									onEdit={(id) => onEditCandidate?.(id)}
									onDelete={handleDeleteClick}
								/>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<CustomTablePagination
				count={totalCount}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				onRowsPerPageSelectChange={setRowsPerPage}
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
		</Paper>
	);
};

export default CandidateTable;
