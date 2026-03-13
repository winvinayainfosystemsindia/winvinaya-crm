import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
	fetchMissingReports,
	fetchAdminOverview,
	sendDSRReminders,
	grantDSRPermission,
	fetchPermissionRequests,
	handlePermissionRequestAction,
	fetchPermissionStats
} from '../../../../store/slices/dsrSlice';
import useToast from '../../../../hooks/useToast';

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

	const fetchData = useCallback(() => {
		dispatch(fetchMissingReports(reportDate));
		dispatch(fetchPermissionRequests({ skip: 0, limit: 100 }));
		dispatch(fetchAdminOverview({
			skip: entryPage * entryRowsPerPage,
			limit: entryRowsPerPage,
			date_from: reportDate,
			date_to: reportDate
		}));
	}, [dispatch, reportDate, entryPage, entryRowsPerPage]);

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
		handleRefresh
	};
};
