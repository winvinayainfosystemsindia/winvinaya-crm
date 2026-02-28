import React, { memo } from 'react';
import {
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip, FormControl, Select, MenuItem,
	Box
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import type { CandidateAllocation, TrainingAttendance, TrainingBatchEvent, TrainingBatchPlan } from '../../../../models/training';
import AttendanceTableRow from './AttendanceTableRow';

interface AttendanceTableProps {
	allocations: CandidateAllocation[];
	selectedDate: Date;
	attendance: TrainingAttendance[];
	dailyPlan: TrainingBatchPlan[];
	onStatusChange: (candidateId: number, status: string) => void;
	onRemarkChange: (candidateId: number, remark: string) => void;
	onPeriodStatusChange: (candidateId: number, periodId: number, status: string) => void;
	onTrainerNotesChange: (candidateId: number, periodId: number, notes: string) => void;
	onPeriodMarkAll: (periodId: number, status: string) => void;
	currentEvent?: TrainingBatchEvent;
	isDateOutOfRange: boolean;
	isFutureDate: boolean;
	isDroppedOut: (candidateId: number) => boolean;
	statuses: Array<{ value: string; label: string; icon: React.ReactNode; color: string }>;
	currentUser: any;
}

const AttendanceTable: React.FC<AttendanceTableProps> = memo(({
	allocations,
	selectedDate,
	attendance,
	dailyPlan,
	onStatusChange,
	onRemarkChange,
	onPeriodStatusChange,
	onTrainerNotesChange,
	onPeriodMarkAll,
	currentEvent,
	isDateOutOfRange,
	isFutureDate,
	isDroppedOut,
	statuses,
	currentUser,
}) => {
	const dateStr = format(selectedDate, 'yyyy-MM-dd');
	const hasPeriods = dailyPlan.length > 0;

	// Get attendance for a specific candidate and period
	const getPeriodAttendance = (candidateId: number, periodId: number | null) => {
		return attendance.find(a =>
			a.candidate_id === candidateId &&
			a.date === dateStr &&
			a.period_id === periodId
		);
	};

	// Legacy: Get full-day attendance
	const getCandidateStatus = (candidateId: number) => {
		return attendance.find(a => a.candidate_id === candidateId && a.date === dateStr && !a.period_id)?.status || '';
	};

	const getCandidateRemark = (candidateId: number) => {
		return attendance.find(a => a.candidate_id === candidateId && a.date === dateStr && !a.period_id)?.remarks || '';
	};

	const isActive = !currentEvent && !isDateOutOfRange && !isFutureDate;

	// Check if the current user is authorized to edit a specific period
	const canEditPeriod = (period: TrainingBatchPlan) => {
		if (!isActive) return false;
		if (period.activity_type === 'break') return false; // Never edit breaks

		// Admins and Superusers can edit anything
		if (currentUser?.is_superuser || currentUser?.role === 'admin') return true;

		// Trainers and Managers are restricted to their assigned periods
		// If trainer name matches current user's full name
		return currentUser?.full_name === period.trainer;
	};

	return (
		<TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaeded', borderRadius: '4px' }}>
			<Table>
				<TableHead sx={{ bgcolor: '#f8f9fa' }}>
					<TableRow>
						<TableCell
							sx={{
								fontWeight: 700,
								borderRight: '1px solid #eaeded',
								width: 250,
								minWidth: 250
							}}
						>
							Student Name
						</TableCell>


						{hasPeriods ? (
							// Period-based columns
							dailyPlan.map((period) => (
								<TableCell key={period.id} align="center" sx={{ fontWeight: 700, minWidth: 150 }}>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
										<Box>
											<Typography variant="body2" sx={{ fontWeight: 700 }}>
												{period.activity_name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{format(new Date(`2000-01-01T${period.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${period.end_time}`), 'h:mm a')}
											</Typography>
											{period.trainer && (
												<Typography variant="caption" display="block" sx={{ fontWeight: 600, color: 'primary.main', bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: '4px', mt: 0.5 }}>
													Trainer: {period.trainer}
												</Typography>
											)}
										</Box>

										{period.activity_type === 'break' ? (
											<Chip
												label="BREAK"
												size="small"
												color="error"
												sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20, borderRadius: '4px' }}
											/>
										) : (
											<FormControl size="small" sx={{ minWidth: 110 }}>
												<Select
													value=""
													displayEmpty
													onChange={(e) => onPeriodMarkAll(period.id!, e.target.value as string)}
													disabled={!canEditPeriod(period)}
													sx={{
														fontSize: '0.7rem',
														fontWeight: 700,
														height: 28,
														bgcolor: canEditPeriod(period) ? '#fff' : '#f5f5f5',
														'& .MuiOutlinedInput-root': { borderRadius: '4px' }
													}}
													renderValue={(selected) => {
														if (selected === "") {
															return <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Mark All</Typography>;
														}
														return selected;
													}}
												>
													{statuses.map(s => (
														<MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																{React.cloneElement(s.icon as React.ReactElement<any>, {
																	sx: { ...((s.icon as React.ReactElement<any>).props.sx || {}), fontSize: '1rem' }
																})}
																{s.label}
															</Box>
														</MenuItem>
													))}
												</Select>
											</FormControl>
										)}
									</Box>
								</TableCell>
							))
						) : (
							// Legacy full-day columns
							<>
								<TableCell align="center" sx={{ fontWeight: 700 }}>Attendance Status</TableCell>
								<TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
							</>
						)}
					</TableRow>
				</TableHead>
				<TableBody>
					{allocations.length === 0 ? (
						<TableRow>
							<TableCell colSpan={hasPeriods ? dailyPlan.length + 1 : 3} align="center" sx={{ py: 10 }}>
								<Typography color="text.secondary">No students allocated to this batch.</Typography>
							</TableCell>
						</TableRow>
					) : (
						allocations.map(allocation => {
							const droppedOut = isDroppedOut(allocation.candidate_id);

							// For dropped out candidates, show a special row
							if (droppedOut) {
								return (
									<TableRow key={allocation.id} sx={{ bgcolor: '#f5f5f5' }}>
										<TableCell>
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 600 }}>
													{allocation.candidate?.name || 'Unknown'}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{allocation.candidate?.email}
												</Typography>
											</Box>
										</TableCell>
										<TableCell colSpan={hasPeriods ? dailyPlan.length : 2} align="center">
											<Chip
												label="Dropped Out"
												size="small"
												color="error"
												icon={<BlockIcon />}
												sx={{ fontWeight: 600 }}
											/>
											<Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
												Cannot mark attendance for dropped out candidates
											</Typography>
										</TableCell>
									</TableRow>
								);
							}

							// Regular attendance row
							if (hasPeriods) {
								// Period-based row
								return (
									<AttendanceTableRow
										key={allocation.id}
										allocation={allocation}
										dailyPlan={dailyPlan}
										getPeriodAttendance={(periodId) => getPeriodAttendance(allocation.candidate_id, periodId)}
										isActive={isActive}
										onPeriodStatusChange={onPeriodStatusChange}
										onTrainerNotesChange={onTrainerNotesChange}
										canEditPeriod={canEditPeriod}
									/>
								);
							} else {
								// Legacy full-day row
								const status = getCandidateStatus(allocation.candidate_id);
								const remark = getCandidateRemark(allocation.candidate_id);

								return (
									<AttendanceTableRow
										key={allocation.id}
										allocation={allocation}
										status={status}
										remark={remark}
										isActive={isActive}
										onStatusChange={onStatusChange}
										onRemarkChange={onRemarkChange}
									/>
								);
							}
						})
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
});

AttendanceTable.displayName = 'AttendanceTable';

export default AttendanceTable;
