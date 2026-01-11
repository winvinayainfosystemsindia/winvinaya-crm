import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO, startOfDay, isWithinInterval } from 'date-fns';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingBatch, CandidateAllocation, TrainingAttendance, TrainingBatchEvent } from '../../../models/training';
import { useSnackbar } from 'notistack';

export const useAttendance = (batch: TrainingBatch, allocations: CandidateAllocation[]) => {
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
	const [batchEvents, setBatchEvents] = useState<TrainingBatchEvent[]>([]);
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

	useEffect(() => {
		if (batch.id) {
			fetchData();
		}
	}, [batch.id, fetchData]);

	const currentEvent = useMemo(() => {
		const dateStr = format(selectedDate, 'yyyy-MM-dd');
		return batchEvents.find(e => e.date === dateStr);
	}, [selectedDate, batchEvents]);

	const updateAttendanceState = useCallback((candidateId: number, data: Partial<TrainingAttendance>) => {
		const dateStr = format(selectedDate, 'yyyy-MM-dd');
		setAttendance(prev => {
			const existingIdx = prev.findIndex(a => a.candidate_id === candidateId && a.date === dateStr);
			if (existingIdx >= 0) {
				const updated = [...prev];
				updated[existingIdx] = { ...updated[existingIdx], ...data };
				return updated;
			} else {
				return [...prev, {
					batch_id: batch.id,
					candidate_id: candidateId,
					date: dateStr,
					status: 'present',
					remarks: null,
					...data
				} as TrainingAttendance];
			}
		});
	}, [selectedDate, batch.id]);

	const handleStatusChange = useCallback((candidateId: number, status: string) => {
		updateAttendanceState(candidateId, { status: status as any });
	}, [updateAttendanceState]);

	const handleRemarkChange = useCallback((candidateId: number, remark: string) => {
		updateAttendanceState(candidateId, { remarks: remark });
	}, [updateAttendanceState]);

	const handleMarkAllPresent = useCallback(() => {
		allocations.forEach(allocation => {
			handleStatusChange(allocation.candidate_id, 'present');
		});
		enqueueSnackbar('All candidates marked as present for this date', { variant: 'info' });
	}, [allocations, handleStatusChange, enqueueSnackbar]);

	const handleSave = async () => {
		setSaving(true);
		try {
			const dateStr = format(selectedDate, 'yyyy-MM-dd');
			const dailyAttendance = allocations.map(allocation => {
				const existing = attendance.find(a => a.candidate_id === allocation.candidate_id && a.date === dateStr);
				return existing || {
					batch_id: batch.id,
					candidate_id: allocation.candidate_id,
					date: dateStr,
					status: 'present' as const,
					remarks: null
				};
			});

			await trainingExtensionService.updateBulkAttendance(dailyAttendance);
			enqueueSnackbar('Attendance saved successfully', { variant: 'success' });
			fetchData();
		} catch (error) {
			console.error('Failed to save attendance', error);
			enqueueSnackbar('Failed to save attendance', { variant: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const handleConfirmEvent = async (eventData: any) => {
		try {
			await trainingExtensionService.createBatchEvent({
				batch_id: batch.id,
				date: format(selectedDate, 'yyyy-MM-dd'),
				...eventData
			});
			enqueueSnackbar(`${eventData.event_type} added successfully`, { variant: 'success' });
			fetchData();
			return true;
		} catch (error) {
			enqueueSnackbar('Failed to add event', { variant: 'error' });
			return false;
		}
	};

	const handleDeleteEvent = async (eventId: number) => {
		try {
			await trainingExtensionService.deleteBatchEvent(eventId);
			enqueueSnackbar('Event removed', { variant: 'info' });
			fetchData();
		} catch (error) {
			enqueueSnackbar('Failed to remove event', { variant: 'error' });
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
		selectedDate,
		activeTab,
		currentEvent,
		isDateOutOfRange,
		batchBounds,
		setSelectedDate,
		setActiveTab,
		handleStatusChange,
		handleRemarkChange,
		handleMarkAllPresent,
		handleSave,
		handleConfirmEvent,
		handleDeleteEvent
	};
};

