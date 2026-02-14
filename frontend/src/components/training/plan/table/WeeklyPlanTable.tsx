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
	ContentCopy as CopyIcon
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
	handleReplicateEntry
}) => {
	return (
		<TableContainer component={Paper} elevation={0} variant="outlined">
			<Table sx={{ minWidth: 800 }}>
				<TableHead>
					<TableRow>
						<TableCell width={100} align="center">Time</TableCell>
						{weekDays.map((day) => (
							<TableCell key={day.toISOString()} align="center">
								<Typography variant="subtitle2">
									{format(day, 'EEEE')}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{format(day, 'MMM d')}
								</Typography>
							</TableCell>
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
											'&:hover': {
												bgcolor: 'action.hover',
												'& .add-btn': { opacity: 1 }
											}
										}}
									>
										{entry ? (
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
													</Box>
													{canEdit && (
														<Box>
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
										) : isNextSlot && canEdit ? (
											<Button
												className="add-btn"
												fullWidth
												variant="outlined"
												startIcon={<AddIcon />}
												onClick={() => handleOpenDialog(day)}
												sx={{
													height: '100%',
													minHeight: 60,
													opacity: 0.6,
													borderStyle: 'dashed',
													borderColor: 'divider',
													'&:hover': { opacity: 1, borderStyle: 'solid' }
												}}
											>
												Add Activity
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
	);
};

export default WeeklyPlanTable;
