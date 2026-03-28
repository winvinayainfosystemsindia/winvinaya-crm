import React from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableContainer,
	Snackbar,
	Alert
} from '@mui/material';
import ConfirmDialog from '../../../common/ConfirmDialog';
import { useJobRoleTable } from '../hooks/useJobRoleTable';
import { getJobRoleFilterFields } from './JobRoleFilters';

// Sub-components
import JobRoleTableHeader from './JobRoleTableHeader';
import JobRoleTableHead from './JobRoleTableHead';
import JobRoleTableRow from './JobRoleTableRow';
import CustomTablePagination from '../../../common/CustomTablePagination';
import JobRoleTableLoader from './JobRoleTableLoader';
import JobRoleTableEmpty from './JobRoleTableEmpty';

interface JobRoleTableProps {
	onEditJobRole: (jobRole: any) => void;
}

const JobRoleTable: React.FC<JobRoleTableProps> = ({ onEditJobRole }) => {
	const {
		jobRoles,
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
		deleteDialogOpen,
		jobRoleToDelete,
		deleteLoading,
		notification,
		fetchJobRolesData,
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
	} = useJobRoleTable();

	const activeFilterCount = (
		(filters.status ? 1 : 0) +
		filters.workplace_type.length +
		filters.job_type.length
	);

	const filterFields = getJobRoleFilterFields();

	return (
		<Paper sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 0 }}>
			<JobRoleTableHeader
				searchTerm={searchTerm}
				onSearchChange={handleSearch}
				onRefresh={fetchJobRolesData}
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

			<TableContainer sx={{ minHeight: 400, overflowX: 'auto' }}>
				<Table stickyHeader size="small" sx={{ minWidth: 900 }}>
					<JobRoleTableHead
						order={order}
						orderBy={orderBy}
						onRequestSort={handleRequestSort}
					/>
					<TableBody>
						{loading ? (
							<JobRoleTableLoader rowsPerPage={rowsPerPage} />
						) : jobRoles.length === 0 ? (
							<JobRoleTableEmpty />
						) : (
							jobRoles.map((role) => (
								<JobRoleTableRow
									key={role.public_id}
									jobRole={role}
									onEdit={onEditJobRole}
									onDelete={handleDeleteClick}
									isAdmin={user?.role === 'admin' || user?.role === 'manager'}
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

			<ConfirmDialog
				open={deleteDialogOpen}
				title="Delete Job Role"
				message={`Are you sure you want to PERMANENTLY delete job role "${jobRoleToDelete?.title}"? This action cannot be undone.`}
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
					sx={{ width: '100%', borderRadius: '2px' }}
				>
					{notification.message}
				</Alert>
			</Snackbar>
		</Paper>
	);
};

export default JobRoleTable;
