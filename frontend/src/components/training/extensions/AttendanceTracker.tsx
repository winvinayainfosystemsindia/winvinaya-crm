import React, { useState, useEffect, useMemo } from 'react';
import {
	Box,
	CircularProgress,
	Grid,
	Alert,
	Paper,
	Typography
} from '@mui/material';
import {
	CheckCircle as PresentIcon,
	Cancel as AbsentIcon,
	AccessTime as LateIcon,
	Contrast as HalfDayIcon,
	EventBusy as HolidayIcon,
	EventAvailable as EventIcon,
	AssessmentOutlined as ReportIcon,
	EditCalendarOutlined as EditIcon
} from '@mui/icons-material';
import { format, parseISO, startOfDay, isWithinInterval } from 'date-fns';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingBatch, CandidateAllocation, TrainingAttendance, TrainingBatchEvent } from '../../../models/training';
import { useSnackbar } from 'notistack';

// Sub-components
import AttendanceHeader from '../attendance/AttendanceHeader';
import AttendanceTable from '../attendance/AttendanceTable';
import AttendanceLegend from '../attendance/AttendanceLegend';
import BatchEventDialog from '../attendance/BatchEventDialog';
import AttendanceReport from '../attendance/AttendanceReport';
import { Tabs, Tab } from '@mui/material';

interface AttendanceTrackerProps {
	batch: TrainingBatch;
	allocations: CandidateAllocation[];
}

const ATTENDANCE_STATUSES = [
	{ value: 'present', label: 'Present', icon: <PresentIcon sx={{ color: '#007d35' }} />, color: '#007d35' },
	{ value: 'absent', label: 'Absent', icon: <AbsentIcon sx={{ color: '#d13212' }} />, color: '#d13212' },
	{ value: 'late', label: 'Late', icon: <LateIcon sx={{ color: '#ff9900' }} />, color: '#ff9900' },
	{ value: 'half_day', label: 'Half Day', icon: <HalfDayIcon sx={{ color: '#007eb9' }} />, color: '#007eb9' },
];

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ batch, allocations }) => {
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
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

	const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
	const [batchEvents, setBatchEvents] = useState<TrainingBatchEvent[]>([]);
	const [eventDialogOpen, setEventDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'tracker' | 'report'>('tracker');

	useEffect(() => {
		if (batch.id) {
			fetchData();
		}
	}, [batch.id]);

	const fetchData = async () => {
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
	};

	const currentEvent = useMemo(() => {
		const dateStr = format(selectedDate, 'yyyy-MM-dd');
		return batchEvents.find(e => e.date === dateStr);
	}, [selectedDate, batchEvents]);

	const updateAttendanceState = (candidateId: number, data: Partial<TrainingAttendance>) => {
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
	};

	const handleStatusChange = (candidateId: number, status: string) => {
		updateAttendanceState(candidateId, { status: status as any });
	};

	const handleRemarkChange = (candidateId: number, remark: string) => {
		updateAttendanceState(candidateId, { remarks: remark });
	};

	const handleMarkAllPresent = () => {
		allocations.forEach(allocation => {
			handleStatusChange(allocation.candidate_id, 'present');
		});
		enqueueSnackbar('All candidates marked as present for this date', { variant: 'info' });
	};

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
			setEventDialogOpen(false);
			fetchData();
		} catch (error) {
			enqueueSnackbar('Failed to add event', { variant: 'error' });
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

	if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress thickness={2} size={40} /></Box>;

	return (
		<Box>
			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
				<Tabs
					value={activeTab}
					onChange={(_, v) => setActiveTab(v)}
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 600,
							minHeight: 48,
							color: '#545b64'
						},
						'& .Mui-selected': { color: '#007eb9 !format' },
						'& .MuiTabs-indicator': { bgcolor: '#007eb9' }
					}}
				>
					<Tab icon={<EditIcon fontSize="small" />} iconPosition="start" label="Attendance Tracker" value="tracker" />
					<Tab icon={<ReportIcon fontSize="small" />} iconPosition="start" label="Attendance Report" value="report" />
				</Tabs>
			</Box>

			{activeTab === 'tracker' ? (
				<Box sx={{ p: isDateOutOfRange ? 0 : 1 }}>
					{isDateOutOfRange && (
						<Alert severity="warning" sx={{ mb: 3, borderRadius: '4px' }}>
							The selected date ({format(selectedDate, 'MMM dd, yyyy')}) is outside the training batch duration
							({batch.start_date} to {batch.duration?.end_date}).
							Attendance tracking is restricted to the scheduled batch period.
						</Alert>
					)}

					<Grid container spacing={3}>
						<Grid size={{ xs: 12 }}>
							<AttendanceHeader
								selectedDate={selectedDate}
								onDateChange={setSelectedDate}
								batchBounds={batchBounds}
								currentEvent={currentEvent}
								onOpenEventDialog={() => setEventDialogOpen(true)}
								onDeleteEvent={handleDeleteEvent}
								onMarkAllPresent={handleMarkAllPresent}
								onSave={handleSave}
								saving={saving}
								isDateOutOfRange={isDateOutOfRange}
							/>
						</Grid>

						<Grid size={{ xs: 12, lg: 9 }}>
							{currentEvent && (
								<Box sx={{ mb: 3 }}>
									<Paper
										elevation={0}
										sx={{
											p: 4,
											textAlign: 'center',
											bgcolor: currentEvent.event_type === 'holiday' ? '#fff5f5' : '#f0f7ff',
											border: '1px solid',
											borderColor: currentEvent.event_type === 'holiday' ? '#ffcdd2' : '#bbdefb',
											borderRadius: '4px'
										}}
									>
										{currentEvent.event_type === 'holiday' ? (
											<HolidayIcon sx={{ fontSize: 48, color: '#d32f2f', mb: 1 }} />
										) : (
											<EventIcon sx={{ fontSize: 48, color: '#0288d1', mb: 1 }} />
										)}
										<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }}>
											{currentEvent.title}
										</Typography>
										<Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
											{currentEvent.description || `This date has been marked as a ${currentEvent.event_type}.`}
										</Typography>
									</Paper>
								</Box>
							)}

							<AttendanceTable
								allocations={allocations}
								selectedDate={selectedDate}
								attendance={attendance}
								onStatusChange={handleStatusChange}
								onRemarkChange={handleRemarkChange}
								currentEvent={currentEvent}
								isDateOutOfRange={isDateOutOfRange}
								statuses={ATTENDANCE_STATUSES}
							/>
						</Grid>

						<Grid size={{ xs: 12, lg: 3 }}>
							<AttendanceLegend
								attendance={attendance}
								selectedDate={selectedDate}
								statuses={ATTENDANCE_STATUSES}
							/>
						</Grid>
					</Grid>
				</Box>
			) : (
				<AttendanceReport
					attendance={attendance}
					allocations={allocations}
					batch={batch}
					batchEvents={batchEvents}
				/>
			)}

			<BatchEventDialog
				open={eventDialogOpen}
				onClose={() => setEventDialogOpen(false)}
				onConfirm={handleConfirmEvent}
				selectedDate={selectedDate}
			/>
		</Box>
	);
};

export default AttendanceTracker;
