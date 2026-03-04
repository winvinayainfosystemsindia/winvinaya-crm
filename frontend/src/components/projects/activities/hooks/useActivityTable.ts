import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchActivities } from '../../../../store/slices/dsrSlice';
import type { DSRActivity } from '../../../../models/dsr';

export const useActivityTable = (projectId: string, refreshKey: number) => {
	const dispatch = useAppDispatch();
	const { activities, loading, totalActivities: totalCount } = useAppSelector((state) => state.dsr);

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [manualRefresh, setManualRefresh] = useState(0);

	const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
	const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
	const [activeActivity, setActiveActivity] = useState<DSRActivity | null>(null);

	const fetchActivitiesData = useCallback(() => {
		if (projectId) {
			dispatch(fetchActivities({
				projectId,
				skip: page * rowsPerPage,
				limit: rowsPerPage,
				search: searchTerm,
				status: statusFilter === 'all' ? undefined : statusFilter
			}));
		}
	}, [dispatch, projectId, page, rowsPerPage, searchTerm, statusFilter]);

	useEffect(() => {
		fetchActivitiesData();
	}, [fetchActivitiesData, refreshKey, manualRefresh]);

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(0);
	};

	const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setFilterAnchorEl(event.currentTarget);
	};

	const handleFilterClose = () => {
		setFilterAnchorEl(null);
	};

	const handleStatusSelect = (status: string) => {
		setStatusFilter(status);
		setPage(0);
		handleFilterClose();
	};

	const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, activity: DSRActivity) => {
		setActionAnchorEl(event.currentTarget);
		setActiveActivity(activity);
	};

	const handleActionClose = () => {
		setActionAnchorEl(null);
		setActiveActivity(null);
	};

	const handleRefresh = () => {
		setManualRefresh(prev => prev + 1);
	};

	return {
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
		filterOpen: Boolean(filterAnchorEl),
		actionOpen: Boolean(actionAnchorEl),
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
	};
};
