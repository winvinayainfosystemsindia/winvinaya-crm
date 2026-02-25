import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO, startOfDay, isWithinInterval } from 'date-fns';
import trainingExtensionService from '../../../../services/trainingExtensionService';
import type { TrainingBatch, CandidateAllocation, TrainingAttendance, TrainingBatchEvent, TrainingBatchPlan } from '../../../../models/training';
import type { User } from '../../../../models/auth';
import { useSnackbar } from 'notistack';

export const useAttendance = (batch: TrainingBatch, allocations: CandidateAllocation[], user: User | null) => {
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
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
			const [attData, eventData] = await Promise.all([
				trainingExtensionService.getAttendance(batch.id),
				trainingExtensionService.getBatchEvents(batch.id)
			]);
			setAttendance(attData);
			setBatchEvents(eventData);
		} catch (error) {
			console.error('Failed to fetch attendance data', error);
			enqueueSnackbar('Failed to load attendance records', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	}, [batch.id, enqueueSnackbar]);

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
		setAttendance(prev => {
			const existingIdx = prev.findIndex(a =>
				a.candidate_id === candidateId &&
				a.date === dateStr &&
				a.period_id === periodId
			);

			if (existingIdx >= 0) {
				const updated = [...prev];
				updated[existingIdx] = { ...updated[existingIdx], ...data };
				return updated;
			} else {
				return [...prev, {
					batch_id: batch.id,
					candidate_id: candidateId,
					date: dateStr,
					period_id: periodId,
					status: 'present',
					remarks: null,
					trainer_notes: null,
					...data
				} as TrainingAttendance];
			}
		});
	}, [selectedDate, batch.id]);

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

		setSaving(true);
		try {
			const dateStr = format(selectedDate, 'yyyy-MM-dd');

			// Collect all attendance records for the selected date
			const dailyAttendance = attendance.filter(a => a.date === dateStr);

			await trainingExtensionService.updateBulkAttendance(dailyAttendance);
			enqueueSnackbar('Attendance saved successfully', { variant: 'success' });
			fetchData();
		} catch (error: any) {
			console.error('Failed to save attendance', error);
			const errorMessage = error?.response?.data?.detail || 'Failed to save attendance';
			enqueueSnackbar(errorMessage, { variant: 'error' });
		} finally {
			setSaving(false);
		}
	};



	const isDateOutOfRange = useMemo(() => {
		if (!batchBounds) return false;
		return !isWithinInterval(selectedDate, batchBounds);
	}, [selectedDate, batchBounds]);

	return {
		loading,
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
		isDroppedOut
	};
};
