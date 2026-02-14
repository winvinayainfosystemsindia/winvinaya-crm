import React, { useState } from 'react';
import {
	Box,
	CircularProgress,
	Grid,
	Alert,
	Paper,
	Typography,
	Tabs,
	Tab
} from '@mui/material';
import {
	CheckCircle as PresentIcon,
	Cancel as AbsentIcon,
	AccessTime as LateIcon,
	Contrast as HalfDayIcon,
	EventBusy as HolidayIcon,
	EventAvailable as EventIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { TrainingBatch, CandidateAllocation } from '../../../models/training';
import { useAttendance } from './hooks/useAttendance';

// Sub-components
import AttendanceHeader from './header/AttendanceHeader';
import AttendanceTable from './table/AttendanceTable';
import AttendanceLegend from './table/AttendanceLegend';
import BatchEventDialog from './dialogs/BatchEventDialog';
import AttendanceReport from './report/AttendanceReport';

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
	const {
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
		handleMarkAllPresent,
		handleMarkAllAbsent,
		handleCandidateMarkAll,
		handleSave,
		handleConfirmEvent,
		handleDeleteEvent,
		isDroppedOut
	} = useAttendance(batch, allocations);

	const [eventDialogOpen, setEventDialogOpen] = useState(false);

	if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress thickness={2} size={40} /></Box>;

	return (
		<Box>
			<Box sx={{ borderBottom: '1px solid #eaeded', mb: 3 }}>
				<Tabs
					value={activeTab}
					onChange={(_, v) => setActiveTab(v)}
					sx={{
						minHeight: 40,
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 700,
							fontSize: '0.875rem',
							minHeight: 40,
							color: '#545b64',
							px: 3,
							'&.Mui-selected': { color: '#007eb9' }
						},
						'& .MuiTabs-indicator': { bgcolor: '#007eb9', height: 3 }
					}}
				>
					<Tab label="Attendance Tool" value="tracker" />
					<Tab label="Consolidated Report" value="report" />
				</Tabs>
			</Box>

			{activeTab === 'tracker' ? (
				<Box sx={{ p: isDateOutOfRange ? 0 : 1 }}>
					{isDateOutOfRange && (
						<Alert severity="warning" sx={{ mb: 3, borderRadius: '4px' }}>
							The selected date ({format(selectedDate, 'MMM dd, yyyy')}) is outside the training batch duration
							({batch.start_date || batch.duration?.start_date} to {batch.approx_close_date || batch.duration?.end_date}).
							Attendance tracking is restricted to the scheduled batch period.
						</Alert>
					)}

					{isFutureDate && (
						<Alert severity="error" sx={{ mb: 3, borderRadius: '4px' }}>
							Cannot mark attendance for future dates. Please select today or a past date.
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
								onMarkAllAbsent={handleMarkAllAbsent}
								onSave={handleSave}
								saving={saving}
								isDateOutOfRange={isDateOutOfRange}
								isFutureDate={isFutureDate}
								hasNoPlan={dailyPlan.length === 0}
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

							{dailyPlan.length === 0 && !currentEvent && (
								<Alert severity="info" sx={{ mb: 3 }}>
									No training plan configured for this date. You can still mark full-day attendance.
								</Alert>
							)}

							<AttendanceTable
								allocations={allocations}
								selectedDate={selectedDate}
								attendance={attendance}
								dailyPlan={dailyPlan}
								onStatusChange={handleStatusChange}
								onRemarkChange={handleRemarkChange}
								onPeriodStatusChange={handlePeriodStatusChange}
								onTrainerNotesChange={handleTrainerNotesChange}
								onMarkCandidateAll={handleCandidateMarkAll}
								currentEvent={currentEvent}
								isDateOutOfRange={isDateOutOfRange}
								isFutureDate={isFutureDate}
								isDroppedOut={isDroppedOut}
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
				onConfirm={async (data) => {
					const success = await handleConfirmEvent(data);
					if (success) setEventDialogOpen(false);
				}}
				selectedDate={selectedDate}
			/>
		</Box>
	);
};

export default AttendanceTracker;
