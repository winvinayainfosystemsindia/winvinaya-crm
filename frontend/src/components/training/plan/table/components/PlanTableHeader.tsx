import React from 'react';
import { TableCell, Stack, Box, Typography, IconButton } from '@mui/material';
import { 
	CalendarMonth as CalendarIcon, 
	DeleteForever as RemoveEventIcon, 
	FileCopy as FileCopyIcon,
	EventBusy as HolidayIcon,
	EventAvailable as EventIcon
} from '@mui/icons-material';
import { format, startOfDay, endOfDay } from 'date-fns';

interface PlanTableHeaderProps {
	day: Date;
	minDate: Date;
	maxDate: Date;
	canEdit: boolean;
	isExporting: boolean;
	holiday: any;
	hasEntries: boolean;
	onCopyDay: (date: Date) => void;
	onDeleteEvent: (id: number) => void;
	onOpenEventDialog: (date: Date) => void;
}

const PlanTableHeader: React.FC<PlanTableHeaderProps> = ({
	day,
	minDate,
	maxDate,
	canEdit,
	isExporting,
	holiday,
	hasEntries,
	onCopyDay,
	onDeleteEvent,
	onOpenEventDialog
}) => {
	const isWithinBatch = day >= startOfDay(minDate) && day <= endOfDay(maxDate);

	return (
		<TableCell
			align="center"
			sx={{
				bgcolor: holiday ? (holiday.event_type === 'holiday' ? '#fff5f5' : '#f0f7ff') : 'inherit',
				position: 'relative',
				'&:hover .event-action': { opacity: 1 }
			}}
		>
			<Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ position: 'relative' }}>
				<Box>
					<Typography variant="subtitle2">
						{format(day, 'EEEE')}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{format(day, 'MMM d')}
					</Typography>
				</Box>

				{canEdit && isWithinBatch && !isExporting && (
					<Stack direction="row" spacing={0} className="event-action" sx={{ opacity: 0, transition: 'opacity 0.2s', position: 'absolute', right: -25 }}>
						<IconButton
							size="small"
							onClick={() => onCopyDay(day)}
							title="Copy day schedule"
							sx={{ color: 'primary.main' }}
							disabled={!hasEntries}
						>
							<FileCopyIcon sx={{ fontSize: 16 }} />
						</IconButton>
						{holiday ? (
							<IconButton
								size="small"
								color="error"
								onClick={() => onDeleteEvent(holiday.id)}
								title={`Remove ${holiday.event_type}`}
							>
								<RemoveEventIcon sx={{ fontSize: 18 }} />
							</IconButton>
						) : (
							<IconButton
								size="small"
								onClick={() => onOpenEventDialog(day)}
								title="Mark as Holiday/Event"
							>
								<CalendarIcon sx={{ fontSize: 18 }} />
							</IconButton>
						)}
					</Stack>
				)}
			</Stack>
			{holiday && (
				<Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
					{holiday.event_type === 'holiday' ? (
						<HolidayIcon sx={{ fontSize: 16, color: 'error.main' }} />
					) : (
						<EventIcon sx={{ fontSize: 16, color: 'primary.main' }} />
					)}
					<Typography variant="caption" fontWeight="bold" color={holiday.event_type === 'holiday' ? 'error.main' : 'primary.main'}>
						{holiday.title}
					</Typography>
				</Box>
			)}
		</TableCell>
	);
};

export default PlanTableHeader;
