import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchHolidays, deleteHoliday } from '../../../../store/slices/holidaySlice';
import useToast from '../../../../hooks/useToast';

export const useHolidayAdmin = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { holidays, totalHolidays: total, loading, error } = useAppSelector((state) => state.holidays);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');

	const fetchBatch = useCallback(() => {
		dispatch(fetchHolidays({
			skip: page * rowsPerPage,
			limit: rowsPerPage
		}));
	}, [dispatch, page, rowsPerPage]);

	useEffect(() => {
		fetchBatch();
	}, [fetchBatch]);

	const handleRefresh = () => fetchBatch();

	const handleDelete = async (public_id: string) => {
		if (window.confirm('Are you sure you want to delete this holiday?')) {
			try {
				await dispatch(deleteHoliday(public_id)).unwrap();
				toast.success('Holiday deleted successfully');
				fetchBatch();
			} catch (err: any) {
				toast.error(err || 'Failed to delete holiday');
			}
		}
	};

	return {
		holidays,
		total,
		loading,
		error,
		page,
		setPage,
		rowsPerPage,
		setRowsPerPage,
		searchTerm,
		setSearchTerm,
		handleRefresh,
		handleDelete
	};
};
