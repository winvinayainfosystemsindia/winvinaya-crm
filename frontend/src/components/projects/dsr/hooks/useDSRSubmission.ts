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
import { fetchActivityTypes } from '../../../../store/slices/dsrActivityTypeSlice';
import useToast from '../../../../hooks/useToast';
import type { DSRItem } from '../../../../models/dsr';
import { subDays, format, startOfDay } from 'date-fns';

export const GENERAL_PROJECT_ID = 'general_internal';

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
	const { projects: rawProjects, activitiesByProject, calendarEntries: entries, permissionRequests, loading: dsrLoading } = useAppSelector((state) => state.dsr);
	const { holidays } = useAppSelector((state) => state.holidays);

	const projects = useMemo(() => {
		const generalProject: any = {
			public_id: GENERAL_PROJECT_ID,
			name: 'General / Internal Work',
			description: 'General activities like meetings, training, etc.'
		};
		return [generalProject, ...rawProjects];
	}, [rawProjects]);
	const { activityTypes, loading: typesLoading } = useAppSelector((state) => state.dsrActivityType);

	const loading = dsrLoading || typesLoading;

	const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
	const [items, setItems] = useState<Partial<DSRItem>[]>([
		{ 
			project_public_id: null as any, 
			activity_public_id: null as any, 
			activity_type_code: null,
			description: '', 
			start_time: '09:00', 
			end_time: '10:00', 
			hours: 1 
		}
	]);
	const [isLeave, setIsLeave] = useState(false);
	const [leaveType, setLeaveType] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [permissionError, setPermissionError] = useState<string | null>(null);

	const isDateAllowed = useMemo(() => {
		const today = new Date().toISOString().split('T')[0];
		
		// Holiday Check
		const isHoliday = holidays.some(h => h.holiday_date === reportDate);
		if (isHoliday) return false;

		if (reportDate === today) return true;
		if (reportDate > today) return false;

		// Check if there's a granted permission for this date
		return permissionRequests.some(req =>
			req.report_date === reportDate && req.status === 'granted'
		);
	}, [reportDate, permissionRequests, holidays]);

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
			
			// Map null project_public_id to GENERAL_PROJECT_ID for UI consistency
			const mappedItems = entry.items.map(item => ({
				...item,
				project_public_id: item.project_public_id || GENERAL_PROJECT_ID
			}));
			setItems(mappedItems);
			setIsLeave(entry.is_leave);
			setLeaveType(entry.leave_type || '');

			if (!entry.is_leave) {
				const uniqueProjects = Array.from(new Set(mappedItems.map(i => i.project_public_id)));
				uniqueProjects.forEach(pid => {
					if (pid && pid !== GENERAL_PROJECT_ID) {
						dispatch(fetchActivitiesForProject({ projectId: pid, assigned_to: entry.user?.public_id }));
					}
				});
			}

			// Update calendar for this specific user
			const dateFrom = format(subDays(new Date(), 30), 'yyyy-MM-dd');
			const today = format(new Date(), 'yyyy-MM-dd');
			dispatch(fetchCalendarEntries({ 
				date_from: dateFrom, 
				date_to: today,
				user_id: entry.user_id
			}));
		} catch (error: any) {
			toast.error(error || 'Failed to load DSR');
		}
	}, [dispatch, toast, user?.public_id]);

	useEffect(() => {
		dispatch(fetchProjects({ skip: 0, limit: 500, active_only: true, assigned_to: user?.public_id }));
		dispatch(fetchPermissionRequests({ skip: 0, limit: 100, user_id: user?.id as any }));
		dispatch(fetchActivityTypes({ skip: 0, limit: 100, onlyActive: true }));

		// Fetch calendar status with month range (scoped to viewed user if present)
		const start = format(subDays(startOfDay(new Date()), 7), 'yyyy-MM-dd'); // start with some buffer
		const end = format(subDays(startOfDay(new Date()), -30), 'yyyy-MM-dd'); // end in 30 days
		dispatch(fetchCalendarEntries({ 
			date_from: start, 
			date_to: end,
			user_id: user?.id as any 
		}));

		if (entryId) {
			loadEntry(entryId);
		} else {
			// Reset for new entry
			setReportDate(new Date().toISOString().split('T')[0]);
			setItems([{ project_public_id: null as any, activity_public_id: null as any, description: '', start_time: '09:00', end_time: '10:00', hours: 1 }]);
			setIsLeave(false);
			setLeaveType('');
			setPermissionError(null);
		}
	}, [dispatch, entryId, loadEntry, user?.public_id, user?.id, holidays]);

	// Update permissionError if it's a holiday
	useEffect(() => {
		const holiday = holidays.find(h => h.holiday_date === reportDate);
		if (holiday) {
			setPermissionError(`Cannot submit DSR for ${holiday.holiday_date} as it is a company holiday (${holiday.holiday_name}).`);
		} else if (!isDateAllowed && reportDate < new Date().toISOString().split('T')[0]) {
			// Only show the generic permission error if it's NOT a holiday
			setPermissionError("You do not have permission to submit for this past date. Please raise a request first.");
		} else {
			setPermissionError(null);
		}
	}, [reportDate, holidays, isDateAllowed]);

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
		setItems((prevItems) => {
			const newItems = [...prevItems];
			const currentItem = newItems[index];

			// Create a new object for the item being changed
			const updatedItem = { ...currentItem, [field]: value };
			
			// Handle logical dependencies
			if (field === 'project_public_id') {
				// If project actually changed, clear its children
				if (currentItem.project_public_id !== value) {
					updatedItem.activity_public_id = null as any;
					updatedItem.activity_name_other = undefined;
					updatedItem.activity_type_code = null;
				}
			}

			if (field === 'start_time' || field === 'end_time') {
				updatedItem.hours = calculateHours(updatedItem.start_time || '', updatedItem.end_time || '');
			}

			newItems[index] = updatedItem;
			return newItems;
		});

		// Handle side effects (Redux dispatches) outside the state update
		if (field === 'project_public_id' && value && value !== GENERAL_PROJECT_ID) {
			dispatch(fetchActivitiesForProject({ projectId: value, assigned_to: user?.public_id }));
		}
	};

	const addRow = () => {
		const lastItem = items[items.length - 1];
		setItems([...items, {
			project_public_id: null as any,
			activity_public_id: null as any,
			activity_type_code: null,
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
			const isGeneral = it.project_public_id === GENERAL_PROJECT_ID;

			if (!it.project_public_id || !it.description || !it.start_time || !it.end_time) {
				toast.warning(`Please fill all fields in row ${i + 1}`);
				return false;
			}
			
			if (isGeneral) {
				if (!it.activity_type_code) {
					toast.warning(`Please select an Activity Type for General work in row ${i + 1}`);
					return false;
				}
			} else {
				if (!it.activity_public_id && !it.activity_name_other) {
					toast.warning(`Please select an Activity for row ${i + 1}`);
					return false;
				}
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
		const sanitizedItems = items.map(item => ({
			...item,
			project_public_id: item.project_public_id === GENERAL_PROJECT_ID ? null : item.project_public_id
		}));

		try {
			await dispatch(createEntry({
				report_date: reportDate,
				items: isLeave ? [] : sanitizedItems as any,
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
		const sanitizedItems = items.map(item => ({
			...item,
			project_public_id: item.project_public_id === GENERAL_PROJECT_ID ? null : item.project_public_id
		}));

		try {
			const entry = await dispatch(createEntry({
				report_date: reportDate,
				items: isLeave ? [] : sanitizedItems as any,
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
		activityTypes,
		loading,
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
