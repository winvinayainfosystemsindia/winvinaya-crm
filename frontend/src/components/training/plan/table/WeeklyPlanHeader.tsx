import React from 'react';
import { Box, Stack, Typography, IconButton, Button, Alert } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { format, isSameDay } from 'date-fns';

interface WeeklyPlanHeaderProps {
	weekNumber: number;
	weekStart: Date;
	weekDays: Date[];
	canGoPrev: boolean;
	canGoNext: boolean;
	handlePrevWeek: () => void;
	handleNextWeek: () => void;
	minDate: Date;
	currentDate: Date;
	setCurrentDate: (date: Date) => void;
	canEdit: boolean;
}

const WeeklyPlanHeader: React.FC<WeeklyPlanHeaderProps> = ({
	weekNumber,
	weekStart,
	weekDays,
	canGoPrev,
	canGoNext,
	handlePrevWeek,
	handleNextWeek,
	minDate,
	currentDate,
	setCurrentDate,
	canEdit
}) => {
	return (
		<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
			<Stack direction="row" spacing={2} alignItems="center">
				<IconButton onClick={handlePrevWeek} size="small" disabled={!canGoPrev}>
					<ChevronLeftIcon />
				</IconButton>
				<Box textAlign="center" minWidth={200}>
					<Typography variant="overline" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
						WEEK {weekNumber}
					</Typography>
					<Typography variant="h6">
						{format(weekStart, 'MMM d')} - {format(weekDays[4], 'MMM d, yyyy')}
					</Typography>
				</Box>
				<IconButton onClick={handleNextWeek} size="small" disabled={!canGoNext}>
					<ChevronRightIcon />
				</IconButton>
				<Button
					variant="outlined"
					size="small"
					onClick={() => setCurrentDate(minDate)}
					disabled={isSameDay(currentDate, minDate)}
				>
					Batch Start
				</Button>
			</Stack>

			{!canEdit && (
				<Alert severity="info" variant="outlined" sx={{ py: 0 }}>
					View Only Mode
				</Alert>
			)}
		</Stack>
	);
};

export default WeeklyPlanHeader;
