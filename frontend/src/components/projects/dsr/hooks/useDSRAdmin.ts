import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
	fetchMissingReports,
	fetchAdminOverview,
	sendDSRReminders,
	grantDSRPermission,
	fetchPermissionRequests,
	handlePermissionRequestAction,
	fetchPermissionStats,
	fetchProjects
} from '../../../../store/slices/dsrSlice';
import useToast from '../../../../hooks/useToast';
import dsrService from '../../../../services/dsrService';
import dsrProjectRequestService from '../../../../services/dsrProjectRequestService';
import type { DSREntry, DSRProjectRequest } from '../../../../models/dsr';

export const useDSRAdmin = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const {
		missingReports,
		adminEntries: entries,
		totalAdminEntries: totalEntries,
		permissionRequests,
		totalPermissionRequests,
		loading
	} = useAppSelector((state) => state.dsr);

	const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
	const [reminding, setReminding] = useState(false);
	const [entryPage, setEntryPage] = useState(0);
	const [entryRowsPerPage, setEntryRowsPerPage] = useState(10);

	// Project requests state
	const [projectRequests, setProjectRequests] = useState<DSRProjectRequest[]>([]);
	const [projectRequestsTotal, setProjectRequestsTotal] = useState(0);
	const [projectLoading, setProjectLoading] = useState(false);

	// Review queue state (submitted DSRs awaiting admin approval)
	const [reviewQueue, setReviewQueue] = useState<DSREntry[]>([]);
	const [reviewQueueTotal, setReviewQueueTotal] = useState(0);
	const [reviewLoading, setReviewLoading] = useState(false);

	const fetchReviewQueue = useCallback(async () => {
		setReviewLoading(true);
		try {
			const data = await dsrService.getPendingApproval();
			setReviewQueue(data.items || []);
			setReviewQueueTotal(data.total || 0);
		} catch {
			// Non-blocking — admin still sees rest of dashboard
		} finally {
			setReviewLoading(false);
		}
	}, []);

	const fetchProjectRequests = useCallback(async () => {
		setProjectLoading(true);
		try {
			const data = await dsrProjectRequestService.getRequests(0, 50, 'pending');
			setProjectRequests(data.items || []);
			setProjectRequestsTotal(data.total || 0);
		} catch {
			// Non-blocking
		} finally {
			setProjectLoading(false);
		}
	}, []);

	const fetchData = useCallback(() => {
		dispatch(fetchMissingReports(reportDate));
		dispatch(fetchPermissionRequests({ skip: 0, limit: 100 }));
		dispatch(fetchAdminOverview({
			skip: entryPage * entryRowsPerPage,
			limit: entryRowsPerPage,
			date_from: reportDate,
			date_to: reportDate
		}));
		fetchReviewQueue();
		fetchProjectRequests();
	}, [dispatch, reportDate, entryPage, entryRowsPerPage, fetchReviewQueue, fetchProjectRequests]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSendReminders = async () => {
		setReminding(true);
		try {
			await dispatch(sendDSRReminders(reportDate)).unwrap();
			toast.success('Reminders sent successfully');
		} catch (error: any) {
			toast.error(error || 'Failed to send reminders');
		} finally {
			setReminding(false);
		}
	};

	const handleGrantPermission = async (userPublicId: string) => {
		try {
			await dispatch(grantDSRPermission({
				user_public_id: userPublicId,
				target_date: reportDate
			})).unwrap();
			const isToday = reportDate === new Date().toISOString().split('T')[0];
			toast.success(isToday ? 'Draft created for user' : 'Past-date submission permission granted');
			dispatch(fetchMissingReports(reportDate));
			dispatch(fetchPermissionStats());
			dispatch(fetchAdminOverview({
				skip: entryPage * entryRowsPerPage,
				limit: entryRowsPerPage,
				date_from: reportDate,
				date_to: reportDate
			}));
		} catch (error: any) {
			toast.error(error || 'Failed to grant permission');
		}
	};

	const handleRefresh = () => fetchData();

	const handlePermissionAction = async (publicId: string, status: 'granted' | 'rejected') => {
		try {
			await dispatch(handlePermissionRequestAction({ publicId, status })).unwrap();
			toast.success(`Request ${status} successfully`);
			dispatch(fetchPermissionRequests({ skip: 0, limit: 100 }));
			dispatch(fetchPermissionStats());
			dispatch(fetchAdminOverview({
				skip: entryPage * entryRowsPerPage,
				limit: entryRowsPerPage,
				date_from: reportDate,
				date_to: reportDate
			}));
		} catch (error: any) {
			toast.error(error || `Failed to ${status} request`);
		}
	};

	const handleApproveEntry = async (publicId: string, adminNotes?: string) => {
		try {
			await dsrService.approveEntry(publicId, adminNotes);
			toast.success('DSR approved successfully');
			await fetchReviewQueue();
			dispatch(fetchAdminOverview({
				skip: 0, limit: entryRowsPerPage,
				date_from: reportDate, date_to: reportDate
			}));
		} catch (error: any) {
			toast.error(error?.response?.data?.detail || 'Failed to approve DSR');
		}
	};

	const handleRejectEntry = async (publicId: string, reason: string) => {
		try {
			await dsrService.rejectEntry(publicId, reason);
			toast.success('DSR rejected — user notified to resubmit');
			await fetchReviewQueue();
			dispatch(fetchAdminOverview({
				skip: entryPage * entryRowsPerPage,
				limit: entryRowsPerPage,
				date_from: reportDate,
				date_to: reportDate
			}));
		} catch (error: any) {
			toast.error(error?.response?.data?.detail || 'Failed to reject DSR');
		}
	};

	const handleProjectRequest = async (publicId: string, status: 'approved' | 'rejected') => {
		try {
			await dsrProjectRequestService.handleRequest(publicId, { status });
			toast.success(`Project request ${status} successfully`);
			await fetchProjectRequests();
			// Re-fetch projects in case one was created
			dispatch(fetchProjects({ skip: 0, limit: 500, active_only: true }));
		} catch (error: any) {
			toast.error(error?.response?.data?.detail || `Failed to ${status} project request`);
		}
	};

	return {
		reportDate,
		setReportDate,
		reminding,
		missingReports,
		entries,
		totalEntries,
		permissionRequests,
		totalPermissionRequests,
		loading,
		entryPage,
		setEntryPage,
		entryRowsPerPage,
		setEntryRowsPerPage,
		handleSendReminders,
		handleGrantPermission,
		handlePermissionAction,
		handleRefresh,
		// Review queue
		reviewQueue,
		reviewQueueTotal,
		reviewLoading,
		handleApproveEntry,
		handleRejectEntry,
		// Project requests
		projectRequests,
		projectRequestsTotal,
		projectLoading,
		handleProjectRequest
	};
};
