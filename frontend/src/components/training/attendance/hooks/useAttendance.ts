import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO, startOfDay, isWithinInterval } from 'date-fns';
import trainingExtensionService from '../../../../services/trainingExtensionService';
import type { TrainingBatch, CandidateAllocation, TrainingAttendance, TrainingBatchEvent, TrainingBatchPlan } from '../../../../models/training';
import type { User } from '../../../../models/auth';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
	fetchAttendanceByBatch,
	updateBulkAttendance,
	updateAttendance as updateAttendanceAction,
	deleteAttendance as deleteAttendanceAction,
	updateLocalAttendance
} from '../../../../store/slices/attendanceSlice';

export const useAttendance = (batch: TrainingBatch, allocations: CandidateAllocation[], user: User | null) => {
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useAppDispatch();
	const { attendance, loading: attendanceLoading, saving, error } = useAppSelector(state => state.attendance);

	const [loading, setLoading] = useState(false);
	const [batchEvents, setBatchEvents] = useState<TrainingBatchEvent[]>([]);
	const [dailyPlan, setDailyPlan] = useState<TrainingBatchPlan[]>([]);
	const [activeTab, setActiveTab] = useState<'tracker' | 'report'>('tracker');

	// Calculate batch boundaries
	const batchBounds = useMemo(() => {
		const startStr = batch.start_date || batch.duration?.start_date;
		const endStr = batch.approx_close_date || batch.duration?.end_date;

		if (!startStr || !endStr) return null;

		return {
			start: startOfDay(parseISO(startStr)),
			end: startOfDay(parseISO(endStr))
		};
	}, [batch]);

	const [selectedDate, setSelectedDate] = useState<Date>(() => {
		const today = startOfDay(new Date());
		if (batchBounds) {
			if (today < batchBounds.start) return batchBounds.start;
			if (today > batchBounds.end) return batchBounds.end;
		}
		return today;
	});

	// Check if selected date is in the future
	const isFutureDate = useMemo(() => {
		const today = startOfDay(new Date());
		return selectedDate > today;
	}, [selectedDate]);

	// Check if a candidate is dropped out
	const isDroppedOut = useCallback((candidateId: number) => {
		const allocation = allocations.find(a => a.candidate_id === candidateId);
		return allocation?.is_dropout === true;
	}, [allocations]);

	// Fetch attendance and events data
	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			// Fetch attendance via Redux
			dispatch(fetchAttendanceByBatch(batch.id));

			const eventData = await trainingExtensionService.getBatchEvents(batch.id);
			setBatchEvents(eventData);
		} catch (error) {
			console.error('Failed to fetch attendance data', error);
			enqueueSnackbar('Failed to load attendance records', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	}, [batch.id, dispatch, enqueueSnackbar]);

	// Fetch daily plan when date changes
	const fetchDailyPlan = useCallback(async () => {
		if (!batch.public_id) return;

		try {
			const dateStr = format(selectedDate, 'yyyy-MM-dd');
			const plans = await trainingExtensionService.getDailyPlan(batch.public_id, dateStr);
			setDailyPlan(plans);
		} catch (error) {
			console.error('Failed to fetch daily plan', error);
			setDailyPlan([]);
		}
	}, [batch.public_id, selectedDate]);

	useEffect(() => {
		if (batch.id) {
			fetchData();
		}
	}, [batch.id, fetchData]);

	useEffect(() => {
		fetchDailyPlan();
	}, [fetchDailyPlan]);

	useEffect(() => {
		if (error) {
			enqueueSnackbar(error, { variant: 'error' });
		}
	}, [error, enqueueSnackbar]);

	const currentEvent = useMemo(() => {
		const dateStr = format(selectedDate, 'yyyy-MM-dd');
		return batchEvents.find(e => e.date === dateStr);
	}, [selectedDate, batchEvents]);

	// Update attendance state for a specific period
	const updatePeriodAttendance = useCallback((
		candidateId: number,
		periodId: number | null,
		data: Partial<TrainingAttendance>
	) => {
		const dateStr = format(selectedDate, 'yyyy-MM-dd');

		const existing = attendance.find(a =>
			a.candidate_id === candidateId &&
			a.date === dateStr &&
			a.period_id === periodId
		);

		const updatedData = existing
			? { ...existing, ...data }
			: {
				batch_id: batch.id,
				candidate_id: candidateId,
				date: dateStr,
				period_id: periodId,
				status: 'present',
				remarks: null,
				trainer_notes: null,
				...data
			} as TrainingAttendance;

		dispatch(updateLocalAttendance(updatedData));
	}, [selectedDate, batch.id, attendance, dispatch]);

	// Helper to check if user can edit a specific period
	const checkCanEditPeriod = useCallback((periodId: number) => {
		if (user?.is_superuser || user?.role === 'admin') return true;

		const period = dailyPlan.find(p => p.id === periodId);
		if (!period) return false;

		return user?.full_name === period.trainer;
	}, [user, dailyPlan]);

	// Handle period-specific status change
	const handlePeriodStatusChange = useCallback((
		candidateId: number,
		periodId: number,
		status: string
	) => {
		if (isDroppedOut(candidateId)) {
			enqueueSnackbar('Cannot mark attendance for dropped out candidates', { variant: 'warning' });
			return;
		}
		if (isFutureDate) {
			enqueueSnackbar('Cannot mark attendance for future dates', { variant: 'warning' });
			return;
		}

		if (!checkCanEditPeriod(periodId)) {
			enqueueSnackbar('You are not authorized to mark attendance for this period', { variant: 'error' });
			return;
		}

		updatePeriodAttendance(candidateId, periodId, { status: status as any });
	}, [updatePeriodAttendance, isDroppedOut, isFutureDate, enqueueSnackbar, checkCanEditPeriod]);

	// Handle trainer notes change
	const handleTrainerNotesChange = useCallback((
		candidateId: number,
		periodId: number,
		notes: string
	) => {
		updatePeriodAttendance(candidateId, periodId, { trainer_notes: notes });
	}, [updatePeriodAttendance]);

	// Handle status change (for full-day attendance)
	const handleStatusChange = useCallback((candidateId: number, status: string) => {
		if (isDroppedOut(candidateId)) {
			enqueueSnackbar('Cannot mark attendance for dropped out candidates', { variant: 'warning' });
			return;
		}
		if (isFutureDate) {
			enqueueSnackbar('Cannot mark attendance for future dates', { variant: 'warning' });
			return;
		}
		updatePeriodAttendance(candidateId, null, { status: status as any });
	}, [updatePeriodAttendance, isDroppedOut, isFutureDate, enqueueSnackbar]);

	// Mark all candidates for a specific period as a specific status
	const handlePeriodMarkAll = useCallback((periodId: number, status: string) => {
		if (isFutureDate) {
			enqueueSnackbar('Cannot mark attendance for future dates', { variant: 'warning' });
			return;
		}

		if (!checkCanEditPeriod(periodId)) {
			enqueueSnackbar('You are not authorized to mark all for this period', { variant: 'error' });
			return;
		}

		allocations.forEach(allocation => {
			if (!isDroppedOut(allocation.candidate_id)) {
				updatePeriodAttendance(allocation.candidate_id, periodId, { status: status as any });
			}
		});
		enqueueSnackbar(`All candidates marked as ${status} for this period`, { variant: 'info' });
	}, [allocations, updatePeriodAttendance, isDroppedOut, isFutureDate, enqueueSnackbar, checkCanEditPeriod]);

	const handleRemarkChange = useCallback((candidateId: number, remark: string) => {
		updatePeriodAttendance(candidateId, null, { remarks: remark });
	}, [updatePeriodAttendance]);

	const handleSave = async () => {
		if (isFutureDate) {
			enqueueSnackbar('Cannot save attendance for future dates', { variant: 'error' });
			return;
		}

		try {
			const dateStr = format(selectedDate, 'yyyy-MM-dd');

			// Collect all attendance records for the selected date
			const dailyAttendance = attendance.filter(a => a.date === dateStr);

			await dispatch(updateBulkAttendance(dailyAttendance)).unwrap();
			enqueueSnackbar('Attendance saved successfully', { variant: 'success' });
			fetchData();
		} catch (error: any) {
			console.error('Failed to save attendance', error);
			enqueueSnackbar(error || 'Failed to save attendance', { variant: 'error' });
		}
	};

	const handleUpdateSingle = async (attendanceId: number, data: Partial<TrainingAttendance>) => {
		try {
			await dispatch(updateAttendanceAction({ attendanceId, data })).unwrap();
			enqueueSnackbar('Attendance updated successfully', { variant: 'success' });
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to update attendance', { variant: 'error' });
		}
	};

	const handleDeleteSingle = async (attendanceId: number) => {
		try {
			await dispatch(deleteAttendanceAction(attendanceId)).unwrap();
			enqueueSnackbar('Attendance record deleted successfully', { variant: 'success' });
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to delete attendance', { variant: 'error' });
		}
	};

	const isDateOutOfRange = useMemo(() => {
		if (!batchBounds) return false;
		return !isWithinInterval(selectedDate, batchBounds);
	}, [selectedDate, batchBounds]);

	return {
		loading: loading || attendanceLoading,
		saving,
		attendance,
		batchEvents,
		dailyPlan,
		selectedDate,
		activeTab,
		currentEvent,
		isDateOutOfRange,
		isFutureDate,
		batchBounds,
		setSelectedDate,
		setActiveTab,
		handleStatusChange,
		handleRemarkChange,
		handlePeriodStatusChange,
		handleTrainerNotesChange,
		handlePeriodMarkAll,
		handleSave,
		handleUpdateSingle,
		handleDeleteSingle,
		isDroppedOut
	};
};
