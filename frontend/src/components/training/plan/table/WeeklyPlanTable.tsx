import React from 'react';
import {
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Paper,
	Typography,
	Box,
	Stack
} from '@mui/material';
import { format, startOfDay, endOfDay } from 'date-fns';
import type { TrainingBatchPlan } from '../../../../models/training';

// Sub-components
import PlanTableHeader from './components/PlanTableHeader';
import PlanTableCell from './components/PlanTableCell';
import PlanActionMenu from './components/PlanActionMenu';

interface WeeklyPlanTableProps {
	weekDays: Date[];
	maxPeriods: number;
	dailyPlans: Record<string, TrainingBatchPlan[]>;
	minDate: Date;
	maxDate: Date;
	canEdit: boolean;
	handleOpenDialog: (date: Date) => void;
	handleEditEntry: (entry: TrainingBatchPlan) => void;
	handleDeleteEntry: (publicId: string) => void;
	handleReplicateEntry: (entry: TrainingBatchPlan) => void;
	batchEvents: any[];
	handleOpenEventDialog: (date: Date) => void;
	handleDeleteEvent: (eventId: number) => void;
	handleCopyDay: (date: Date) => void;
	tableRef: React.RefObject<HTMLDivElement | null>;
	isExporting?: boolean;
	batchName?: string;
	weekNumber?: number;
	weekStart?: Date;
}

const WeeklyPlanTable: React.FC<WeeklyPlanTableProps> = ({
	weekDays,
	maxPeriods,
	dailyPlans,
	minDate,
	maxDate,
	canEdit,
	handleOpenDialog,
	handleEditEntry,
	handleDeleteEntry,
	handleReplicateEntry,
	batchEvents,
	handleOpenEventDialog,
	handleDeleteEvent,
	handleCopyDay,
	tableRef,
	isExporting = false,
	batchName,
	weekNumber,
	weekStart
}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [selectedMenuEntry, setSelectedMenuEntry] = React.useState<TrainingBatchPlan | null>(null);

	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, entry: TrainingBatchPlan) => {
		setAnchorEl(event.currentTarget);
		setSelectedMenuEntry(entry);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedMenuEntry(null);
	};

	return (
		<div ref={tableRef} style={{ background: '#fff' }}>
			{isExporting && (
				<Box sx={{ p: 3, textAlign: 'center', borderBottom: '2px solid #232f3e', mb: 2 }}>
					<Typography variant="h4" fontWeight="800" sx={{ color: '#232f3e', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
						{batchName || 'Weekly Lesson Plan'}
					</Typography>
					<Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
						<Box sx={{ bgcolor: '#232f3e', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontWeight: 700 }}>
							WEEK {weekNumber}
						</Box>
						<Typography variant="h6" sx={{ color: '#545b64', fontWeight: 600 }}>
							{weekStart && weekDays.length > 0 ? (
								`${format(weekStart, 'MMM d, yyyy')} - ${format(weekDays[weekDays.length - 1], 'MMM d, yyyy')}`
							) : ''}
						</Typography>
					</Stack>
				</Box>
			)}
			<TableContainer component={Paper} elevation={0} variant="outlined">
				<Table sx={{ minWidth: 800 }}>
					<TableHead>
						<TableRow>
							<TableCell width={100} align="center">Time</TableCell>
							{weekDays.map((day) => (
								<PlanTableHeader
									key={day.toISOString()}
									day={day}
									minDate={minDate}
									maxDate={maxDate}
									canEdit={canEdit}
									isExporting={isExporting}
									holiday={batchEvents.find(e => e.date === format(day, 'yyyy-MM-dd'))}
									hasEntries={!!dailyPlans[format(day, 'yyyy-MM-dd')]?.length}
									onCopyDay={handleCopyDay}
									onDeleteEvent={handleDeleteEvent}
									onOpenEventDialog={handleOpenEventDialog}
								/>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{Array.from({ length: maxPeriods }).map((_, periodIdx) => (
							<TableRow key={`period-${periodIdx}`}>
								<TableCell align="center">
									<Typography variant="subtitle2" fontWeight="bold">
										Period {periodIdx + 1}
									</Typography>
								</TableCell>
								{weekDays.map((day) => {
									const dateStr = format(day, 'yyyy-MM-dd');
									const entries = dailyPlans[dateStr] || [];
									return (
										<PlanTableCell
											key={`${dateStr}-${periodIdx}`}
											day={day}
											dateStr={dateStr}
											periodIdx={periodIdx}
											holiday={batchEvents.find(e => e.date === dateStr)}
											entry={entries[periodIdx]}
											isNextSlot={periodIdx === entries.length && day >= startOfDay(minDate) && day <= endOfDay(maxDate)}
											canEdit={canEdit}
											isExporting={isExporting}
											onOpenDialog={handleOpenDialog}
											onMenuOpen={handleMenuOpen}
										/>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<PlanActionMenu
				anchorEl={anchorEl}
				onClose={handleMenuClose}
				onEdit={handleEditEntry}
				onReplicate={handleReplicateEntry}
				onDelete={handleDeleteEntry}
				selectedEntry={selectedMenuEntry}
			/>
		</div >
	);
};

export default WeeklyPlanTable;
