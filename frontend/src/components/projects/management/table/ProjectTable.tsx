import React from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableContainer,
	useTheme
} from '@mui/material';
import type { DSRProject } from '../../../../models/dsr';
import CustomTablePagination from '../../../common/CustomTablePagination';
import { useProjectTable } from '../hooks/useProjectTable';

// Sub-components
import ProjectTableHeader from './ProjectTableHeader';
import ProjectTableHead from './ProjectTableHead';
import ProjectTableRow from './ProjectTableRow';
import ProjectTableActions from './ProjectTableActions';
import ProjectTableLoader from './ProjectTableLoader';
import ProjectTableEmpty from './ProjectTableEmpty';

interface ProjectTableProps {
	onEdit: (project: DSRProject) => void;
	onDelete: (project: DSRProject) => void;
	refreshKey: number;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
	onEdit,
	onDelete,
	refreshKey
}) => {
	const theme = useTheme();
	const {
		projects,
		loading,
		totalCount,
		searchTerm,
		page,
		rowsPerPage,
		statusFilter,
		filterAnchorEl,
		actionAnchorEl,
		activeProject,
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
	} = useProjectTable(refreshKey);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<Paper sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', borderRadius: 0, overflow: 'hidden' }}>
			<ProjectTableHeader
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
					<ProjectTableHead />
					<TableBody>
						{loading ? (
							<ProjectTableLoader />
						) : projects.length === 0 ? (
							<ProjectTableEmpty />
						) : (
							projects.map((project: DSRProject) => (
								<ProjectTableRow
									key={project.public_id}
									project={project}
									onActionClick={handleActionClick}
									formatDate={formatDate}
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

			<ProjectTableActions
				anchorEl={actionAnchorEl}
				open={actionOpen}
				onClose={handleActionClose}
				activeProject={activeProject}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		</Paper>
	);
};

export default ProjectTable;
