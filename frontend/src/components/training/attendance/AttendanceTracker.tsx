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
	EventAvailable as EventIcon,
	AssessmentOutlined as ReportIcon,
	EditCalendarOutlined as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { TrainingBatch, CandidateAllocation } from '../../../models/training';
import { useAttendance } from './useAttendance';

// Sub-components
import AttendanceHeader from './AttendanceHeader';
import AttendanceTable from './AttendanceTable';
import AttendanceLegend from './AttendanceLegend';
import BatchEventDialog from './BatchEventDialog';
import AttendanceReport from './AttendanceReport';

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
	} = useAttendance(batch, allocations);

	const [eventDialogOpen, setEventDialogOpen] = useState(false);

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
						'& .Mui-selected': { color: '#007eb9 !important' },
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
							({batch.start_date || batch.duration?.start_date} to {batch.approx_close_date || batch.duration?.end_date}).
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
