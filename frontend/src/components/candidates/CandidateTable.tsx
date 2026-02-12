import React, { useState, useEffect, useCallback } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableContainer,
	Snackbar,
	Alert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidates } from '../../store/slices/candidateSlice';
import type { CandidateListItem } from '../../models/candidate';
import type { FilterField } from '../common/FilterDrawer';
import candidateService from '../../services/candidateService';
import ConfirmDialog from '../common/ConfirmDialog';

// Sub-components
import CandidateTableHeader from './table/CandidateTableHeader';
import CandidateTableHead from './table/CandidateTableHead';
import CandidateTableRow from './table/CandidateTableRow';
import CandidateTablePagination from './table/CandidateTablePagination';
import CandidateTableLoader from './table/CandidateTableLoader';
import CandidateTableEmpty from './table/CandidateTableEmpty';

interface CandidateTableProps {
	onEditCandidate?: (candidateId: string) => void;
	onViewCandidate?: (candidateId: string) => void;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ onEditCandidate, onViewCandidate }) => {
	const dispatch = useAppDispatch();
	const { list: candidates, loading, total: totalCount } = useAppSelector((state) => state.candidates);
	const { user } = useAppSelector((state) => state.auth);

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof CandidateListItem>('created_at');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

	// Filter state
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [filters, setFilters] = useState({
		disability_type: [] as string[],
		education_level: [] as string[],
		city: [] as string[],
		counseling_status: '' as string
	});
	const [filterOptions, setFilterOptions] = useState<{
		disability_types: string[];
		education_levels: string[];
		cities: string[];
		counseling_statuses: string[];
	}>({ disability_types: [], education_levels: [], cities: [], counseling_statuses: [] });

	// Delete state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string } | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [notification, setNotification] = useState<{
		open: boolean;
		message: string;
		severity: 'success' | 'error';
	}>({ open: false, message: '', severity: 'success' });

	const fetchCandidatesData = useCallback(async () => {
		const filterParams: Record<string, unknown> = {
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: debouncedSearchTerm,
			sortBy: orderBy,
			sortOrder: order
		};

		if (filters.disability_type.length > 0) {
			filterParams.disability_types = filters.disability_type.join(',');
		}
		if (filters.education_level.length > 0) {
			filterParams.education_levels = filters.education_level.join(',');
		}
		if (filters.city.length > 0) {
			filterParams.cities = filters.city.join(',');
		}
		if (filters.counseling_status) {
			filterParams.counseling_status = filters.counseling_status;
		}

		dispatch(fetchCandidates(filterParams));
	}, [page, rowsPerPage, debouncedSearchTerm, orderBy, order, filters, dispatch]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	useEffect(() => {
		fetchCandidatesData();
	}, [fetchCandidatesData]);

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number>) => {
		setRowsPerPage(parseInt(event.target.value as string, 10));
		setPage(0);
	};

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(0);
	};

	const handleRequestSort = (property: keyof CandidateListItem) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	useEffect(() => {
		const fetchFilterOptions = async () => {
			try {
				const options = await candidateService.getFilterOptions();
				setFilterOptions(options);
			} catch (error) {
				console.error('Failed to fetch filter options:', error);
			}
		};
		fetchFilterOptions();
	}, []);

	const handleFilterOpen = () => setFilterDrawerOpen(true);
	const handleFilterClose = () => setFilterDrawerOpen(false);
	const handleFilterChange = (key: string, value: unknown) => setFilters(prev => ({ ...prev, [key]: value }));

	const applyFilters = () => {
		setPage(0);
		handleFilterClose();
	};

	const clearFilters = () => {
		setFilters({
			disability_type: [],
			education_level: [],
			city: [],
			counseling_status: ''
		});
		setPage(0);
	};

	// Delete handlers
	const handleDeleteClick = (candidate: CandidateListItem) => {
		setCandidateToDelete({ id: candidate.public_id, name: candidate.name });
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!candidateToDelete) return;

		setDeleteLoading(true);
		try {
			await candidateService.delete(candidateToDelete.id);
			setNotification({
				open: true,
				message: `Candidate "${candidateToDelete.name}" deleted successfully`,
				severity: 'success'
			});
			fetchCandidatesData(); // Refresh list
		} catch (error: any) {
			console.error('Delete failed:', error);
			setNotification({
				open: true,
				message: error.response?.data?.detail || 'Failed to delete candidate',
				severity: 'error'
			});
		} finally {
			setDeleteLoading(false);
			setDeleteDialogOpen(false);
			setCandidateToDelete(null);
		}
	};

	const handleCloseNotification = () => {
		setNotification(prev => ({ ...prev, open: false }));
	};

	const activeFilterCount = (
		filters.disability_type.length +
		filters.education_level.length +
		filters.city.length +
		(filters.counseling_status ? 1 : 0)
	);

	const filterFields: FilterField[] = [
		{
			key: 'disability_type',
			label: 'Disability Type',
			type: 'multi-select',
			options: filterOptions.disability_types.map(type => ({ value: type, label: type }))
		},
		{
			key: 'education_level',
			label: 'Education/Degree',
			type: 'multi-select',
			options: filterOptions.education_levels.map(edu => ({ value: edu, label: edu }))
		},
		{
			key: 'counseling_status',
			label: 'Counseling Status',
			type: 'single-select',
			options: filterOptions.counseling_statuses.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))
		},
		{
			key: 'city',
			label: 'Location (City)',
			type: 'multi-select',
			options: filterOptions.cities.map(city => ({ value: city, label: city }))
		}
	];

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

			<CandidateTablePagination
				totalCount={totalCount}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>

			{/* Dialogs & Notifications */}
			<ConfirmDialog
				open={deleteDialogOpen}
				title="Delete Candidate"
				message={`Are you sure you want to delete "${candidateToDelete?.name}"? This action is permanent and will remove all associated data, documents, and training history.`}
				onClose={() => setDeleteDialogOpen(false)}
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
