import { useState, useEffect, useCallback } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchJobRoles, deleteJobRole } from '../../../../store/slices/jobRoleSlice';
import type { JobRole } from '../../../../models/jobRole';

export const useJobRoleTable = () => {
	const dispatch = useAppDispatch();
	const { list: jobRoles, loading, total: totalCount } = useAppSelector((state) => state.jobRoles);
	const { user } = useAppSelector((state) => state.auth);

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof JobRole>('created_at');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

	// Filter state
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [filters, setFilters] = useState({
		status: '' as string,
		workplace_type: [] as string[],
		job_type: [] as string[]
	});

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [jobRoleToDelete, setJobRoleToDelete] = useState<JobRole | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [notification, setNotification] = useState<{
		open: boolean;
		message: string;
		severity: 'success' | 'error';
	}>({ open: false, message: '', severity: 'success' });

	const fetchJobRolesData = useCallback(async () => {
		const filterParams: Record<string, unknown> = {
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: debouncedSearchTerm,
			sortBy: orderBy,
			sortOrder: order
		};

		if (filters.status) {
			filterParams.status = filters.status;
		}
		if (filters.workplace_type.length > 0) {
			filterParams.workplace_type = filters.workplace_type.join(',');
		}
		if (filters.job_type.length > 0) {
			filterParams.job_type = filters.job_type.join(',');
		}

		dispatch(fetchJobRoles(filterParams));
	}, [page, rowsPerPage, debouncedSearchTerm, orderBy, order, filters, dispatch]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	useEffect(() => {
		fetchJobRolesData();
	}, [fetchJobRolesData]);

	const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number>) => {
		setRowsPerPage(parseInt(event.target.value as string, 10));
		setPage(0);
	};

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(0);
	};

	const handleRequestSort = (property: keyof JobRole) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleFilterOpen = () => setFilterDrawerOpen(true);
	const handleFilterClose = () => setFilterDrawerOpen(false);
	const handleFilterChange = (key: string, value: unknown) => setFilters(prev => ({ ...prev, [key]: value }));

	const applyFilters = () => {
		setPage(0);
		handleFilterClose();
	};

	const clearFilters = () => {
		setFilters({ status: '', workplace_type: [], job_type: [] });
		setPage(0);
	};

	const handleDeleteClick = (jobRole: JobRole) => {
		setJobRoleToDelete(jobRole);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!jobRoleToDelete) return;
		setDeleteLoading(true);
		try {
			await dispatch(deleteJobRole(jobRoleToDelete.public_id)).unwrap();
			setNotification({ open: true, message: `Job Role "${jobRoleToDelete.title}" deleted successfully`, severity: 'success' });
			fetchJobRolesData();
		} catch (error: any) {
			setNotification({ open: true, message: error || 'Failed to delete job role', severity: 'error' });
		} finally {
			setDeleteLoading(false);
			setDeleteDialogOpen(false);
			setJobRoleToDelete(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setJobRoleToDelete(null);
	};

	const handleCloseNotification = () => setNotification(prev => ({ ...prev, open: false }));

	return {
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
	};
};
