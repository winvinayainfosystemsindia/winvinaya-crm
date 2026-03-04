import React from 'react';
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

interface ActivityTableProps {
	projectId: string;
	onEdit: (activity: DSRActivity) => void;
	onDelete: (activity: DSRActivity) => void;
	refreshKey: number;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
	projectId,
	onEdit,
	onDelete,
	refreshKey
}) => {
	const theme = useTheme();
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
			/>

			<TableContainer>
				<Table size="small">
					<ActivityTableHead />
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
		</Paper>
	);
};

export default ActivityTable;
