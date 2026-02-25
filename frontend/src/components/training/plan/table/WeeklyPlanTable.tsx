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
	IconButton,
	Stack,
	Box,
	Button
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	ContentCopy as CopyIcon,
	EventBusy as HolidayIcon,
	EventAvailable as EventIcon,
	CalendarMonth as CalendarIcon,
	DeleteForever as RemoveEventIcon
} from '@mui/icons-material';
import { format, startOfDay, endOfDay } from 'date-fns';
import type { TrainingBatchPlan } from '../../../../models/training';
import { formatTime12h } from '../utils/planFormatters';

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
	tableRef: React.RefObject<HTMLDivElement | null>;
	isExporting?: boolean;
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
	tableRef,
	isExporting = false
}) => {
	return (
		<div ref={tableRef} style={{ background: '#fff' }}>
			<TableContainer component={Paper} elevation={0} variant="outlined">
				<Table sx={{ minWidth: 800 }}>
					<TableHead>
						<TableRow>
							<TableCell width={100} align="center">Time</TableCell>
							{weekDays.map((day) => {
								const dateStr = format(day, 'yyyy-MM-dd');
								const holiday = batchEvents.find(e => e.date === dateStr);
								const isWithinBatch = day >= startOfDay(minDate) && day <= endOfDay(maxDate);

								return (
									<TableCell
										key={day.toISOString()}
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
												<Box className="event-action" sx={{ opacity: 0, transition: 'opacity 0.2s', position: 'absolute', right: -10 }}>
													{holiday ? (
														<IconButton
															size="small"
															color="error"
															onClick={() => handleDeleteEvent(holiday.id)}
															title={`Remove ${holiday.event_type}`}
														>
															<RemoveEventIcon sx={{ fontSize: 18 }} />
														</IconButton>
													) : (
														<IconButton
															size="small"
															onClick={() => handleOpenEventDialog(day)}
															title="Mark as Holiday/Event"
														>
															<CalendarIcon sx={{ fontSize: 18 }} />
														</IconButton>
													)}
												</Box>
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
							})}
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
									const holiday = batchEvents.find(e => e.date === dateStr);
									const entries = dailyPlans[dateStr] || [];
									const entry = entries[periodIdx];

									const isWithinBatch = day >= startOfDay(minDate) && day <= endOfDay(maxDate);
									const isNextSlot = periodIdx === entries.length && isWithinBatch;

									return (
										<TableCell
											key={`${dateStr}-${periodIdx}`}
											sx={{
												verticalAlign: 'top',
												p: 1,
												position: 'relative',
												minHeight: 80,
												borderRight: '1px solid',
												borderRightColor: 'divider',
												bgcolor: holiday ? (holiday.event_type === 'holiday' ? '#fff5f5' : '#f0f7ff') : 'inherit',
												'&:hover': {
													bgcolor: holiday ? (holiday.event_type === 'holiday' ? '#ffebeb' : '#e6f2ff') : 'action.hover',
													'& .add-btn': { opacity: 1 }
												}
											}}
										>
											{holiday ? (
												<Box sx={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
													height: '100%',
													opacity: 0.6
												}}>
													<Typography variant="caption" fontWeight="bold" color={holiday.event_type === 'holiday' ? 'error.main' : 'primary.main'} align="center">
														{holiday.title}
													</Typography>
												</Box>
											) : entry ? (
												<Paper
													elevation={0}
													sx={{
														p: 1.5,
														bgcolor: entry.activity_type === 'break' ? 'grey.100' : 'primary.50',
														borderLeft: '4px solid',
														borderLeftColor: entry.activity_type === 'break' ? 'grey.400' : 'primary.main',
														borderRadius: 1,
														position: 'relative',
														boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
													}}
												>
													<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
														<Box sx={{ flex: 1 }}>
															<Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
																{entry.activity_name}
															</Typography>
															<Typography variant="caption" display="flex" alignItems="center" color="primary.dark" fontWeight="500">
																{formatTime12h(entry.start_time)} - {formatTime12h(entry.end_time)}
															</Typography>
															{entry.trainer && (
																<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
																	Trainer: {entry.trainer}
																</Typography>
															)}
															{entry.notes && (
																<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
																	Note: {entry.notes}
																</Typography>
															)}
														</Box>
														{canEdit && !isExporting && (
															<Box className="action-icons">
																<IconButton
																	size="small"
																	onClick={() => handleReplicateEntry(entry)}
																	sx={{ p: 0.5 }}
																	title="Replicate to next day"
																>
																	<CopyIcon sx={{ fontSize: 16 }} />
																</IconButton>
																<IconButton size="small" onClick={() => handleEditEntry(entry)} sx={{ p: 0.5 }}>
																	<EditIcon sx={{ fontSize: 16 }} />
																</IconButton>
																<IconButton size="small" onClick={() => handleDeleteEntry(entry.public_id)} sx={{ p: 0.5 }}>
																	<DeleteIcon sx={{ fontSize: 16 }} />
																</IconButton>
															</Box>
														)}
													</Stack>
												</Paper>
											) : isNextSlot && canEdit && !isExporting ? (
												<Button
													className="add-btn"
													fullWidth
													variant="outlined"
													startIcon={<AddIcon />}
													onClick={() => handleOpenDialog(day)}
													disabled={!!batchEvents.find(e => e.date === dateStr)}
													sx={{
														height: '100%',
														minHeight: 60,
														opacity: 0.6,
														borderStyle: 'dashed',
														borderColor: 'divider',
														'&:hover': { opacity: 1, borderStyle: 'solid' },
														'&.Mui-disabled': {
															bgcolor: 'action.disabledBackground',
															color: 'text.disabled',
															borderStyle: 'solid'
														}
													}}
												>
													{batchEvents.find(e => e.date === dateStr) ? 'Holiday/Event' : 'Add Activity'}
												</Button>
											) : null}
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div >
	);
};

export default WeeklyPlanTable;
