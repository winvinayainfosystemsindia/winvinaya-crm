import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../store/store';
import { fetchMockInterviewsByBatch, deleteMockInterview, setCurrentMockInterview } from '../../../store/slices/mockInterviewSlice';
import type { MockInterview } from '../../../models/MockInterview';

export const useMockInterviewList = (batchId: number) => {
	const dispatch = useDispatch<AppDispatch>();
	const { mockInterviews, loading } = useSelector((state: RootState) => state.mockInterviews);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [viewMode, setViewMode] = useState(false);

	useEffect(() => {
		if (batchId) {
			dispatch(fetchMockInterviewsByBatch(batchId));
		}
	}, [dispatch, batchId]);

	const handleRefresh = useCallback(() => {
		dispatch(fetchMockInterviewsByBatch(batchId));
	}, [dispatch, batchId]);

	const handleChangePage = useCallback((_event: unknown, newPage: number) => {
		setPage(newPage);
	}, []);

	const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	}, []);

	const handleCreate = useCallback(() => {
		dispatch(setCurrentMockInterview(null));
		setViewMode(false);
		setIsFormOpen(true);
	}, [dispatch]);

	const handleEdit = useCallback((interview: MockInterview) => {
		dispatch(setCurrentMockInterview(interview));
		setViewMode(false);
		setIsFormOpen(true);
	}, [dispatch]);

	const handleView = useCallback((interview: MockInterview) => {
		dispatch(setCurrentMockInterview(interview));
		setViewMode(true);
		setIsFormOpen(true);
	}, [dispatch]);

	const handleDelete = useCallback(async (id: number) => {
		if (window.confirm('Are you sure you want to delete this mock interview record? This action cannot be undone.')) {
			await dispatch(deleteMockInterview(id));
		}
	}, [dispatch]);

	const filteredInterviews = useMemo(() => {
		return mockInterviews.filter(interview =>
			interview.interviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			interview.status.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [mockInterviews, searchTerm]);

	return {
		mockInterviews: filteredInterviews,
		loading,
		page,
		rowsPerPage,
		searchTerm,
		isFormOpen,
		viewMode,
		setSearchTerm,
		setIsFormOpen,
		handleRefresh,
		handleChangePage,
		handleChangeRowsPerPage,
		handleCreate,
		handleEdit,
		handleView,
		handleDelete
	};
};
