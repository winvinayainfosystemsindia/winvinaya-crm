import React from 'react';
import {
	Box,
	Paper,
	Typography,
	IconButton,
	Button,
	Stack,
	CircularProgress
} from '@mui/material';
import {
	Save as SaveIcon,
	ChevronLeft as LeftIcon,
	ChevronRight as RightIcon,
	EventBusy as HolidayIcon,
	EventAvailable as EventIcon
} from '@mui/icons-material';
import { format, addDays, isWithinInterval, startOfDay } from 'date-fns';
import type { TrainingBatchEvent } from '../../../models/training';

interface AttendanceHeaderProps {
	selectedDate: Date;
	onDateChange: (date: Date) => void;
	batchBounds: { start: Date; end: Date } | null;
	currentEvent?: TrainingBatchEvent;
	onOpenEventDialog: () => void;
	onDeleteEvent: (eventId: number) => void;
	onMarkAllPresent: () => void;
	onMarkAllAbsent: () => void;
	onSave: () => void;
	saving: boolean;
	isDateOutOfRange: boolean;
	isFutureDate: boolean;
	hasNoPlan: boolean;
}

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
	selectedDate,
	onDateChange,
	batchBounds,
	currentEvent,
	onOpenEventDialog,
	onDeleteEvent,
	onMarkAllPresent,
	onMarkAllAbsent,
	onSave,
	saving,
	isDateOutOfRange,
	isFutureDate,
	hasNoPlan
}) => {
	return (
		<Paper elevation={0} sx={{ p: 2.5, border: '1px solid #eaeded', borderRadius: '4px', bgcolor: 'white' }}>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
				<Stack direction="row" spacing={2} alignItems="center">
					<IconButton
						onClick={() => onDateChange(addDays(selectedDate, -1))}
						disabled={batchBounds ? !isWithinInterval(startOfDay(addDays(selectedDate, -1)), batchBounds) : false}
						sx={{ border: '1px solid #d5dbdb' }}
					>
						<LeftIcon />
					</IconButton>
					<Box sx={{ textAlign: 'center', minWidth: 200 }}>
						<Typography variant="h6" sx={{ color: '#232f3e', fontWeight: 600 }}>
							{format(selectedDate, 'EEEE, MMM dd, yyyy')}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
							{currentEvent ? currentEvent.title : 'Regular Training Day'}
						</Typography>
					</Box>
					<IconButton
						onClick={() => onDateChange(addDays(selectedDate, 1))}
						disabled={batchBounds ? !isWithinInterval(startOfDay(addDays(selectedDate, 1)), batchBounds) : false}
						sx={{ border: '1px solid #d5dbdb' }}
					>
						<RightIcon />
					</IconButton>
				</Stack>

				<Stack direction="row" spacing={2}>
					{currentEvent ? (
						<Button
							variant="outlined"
							color="error"
							startIcon={<HolidayIcon />}
							onClick={() => onDeleteEvent(currentEvent.id!)}
							sx={{ textTransform: 'none' }}
						>
							Remove {currentEvent.event_type}
						</Button>
					) : (
						<Button
							variant="outlined"
							startIcon={<EventIcon />}
							onClick={onOpenEventDialog}
							sx={{ textTransform: 'none', color: '#545b64', borderColor: '#d5dbdb' }}
						>
							Mark Holiday/Event
						</Button>
					)}
					<Button
						variant="outlined"
						onClick={onMarkAllPresent}
						disabled={!!currentEvent || isDateOutOfRange || isFutureDate || hasNoPlan}
						sx={{ textTransform: 'none', color: '#007d35', borderColor: '#007d35' }}
					>
						Mark All Present
					</Button>
					<Button
						variant="outlined"
						onClick={onMarkAllAbsent}
						disabled={!!currentEvent || isDateOutOfRange || isFutureDate || hasNoPlan}
						sx={{ textTransform: 'none', color: '#d13212', borderColor: '#d13212' }}
					>
						Mark All Absent
					</Button>
					<Button
						variant="contained"
						startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
						onClick={onSave}
						disabled={saving || !!currentEvent || isDateOutOfRange || isFutureDate || hasNoPlan}
						sx={{
							bgcolor: '#ff9900',
							'&:hover': { bgcolor: '#ec7211' },
							textTransform: 'none',
							boxShadow: 'none',
							fontWeight: 600,
							minWidth: 150
						}}
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</Button>
				</Stack>
			</Stack>
		</Paper>
	);
};

export default AttendanceHeader;
