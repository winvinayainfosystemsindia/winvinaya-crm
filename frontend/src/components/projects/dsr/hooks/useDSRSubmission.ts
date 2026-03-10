import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
	fetchProjects,
	fetchActivitiesForProject,
	createEntry,
	submitEntry,
	fetchEntry,
	fetchPermissionRequests,
	fetchCalendarEntries
} from '../../../../store/slices/dsrSlice';
import useToast from '../../../../hooks/useToast';
import type { DSRItem } from '../../../../models/dsr';
import { subDays, format, startOfDay } from 'date-fns';

interface UseDSRSubmissionProps {
	onSubmitted?: () => void;
	externalEntryId?: string | null;
}

export const useDSRSubmission = (props?: UseDSRSubmissionProps) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const entryId = props?.externalEntryId || searchParams.get('id');
	const dispatch = useAppDispatch();
	const toast = useToast();

	const { user } = useAppSelector((state) => state.auth);
	const { projects, activitiesByProject, calendarEntries: entries, permissionRequests, loading: storeLoading } = useAppSelector((state) => state.dsr);

	const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
	const [items, setItems] = useState<Partial<DSRItem>[]>([
		{ project_public_id: '', activity_public_id: '', description: '', start_time: '09:00', end_time: '10:00', hours: 1 }
	]);
	const [isLeave, setIsLeave] = useState(false);
	const [leaveType, setLeaveType] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [permissionError, setPermissionError] = useState<string | null>(null);

	const isDateAllowed = useMemo(() => {
		const today = new Date().toISOString().split('T')[0];
		if (reportDate === today) return true;
		if (reportDate > today) return false;

		// Check if there's a granted permission for this date
		return permissionRequests.some(req =>
			req.report_date === reportDate && req.status === 'granted'
		);
	}, [reportDate, permissionRequests]);

	const dateStatuses = useMemo(() => {
		const statusMap: Record<string, string> = {};
		const today = startOfDay(new Date());

		// Mark dates from entries (Approved, Submitted, Rejected, Draft)
		entries.forEach(entry => {
			statusMap[entry.report_date] = entry.status;
		});

		// Mark missed dates (last 30 days) and check for granted permissions
		for (let i = 1; i <= 30; i++) {
			const d = subDays(today, i);
			const dateStr = format(d, 'yyyy-MM-dd');

			// Entries take precedence over permissions
			if (statusMap[dateStr]) continue;

			// Check if permission granted for this date
			const hasPermission = permissionRequests.some(req =>
				req.report_date === dateStr && req.status === 'granted'
			);

			if (hasPermission) {
				statusMap[dateStr] = 'granted';
			} else {
				statusMap[dateStr] = 'missed';
			}
		}

		return statusMap;
	}, [entries, permissionRequests]);

	const loadEntry = useCallback(async (id: string) => {
		try {
			const entry = await dispatch(fetchEntry(id)).unwrap();
			setReportDate(entry.report_date);
			setItems(entry.items);
			setIsLeave(entry.is_leave);
			setLeaveType(entry.leave_type || '');

			if (!entry.is_leave) {
				const uniqueProjects = Array.from(new Set(entry.items.map(i => i.project_public_id)));
				uniqueProjects.forEach(pid => {
					if (pid) dispatch(fetchActivitiesForProject({ projectId: pid, assigned_to: user?.public_id }));
				});
			}
		} catch (error: any) {
			toast.error(error || 'Failed to load draft');
		}
	}, [dispatch, toast, user?.public_id]);

	useEffect(() => {
		dispatch(fetchProjects({ skip: 0, limit: 500, active_only: true, assigned_to: user?.public_id }));
		dispatch(fetchPermissionRequests({ skip: 0, limit: 100, user_id: user?.public_id as any }));

		// Fetch last 30 days of entries to determine status - Use fetchCalendarEntries for targeted calendar data
		const dateFrom = format(subDays(new Date(), 30), 'yyyy-MM-dd');
		dispatch(fetchCalendarEntries({ date_from: dateFrom }));

		if (entryId) {
			loadEntry(entryId);
		} else {
			// Reset for new entry
			setReportDate(new Date().toISOString().split('T')[0]);
			setItems([{ project_public_id: '', activity_public_id: '', description: '', start_time: '09:00', end_time: '10:00', hours: 1 }]);
			setIsLeave(false);
			setLeaveType('');
			setPermissionError(null);
		}
	}, [dispatch, entryId, loadEntry, user?.public_id]);

	const calculateHours = (start: string, end: string) => {
		if (!start || !end) return 0;
		const [sH, sM] = start.split(':').map(Number);
		const [eH, eM] = end.split(':').map(Number);
		const startMin = sH * 60 + sM;
		const endMin = eH * 60 + eM;
		const diff = endMin - startMin;
		return diff > 0 ? parseFloat((diff / 60).toFixed(2)) : 0;
	};

	const handleRowChange = (index: number, field: keyof DSRItem, value: any) => {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };

		if (field === 'project_public_id') {
			newItems[index].activity_public_id = '';
			if (value) {
				dispatch(fetchActivitiesForProject({ projectId: value, assigned_to: user?.public_id }));
			}
		}

		if (field === 'start_time' || field === 'end_time') {
			const hours = calculateHours(newItems[index].start_time || '', newItems[index].end_time || '');
			newItems[index].hours = hours;
		}

		setItems(newItems);
	};

	const addRow = () => {
		const lastItem = items[items.length - 1];
		setItems([...items, {
			project_public_id: '',
			activity_public_id: '',
			description: '',
			start_time: lastItem?.end_time || '09:00',
			end_time: '',
			hours: 0
		}]);
	};

	const removeRow = (index: number) => {
		if (items.length === 1) return;
		setItems(items.filter((_, i) => i !== index));
	};

	const totalHours = useMemo(() => items.reduce((sum, item) => sum + (item.hours || 0), 0), [items]);

	const validate = () => {
		if (isLeave) {
			if (!leaveType) {
				toast.warning('Please select a leave type');
				return false;
			}
			return true;
		}

		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			if (!it.project_public_id || !it.activity_public_id || !it.description || !it.start_time || !it.end_time) {
				toast.warning(`Please fill all fields in row ${i + 1}`);
				return false;
			}
			if ((it.hours || 0) <= 0) {
				toast.warning(`Invalid time range in row ${i + 1}`);
				return false;
			}
		}
		return true;
	};

	const handleSaveDraft = async () => {
		if (!validate()) return;
		setSubmitting(true);
		try {
			await dispatch(createEntry({
				report_date: reportDate,
				items: isLeave ? [] : items as any,
				is_leave: isLeave,
				leave_type: isLeave ? leaveType : undefined
			})).unwrap();
			toast.success('Draft saved successfully');
			setPermissionError(null);
			if (props?.onSubmitted) props.onSubmitted();
		} catch (error: any) {
			if (error?.toLowerCase().includes('permission') || error?.toLowerCase().includes('date')) {
				setPermissionError(error);
			} else {
				toast.error(error || 'Failed to save draft');
			}
		} finally {
			setSubmitting(false);
		}
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		setSubmitting(true);
		try {
			const entry = await dispatch(createEntry({
				report_date: reportDate,
				items: isLeave ? [] : items as any,
				is_leave: isLeave,
				leave_type: isLeave ? leaveType : undefined
			})).unwrap();
			await dispatch(submitEntry(entry.public_id)).unwrap();
			toast.success('DSR submitted successfully!');
			if (props?.onSubmitted) {
				props.onSubmitted();
			} else {
				setTimeout(() => navigate('/dashboard/dsr'), 1500);
			}
		} catch (error: any) {
			toast.error(error || 'Failed to submit DSR');
		} finally {
			setSubmitting(false);
		}
	};

	return {
		entryId,
		projects,
		activitiesByProject,
		loading: storeLoading,
		reportDate,
		setReportDate,
		items,
		isLeave,
		setIsLeave,
		leaveType,
		setLeaveType,
		totalHours,
		submitting,
		permissionError,
		isDateAllowed,
		dateStatuses,
		handleRowChange,
		addRow,
		removeRow,
		handleSaveDraft,
		handleSubmit,
		navigate
	};
};
