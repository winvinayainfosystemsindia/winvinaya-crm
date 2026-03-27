import React, { useState } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableContainer,
	useTheme
} from '@mui/material';
import type { DSRActivity } from '../../../../models/dsr';
import CustomTablePagination from '../../../common/CustomTablePagination';
import { useActivityTable } from '../hooks/useActivityTable';

// Sub-components
import ActivityTableHeader from './ActivityTableHeader';
import ActivityTableHead from './ActivityTableHead';
import ActivityTableRow from './ActivityTableRow';
import ActivityTableActions from './ActivityTableActions';
import ActivityTableLoader from './ActivityTableLoader';
import ActivityTableEmpty from './ActivityTableEmpty';
import ConfirmDialog from '../../../common/ConfirmDialog';

interface ActivityTableProps {
	projectId: string;
	onEdit: (activity: DSRActivity) => void;
	onDelete: (activity: DSRActivity) => void;
	refreshKey: number;
	canEdit?: boolean;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
	projectId,
	onEdit,
	onDelete,
	refreshKey,
	canEdit = false
}) => {
	const theme = useTheme();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const {
		activities,
		loading,
		totalCount,
		searchTerm,
		page,
		rowsPerPage,
		statusFilter,
		filterAnchorEl,
		actionAnchorEl,
		activeActivity,
		filterOpen,
		actionOpen,
		handlePageChange,
		handleRowsPerPageChange,
		handleSearch,
		handleFilterClick,
		handleFilterClose,
		handleStatusSelect,
		handleActionClick,
		handleActionClose,
		handleRefresh,
		handleSelectAll,
		handleToggleSelect,
		handleBulkDelete,
		selectedIds,
		setRowsPerPage
	} = useActivityTable(projectId, refreshKey);

	return (
		<Paper sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', borderRadius: 0, overflow: 'hidden' }}>
			<ActivityTableHeader
				searchTerm={searchTerm}
				onSearchChange={handleSearch}
				onRefresh={handleRefresh}
				statusFilter={statusFilter}
				filterAnchorEl={filterAnchorEl}
				filterOpen={filterOpen}
				onFilterClick={handleFilterClick}
				onFilterClose={handleFilterClose}
				onStatusSelect={handleStatusSelect}
				selectedCount={selectedIds.size}
				onBulkDelete={() => setConfirmOpen(true)}
			/>

			<TableContainer>
				<Table size="small">
					<ActivityTableHead 
						canEdit={canEdit} 
						rowCount={activities.length}
						numSelected={selectedIds.size}
						onSelectAllClick={(e) => handleSelectAll(e.target.checked)}
					/>
					<TableBody>
						{loading ? (
							<ActivityTableLoader />
						) : activities.length === 0 ? (
							<ActivityTableEmpty />
						) : (
							activities.map((activity) => (
								<ActivityTableRow
									key={activity.public_id}
									activity={activity}
									onActionClick={handleActionClick}
									canEdit={canEdit}
									isSelected={selectedIds.has(activity.public_id)}
									onToggleSelect={() => handleToggleSelect(activity.public_id)}
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
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
				onRowsPerPageSelectChange={setRowsPerPage}
			/>

			<ActivityTableActions
				anchorEl={actionAnchorEl}
				open={actionOpen}
				onClose={handleActionClose}
				activeActivity={activeActivity}
				onEdit={onEdit}
				onDelete={onDelete}
			/>

			<ConfirmDialog
				open={confirmOpen}
				title="Delete Activities"
				message={`Are you sure you want to delete ${selectedIds.size} selected activit${selectedIds.size === 1 ? 'y' : 'ies'}? This will permanently remove them if they are not referenced in any DSR entries.`}
				loading={loading}
				onClose={() => setConfirmOpen(false)}
				onConfirm={async () => {
					await handleBulkDelete();
					setConfirmOpen(false);
				}}
				severity="error"
			/>
		</Paper>
	);
};

export default ActivityTable;
