import React, { useMemo, useState } from 'react';
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
	Box,
	CircularProgress,
	LinearProgress,
	Checkbox
} from '@mui/material';
import FilterDrawer from '../../common/FilterDrawer';
import type { CandidateListItem } from '../../../models/candidate';
import { useScreeningTable } from '../hooks/useScreeningTable';
import { getScreeningFilterFields } from '../ScreeningFilters';
import ScreeningTableHeader from './ScreeningTableHeader';
import ScreeningTableRow from './ScreeningTableRow';
import CustomTablePagination from '../../common/CustomTablePagination';
import { AssignCandidatesDialog } from '../dialogs';

interface ScreeningTableProps {
	type: 'unscreened' | 'screened';
	status?: string;
	onAction: (action: 'edit' | 'screen', candidate: CandidateListItem) => void;
	refreshTrigger?: number;
}

const ScreeningTable: React.FC<ScreeningTableProps> = ({ type, status, onAction, refreshTrigger }) => {
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
		setFilterDrawerOpen,
		handleSearch,
		handleChangePage,
		handleChangeRowsPerPage,
		handleRequestSort,
		handleFilterChange,
		handleClearFilters,
		handleApplyFilters,
		setRowsPerPage,
		fetchCandidatesData,
		// Selection
		selected,
		handleSelectAllClick,
		handleSelectClick,
		isSelected,
		clearSelection,
		isManager
	} = useScreeningTable({ type, status, refreshTrigger });

	const [assignDialogOpen, setAssignDialogOpen] = useState(false);

	const filterFields = useMemo(() => getScreeningFilterFields(type, status, filterOptions), [type, status, filterOptions]);

	const activeFilterCount = filterFields.reduce((count, field) => {
		const value = filters[field.key];
		if (field.type === 'multi-select') {
			return count + (Array.isArray(value) ? value.length : 0);
		} else {
			return count + (value ? 1 : 0);
		}
	}, 0);

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
			<ScreeningTableHeader
				type={type}
				searchTerm={searchTerm}
				onSearchChange={handleSearch}
				activeFilterCount={activeFilterCount}
				onFilterOpen={() => setFilterDrawerOpen(true)}
				onRefresh={fetchCandidatesData}
				selectedCount={selected.length}
				onAssign={() => setAssignDialogOpen(true)}
				isManager={isManager}
			/>
			{loading && candidates.length > 0 && <LinearProgress sx={{ height: 2 }} />}

			<FilterDrawer
				open={filterDrawerOpen}
				onClose={() => setFilterDrawerOpen(false)}
				fields={filterFields}
				activeFilters={filters}
				onFilterChange={handleFilterChange}
				onClearFilters={handleClearFilters}
				onApplyFilters={handleApplyFilters}
			/>

			<TableContainer>
				<Table sx={{ minWidth: 650 }} aria-label="screening table">
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							{(() => {
								const headers = [
									{ id: 'name', label: 'Name', hideOnMobile: false },
									{ id: 'phone', label: 'Phone', hideOnMobile: true },
									{ id: 'disability_type', label: 'Disability', hideOnMobile: true },
									{ id: 'education_level', label: 'Education', hideOnMobile: true },
									{ id: 'district', label: 'Location', hideOnMobile: true },
									{ id: 'assigned', label: 'Assigned To', hideOnMobile: true },
									{ id: 'created_at', label: 'Date', hideOnMobile: true },
								];
								if (type !== 'unscreened') {
									headers.push({ id: 'screening_status', label: 'Status', hideOnMobile: false });
								}
								return headers;
							})()
								.filter(h => isManager || h.id !== 'assigned')
								.map((headCell, index) => (
									<TableCell
										key={headCell.id}
										sortDirection={orderBy === headCell.id ? order : false}
										sx={{
											fontWeight: 'bold',
											color: 'text.secondary',
											fontSize: '0.875rem',
											borderBottom: '2px solid #d5dbdb',
											display: headCell.hideOnMobile ? { xs: 'none', md: 'table-cell' } : 'table-cell',
											...(index === 0 && isManager && { pl: 0 })
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center' }}>
											{index === 0 && isManager && (
												<Checkbox
													indeterminate={selected.length > 0 && selected.length < candidates.length}
													checked={candidates.length > 0 && selected.length === candidates.length}
													onChange={handleSelectAllClick}
													size="small"
													sx={{ mr: 1 }}
												/>
											)}
											<TableSortLabel
												active={orderBy === headCell.id}
												direction={orderBy === headCell.id ? order : 'asc'}
												onClick={() => handleRequestSort(headCell.id as keyof CandidateListItem)}
											>
												{headCell.label}
											</TableSortLabel>
										</Box>
									</TableCell>
								))}
							<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s', filter: loading ? 'grayscale(0.5)' : 'none' }}>
						{loading && candidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} align="center" sx={{ py: 4 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
										<CircularProgress size={20} />
										<Typography color="text.secondary">Loading...</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : candidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">No candidates found</Typography>
								</TableCell>
							</TableRow>
						) : (
							candidates.map((candidate) => (
								<ScreeningTableRow
									key={candidate.public_id}
									candidate={candidate}
									type={type}
									onAction={onAction}
									selected={isSelected(candidate.public_id)}
									onSelect={(e) => handleSelectClick(e, candidate.public_id)}
									isManager={isManager}
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

			<AssignCandidatesDialog
				open={assignDialogOpen}
				onClose={() => setAssignDialogOpen(false)}
				selectedCandidateIds={selected}
				onSuccess={() => {
					clearSelection();
					fetchCandidatesData();
				}}
			/>
		</Paper>
	);
};

export default ScreeningTable;
