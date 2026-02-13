import React, { useMemo } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
} from '@mui/material';
import FilterDrawer from '../../common/FilterDrawer';
import CustomTablePagination from '../../common/CustomTablePagination';
import { useCounselingTable } from '../hooks/useCounselingTable';
import { getCounselingFilterFields } from '../CounselingFilters';
import CounselingTableHeader from './CounselingTableHeader';
import CounselingTableRow from './CounselingTableRow';
import type { CandidateListItem } from '../../../models/candidate';

interface CounselingTableProps {
	type: 'not_counseled' | 'pending' | 'selected' | 'rejected' | 'counseled';
	onAction: (action: 'counsel' | 'edit', candidate: CandidateListItem) => void;
	refreshKey?: number;
}

const CounselingTable: React.FC<CounselingTableProps> = ({ type, onAction, refreshKey }) => {
	const {
		candidates,
		loading,
		totalCount,
		searchTerm,
		page,
		rowsPerPage,
		order,
		orderBy,
		filterDrawerOpen,
		filters,
		filterOptions,
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
		handleRowsPerPageSelectChange
	} = useCounselingTable(type, refreshKey);

	const filterFields = useMemo(() => getCounselingFilterFields(type, filterOptions), [type, filterOptions]);

	const activeFilterCount = useMemo(() => filterFields.reduce((count, field) => {
		const value = filters[field.key];
		if (field.type === 'multi-select') {
			return count + (Array.isArray(value) ? value.length : 0);
		} else {
			return count + (value ? 1 : 0);
		}
	}, 0), [filterFields, filters]);

	// Define table headers dynamically based on type
	const headers = useMemo(() => {
		const cols = [
			{ id: 'name', label: 'Name', hideOnMobile: false },
			{ id: 'phone', label: 'Phone', hideOnMobile: true },
			{ id: 'city', label: 'Location', hideOnMobile: true },
			{ id: 'education_level', label: 'Education', hideOnMobile: true },
			{ id: 'disability_type', label: 'Disability', hideOnMobile: true },
		];
		if (type !== 'not_counseled') {
			cols.push({ id: 'counseling_status', label: 'Status', hideOnMobile: false });
			cols.push(
				{ id: 'counselor_name', label: 'Counselor', hideOnMobile: true },
				{ id: 'counseling_date', label: 'Date', hideOnMobile: true }
			);
		}
		return cols;
	}, [type]);

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
			<CounselingTableHeader
				searchTerm={searchTerm}
				onSearchChange={handleSearch}
				onRefresh={fetchCandidatesData}
				activeFilterCount={activeFilterCount}
				filterDrawerOpen={filterDrawerOpen}
				onFilterOpen={handleFilterOpen}
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

			<TableContainer>
				<Table sx={{ minWidth: 650 }} aria-label="counseling table">
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							{headers.map((headCell) => (
								<TableCell
									key={headCell.id}
									sortDirection={orderBy === headCell.id ? order : false}
									sx={{
										fontWeight: 'bold',
										color: 'text.secondary',
										fontSize: '0.875rem',
										borderBottom: '2px solid #d5dbdb',
										display: headCell.hideOnMobile ? { xs: 'none', md: 'table-cell' } : 'table-cell'
									}}
								>
									<TableSortLabel
										active={orderBy === headCell.id}
										direction={orderBy === headCell.id ? order : 'asc'}
										onClick={() => handleRequestSort(headCell.id as keyof CandidateListItem)}
									>
										{headCell.label}
									</TableSortLabel>
								</TableCell>
							))}
							<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">Loading...</Typography>
								</TableCell>
							</TableRow>
						) : candidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">No candidates found</Typography>
								</TableCell>
							</TableRow>
						) : (
							candidates.map((candidate) => (
								<CounselingTableRow
									key={candidate.public_id}
									candidate={candidate}
									type={type}
									onAction={onAction}
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
				onRowsPerPageSelectChange={handleRowsPerPageSelectChange}
			/>
		</Paper>
	);
};

export default React.memo(CounselingTable);
