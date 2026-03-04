import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
	fetchMissingReports,
	fetchAdminOverview,
	sendDSRReminders,
	grantDSRPermission
} from '../../../../store/slices/dsrSlice';
import useToast from '../../../../hooks/useToast';

export const useDSRAdmin = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const {
		missingReports,
		entries,
		totalEntries,
		loading
	} = useAppSelector((state) => state.dsr);

	const [tab, setTab] = useState(0);
	const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
	const [reminding, setReminding] = useState(false);

	const [entryPage, setEntryPage] = useState(0);
	const [entryRowsPerPage, setEntryRowsPerPage] = useState(10);

	const fetchData = useCallback(() => {
		if (tab === 0) {
			dispatch(fetchMissingReports(reportDate));
		} else {
			dispatch(fetchAdminOverview({
				skip: entryPage * entryRowsPerPage,
				limit: entryRowsPerPage,
				date_from: reportDate,
				date_to: reportDate
			}));
		}
	}, [dispatch, tab, reportDate, entryPage, entryRowsPerPage]);

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
				target_date: reportDate,
				expiry_hours: 24
			})).unwrap();
			toast.success('Permission granted for 24 hours');
			dispatch(fetchMissingReports(reportDate));
		} catch (error: any) {
			toast.error(error || 'Failed to grant permission');
		}
	};

	const handleRefresh = () => {
		fetchData();
	};

	return {
		tab,
		setTab,
		reportDate,
		setReportDate,
		reminding,
		missingReports,
		entries,
		totalEntries,
		loading,
		entryPage,
		setEntryPage,
		entryRowsPerPage,
		setEntryRowsPerPage,
		handleSendReminders,
		handleGrantPermission,
		handleRefresh
	};
};
