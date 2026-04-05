import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { useSnackbar } from 'notistack';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { fetchWeeklyPlan, createPlanEntry, deletePlanEntry, fetchAllBatchPlans, resetWeeklyPlan } from '../../../../store/slices/trainingPlanSlice';
import trainingPlanService from '../../../../services/trainingPlanService';
import { fetchUsers } from '../../../../store/slices/userSlice';
import { DEFAULT_START_TIME, HARD_END_TIME } from '../utils/planConstants';
import { parseTimeValue, formatTime12h } from '../utils/planFormatters';
import type { RootState } from '../../../../store/store';
import trainingExtensionService from '../../../../services/trainingExtensionService';
import type { TrainingBatch, TrainingBatchPlan, TrainingBatchEvent } from '../../../../models/training';

export const useWeeklyPlanManager = (selectedBatch: TrainingBatch) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { weeklyPlan, allPlans } = useAppSelector((state: RootState) => state.trainingPlan);
	const { user } = useAppSelector((state: RootState) => state.auth);

	const { minDate, maxDate } = useMemo(() => {
		const start = selectedBatch?.start_date ? parseISO(selectedBatch.start_date) : new Date();
		const end = selectedBatch?.approx_close_date ? parseISO(selectedBatch.approx_close_date) : addDays(start, 90);
		return { minDate: start, maxDate: end };
	}, [selectedBatch]);

	// Initialize currentDate directly to the batch's start date
	const [currentDate, setCurrentDate] = useState(() => {
		if (selectedBatch?.start_date) return parseISO(selectedBatch.start_date);
		return new Date();
	});

	// UI States
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedEntry, setSelectedEntry] = useState<Partial<TrainingBatchPlan> | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [confirmDialog, setConfirmDialog] = useState({
		open: false,
		title: '',
		message: '',
		onConfirm: () => { },
		loading: false
	});

	// Handle batch switching
	useEffect(() => {
		if (selectedBatch?.start_date) {
			setCurrentDate(parseISO(selectedBatch.start_date));
			dispatch(resetWeeklyPlan());
		}
	}, [selectedBatch?.public_id, dispatch]);

	const canEdit = useMemo(() => {
		return user?.role === 'admin' || user?.role === 'manager';
	}, [user]);

	const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
	const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
	const weekDays = useMemo(() => {
		const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
		const weekdayRange = days.slice(0, 5);
		const saturday = days[5];
		const sunday = days[6];

		const hasSaturdayEntries = weeklyPlan.some(p => p.date === format(saturday, 'yyyy-MM-dd'));
		const hasSundayEntries = weeklyPlan.some(p => p.date === format(sunday, 'yyyy-MM-dd'));

		if (hasSaturdayEntries && hasSundayEntries) return days;
		if (hasSaturdayEntries) return days.slice(0, 6);
		if (hasSundayEntries) return [...weekdayRange, sunday]; // Rare but possible

		return weekdayRange;
	}, [weekStart, weekEnd, weeklyPlan]);

	const weekNumber = useMemo(() => {
		if (!selectedBatch?.start_date) return 1;
		const batchStart = startOfWeek(parseISO(selectedBatch.start_date), { weekStartsOn: 1 });
		const diffDays = Math.floor((weekStart.getTime() - batchStart.getTime()) / (1000 * 60 * 60 * 24));
		return Math.floor(diffDays / 7) + 1;
	}, [weekStart, selectedBatch?.start_date]);

	const handlePrevWeek = useCallback(() => {
		const prevWeek = addDays(currentDate, -7);
		if (prevWeek >= startOfWeek(minDate, { weekStartsOn: 1 })) {
			setCurrentDate(prevWeek);
		}
	}, [currentDate, minDate]);

	const handleNextWeek = useCallback(() => {
		const nextWeek = addDays(currentDate, 7);
		if (nextWeek <= endOfWeek(maxDate, { weekStartsOn: 1 })) {
			setCurrentDate(nextWeek);
		}
	}, [currentDate, maxDate]);

	const canGoPrev = currentDate > startOfWeek(minDate, { weekStartsOn: 1 });
	const canGoNext = currentDate < startOfWeek(maxDate, { weekStartsOn: 1 });

	useEffect(() => {
		dispatch(fetchUsers({ limit: 200 }));
	}, [dispatch]);

	useEffect(() => {
		if (selectedBatch) {
			dispatch(fetchWeeklyPlan({
				batchPublicId: selectedBatch.public_id,
				startDate: format(weekStart, 'yyyy-MM-dd')
			}));
		}
	}, [weekStart, selectedBatch.public_id, dispatch]);

	useEffect(() => {
		if (selectedBatch && activeTab === 1) {
			dispatch(fetchAllBatchPlans(selectedBatch.public_id));
		}
	}, [activeTab, selectedBatch.public_id, dispatch]);

	const dailyPlans = useMemo(() => {
		const groups: Record<string, TrainingBatchPlan[]> = {};
		weekDays.forEach(day => {
			const dateStr = format(day, 'yyyy-MM-dd');
			groups[dateStr] = weeklyPlan
				.filter((p: TrainingBatchPlan) => p.date === dateStr)
				.sort((a: TrainingBatchPlan, b: TrainingBatchPlan) => a.start_time.localeCompare(b.start_time));
		});
		return groups;
	}, [weeklyPlan, weekDays]);

	const [batchEvents, setBatchEvents] = useState<TrainingBatchEvent[]>([]);

	const fetchBatchEvents = useCallback(async () => {
		if (selectedBatch?.id) {
			try {
				const events = await trainingExtensionService.getBatchEvents(selectedBatch.id);
				setBatchEvents(events);
			} catch (error) {
				console.error('Failed to fetch batch events', error);
			}
		}
	}, [selectedBatch?.id]);

	useEffect(() => {
		fetchBatchEvents();
	}, [fetchBatchEvents]);

	const handleConfirmEvent = async (eventData: any) => {
		try {
			await trainingExtensionService.createBatchEvent({
				batch_id: selectedBatch.id,
				date: eventData.date,
				...eventData
			});
			enqueueSnackbar(`${eventData.event_type} added successfully`, { variant: 'success' });
			fetchBatchEvents();
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
			fetchBatchEvents();
		} catch (error) {
			enqueueSnackbar('Failed to remove event', { variant: 'error' });
		}
	};

	const maxPeriods = useMemo(() => {
		const counts = Object.values(dailyPlans).map(entries => entries.length);
		return Math.max(...counts, 0) + 1;
	}, [dailyPlans]);

	const hoursBreakdown = useMemo(() => {
		const breakdown = {
			course: 0,
			hr_session: 0,
			mock_interview: 0,
			training_total: 0,
			break: 0,
			total: 0,
			details: {
				course: {} as Record<string, number>,
				hr_session: {} as Record<string, number>,
				mock_interview: {} as Record<string, number>,
				trainer: {} as Record<string, number>
			}
		};

		weeklyPlan.forEach(entry => {
			const duration = parseTimeValue(entry.end_time) - parseTimeValue(entry.start_time);

			if (entry.activity_type === 'course') breakdown.course += duration;
			if (entry.activity_type === 'hr_session') breakdown.hr_session += duration;
			if (entry.activity_type === 'mock_interview') breakdown.mock_interview += duration;
			if (entry.activity_type === 'break') breakdown.break += duration;

			if (entry.activity_type !== 'break') {
				breakdown.training_total += duration;

				const type = entry.activity_type as 'course' | 'hr_session' | 'mock_interview';
				if (breakdown.details[type]) {
					breakdown.details[type][entry.activity_name] = (breakdown.details[type][entry.activity_name] || 0) + duration;
				}

				const trainerName = entry.trainer || 'Unassigned';
				breakdown.details.trainer[trainerName] = (breakdown.details.trainer[trainerName] || 0) + duration;
			}

			breakdown.total += duration;
		});

		if (activeTab === 1) {
			breakdown.course = 0;
			breakdown.hr_session = 0;
			breakdown.mock_interview = 0;
			breakdown.training_total = 0;
			breakdown.break = 0;
			breakdown.total = 0;
			breakdown.details.course = {};
			breakdown.details.hr_session = {};
			breakdown.details.mock_interview = {};
			breakdown.details.trainer = {};

			allPlans.forEach(entry => {
				const duration = parseTimeValue(entry.end_time) - parseTimeValue(entry.start_time);

				if (entry.activity_type === 'course') breakdown.course += duration;
				if (entry.activity_type === 'hr_session') breakdown.hr_session += duration;
				if (entry.activity_type === 'mock_interview') breakdown.mock_interview += duration;
				if (entry.activity_type === 'break') breakdown.break += duration;

				if (entry.activity_type !== 'break') {
					breakdown.training_total += duration;

					const type = entry.activity_type as 'course' | 'hr_session' | 'mock_interview';
					if (breakdown.details[type]) {
						breakdown.details[type][entry.activity_name] = (breakdown.details[type][entry.activity_name] || 0) + duration;
					}

					const trainerName = entry.trainer || 'Unassigned';
					breakdown.details.trainer[trainerName] = (breakdown.details.trainer[trainerName] || 0) + duration;
				}

				breakdown.total += duration;
			});
		}

		return breakdown;
	}, [weeklyPlan, allPlans, activeTab]);

	const handleEditEntry = useCallback((entry: TrainingBatchPlan) => {
		if (!canEdit) return;
		// Normalize: populate trainer_user_public_id from the nested trainer_user object if missing
		const normalizedEntry = {
			...entry,
			trainer_user_public_id: entry.trainer_user_public_id || entry.trainer_user?.public_id || null
		};
		setSelectedEntry(normalizedEntry);
		setDialogOpen(true);
	}, [canEdit]);

	const handleReplicateEntry = useCallback(async (entry: TrainingBatchPlan) => {
		if (!canEdit) return;
		let nextDay = addDays(parseISO(entry.date), 1);

		const dayOfWeek = nextDay.getDay();
		if (dayOfWeek === 6) {
			nextDay = addDays(nextDay, 2);
		} else if (dayOfWeek === 0) {
			nextDay = addDays(nextDay, 1);
		}

		if (nextDay > maxDate) {
			enqueueSnackbar('Cannot replicate beyond batch end date', { variant: 'warning' });
			return;
		}
		const nextDayStr = format(nextDay, 'yyyy-MM-dd');
		try {
			await dispatch(createPlanEntry({
				...entry,
				date: nextDayStr,
				batch_public_id: selectedBatch.public_id,
				public_id: undefined
			})).unwrap();
			enqueueSnackbar(`Replicated to ${format(nextDay, 'MMM d')}`, { variant: 'success' });
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to replicate entry', { variant: 'error' });
		}
	}, [canEdit, maxDate, dispatch, selectedBatch.public_id, enqueueSnackbar]);

	const handleCopyPreviousWeek = useCallback(async () => {
		if (!canEdit) return;
		const prevWeekStart = addDays(weekStart, -7);
		const prevWeekStartStr = format(prevWeekStart, 'yyyy-MM-dd');

		try {
			setFormLoading(true);
			const prevWeekPlans = await trainingPlanService.getWeeklyPlan(selectedBatch.public_id, prevWeekStartStr);

			if (prevWeekPlans.length === 0) {
				enqueueSnackbar('No plans found in the previous week', { variant: 'info' });
				return;
			}

			if (weeklyPlan.length > 0) {
				const confirm = window.confirm('Current week already has plans. This will add copied plans to existing ones. Continue?');
				if (!confirm) return;
			}

			let count = 0;
			for (const entry of prevWeekPlans) {
				const entryDate = parseISO(entry.date);
				const newDate = addDays(entryDate, 7);

				if (newDate <= maxDate) {
					await dispatch(createPlanEntry({
						...entry,
						date: format(newDate, 'yyyy-MM-dd'),
						batch_public_id: selectedBatch.public_id,
						public_id: undefined
					})).unwrap();
					count++;
				}
			}

			enqueueSnackbar(`Successfully copied ${count} entries from previous week`, { variant: 'success' });
			dispatch(fetchWeeklyPlan({
				batchPublicId: selectedBatch.public_id,
				startDate: format(weekStart, 'yyyy-MM-dd')
			}));
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to copy previous week', { variant: 'error' });
		} finally {
			setFormLoading(false);
		}
	}, [canEdit, weekStart, selectedBatch.public_id, weeklyPlan.length, maxDate, dispatch, enqueueSnackbar]);

	const handleDeleteClick = useCallback((publicId: string) => {
		if (!canEdit) return;
		setConfirmDialog({
			open: true,
			title: 'Delete Plan Entry',
			message: 'Are you sure you want to delete this plan entry? This action cannot be undone.',
			onConfirm: () => handleDeleteConfirm(publicId),
			loading: false
		});
	}, [canEdit]);

	const handleDeleteConfirm = async (publicId: string) => {
		setConfirmDialog(prev => ({ ...prev, loading: true }));
		try {
			await dispatch(deletePlanEntry(publicId)).unwrap();
			enqueueSnackbar('Entry deleted successfully', { variant: 'success' });
			setConfirmDialog(prev => ({ ...prev, open: false }));
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to delete entry', { variant: 'error' });
			setConfirmDialog(prev => ({ ...prev, loading: false }));
		}
	};

	const validatePlan = useCallback((entry: Partial<TrainingBatchPlan>) => {
		const errors: Record<string, string> = {};

		if (!entry.activity_type) errors.activity_type = 'Activity Type is required';
		if (!entry.activity_name) errors.activity_name = 'Activity Name is required';
		if (!entry.start_time) errors.start_time = 'Start Time is required';
		if (!entry.end_time) errors.end_time = 'End Time is required';

		if (['course', 'hr_session'].includes(entry.activity_type || '') && !entry.trainer) {
			errors.trainer = 'Trainer selection is required';
		}

		if (entry.activity_type === 'course') {
			const dayEntries = weeklyPlan.filter((p: TrainingBatchPlan) => p.date === entry.date && p.public_id !== entry.public_id);
			let totalHours = 0;
			if (entry.start_time && entry.end_time) {
				totalHours += parseTimeValue(entry.end_time) - parseTimeValue(entry.start_time);
			}
			dayEntries.forEach((p: TrainingBatchPlan) => {
				if (p.activity_type === 'course' && p.activity_name === entry.activity_name) {
					totalHours += parseTimeValue(p.end_time) - parseTimeValue(p.start_time);
				}
			});
			if (totalHours > 2.01) {
				errors.activity_name = `Course limit exceeded (Max 2h/day). Current: ${totalHours.toFixed(1)}h`;
			}
		}

		if (entry.start_time && entry.end_time && entry.start_time >= entry.end_time) {
			errors.end_time = 'End time must be after start time';
		}

		if (entry.end_time && entry.end_time > HARD_END_TIME) {
			errors.end_time = `Activities cannot end after ${formatTime12h(HARD_END_TIME)}`;
		}

		return Object.keys(errors).length > 0 ? errors : null;
	}, [weeklyPlan]);

	const handleOpenDialog = useCallback((date: Date) => {
		if (!canEdit) return;
		setFormErrors({});

		const dateStr = format(date, 'yyyy-MM-dd');
		const dayEntries = dailyPlans[dateStr] || [];
		let startTime = DEFAULT_START_TIME;
		if (dayEntries.length > 0) {
			startTime = dayEntries[dayEntries.length - 1].end_time.split(':').slice(0, 2).join(':');
		}

		if (startTime >= HARD_END_TIME) {
			enqueueSnackbar('Schedule is full for this day (ends at 5:30 PM)', { variant: 'info' });
			return;
		}

		let [h, m] = startTime.split(':').map(Number);
		let endH = h + 1;
		let endM = m;
		if (endH > 17 || (endH === 17 && endM > 30)) {
			endH = 17;
			endM = 30;
		}
		const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

		setSelectedEntry({
			date: dateStr,
			start_time: startTime,
			end_time: endTime,
			activity_type: 'course',
		});
		setDialogOpen(true);
	}, [canEdit, dailyPlans, enqueueSnackbar]);

	return {
		weeklyPlan,
		weekDays,
		weekStart,
		weekNumber,
		currentDate,
		setCurrentDate,
		minDate,
		maxDate,
		canGoPrev,
		canGoNext,
		handlePrevWeek,
		handleNextWeek,
		dailyPlans,
		maxPeriods,
		dialogOpen,
		setDialogOpen,
		selectedEntry,
		setSelectedEntry,
		formLoading,
		setFormLoading,
		formErrors,
		setFormErrors,
		confirmDialog,
		setConfirmDialog,
		canEdit,
		handleOpenDialog,
		handleEditEntry,
		handleReplicateEntry,
		handleDeleteClick,
		validatePlan,
		activeTab,
		setActiveTab,
		hoursBreakdown,
		batchEvents,
		handleConfirmEvent,
		handleDeleteEvent,
		handleCopyPreviousWeek
	};
};
