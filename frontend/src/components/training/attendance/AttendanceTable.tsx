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
	Chip,
	Box
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import type { CandidateAllocation, TrainingAttendance, TrainingBatchEvent, TrainingBatchPlan } from '../../../models/training';
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
	onMarkCandidateAll: (candidateId: number, status: string) => void;
	currentEvent?: TrainingBatchEvent;
	isDateOutOfRange: boolean;
	isFutureDate: boolean;
	isDroppedOut: (candidateId: number) => boolean;
	statuses: Array<{ value: string; label: string; icon: React.ReactNode; color: string }>;
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
	onMarkCandidateAll,
	currentEvent,
	isDateOutOfRange,
	isFutureDate,
	isDroppedOut,
	statuses
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
		return attendance.find(a => a.candidate_id === candidateId && a.date === dateStr && !a.period_id)?.status || 'present';
	};

	const getCandidateRemark = (candidateId: number) => {
		return attendance.find(a => a.candidate_id === candidateId && a.date === dateStr && !a.period_id)?.remarks || '';
	};

	const isActive = !currentEvent && !isDateOutOfRange && !isFutureDate;

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

						{hasPeriods && (
							<TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#f8f9fa', minWidth: 100 }}>
								Daily Status
							</TableCell>
						)}

						{hasPeriods ? (
							// Period-based columns
							dailyPlan.map((period) => (
								<TableCell key={period.id} align="center" sx={{ fontWeight: 700, minWidth: 150 }}>
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 700 }}>
											{period.activity_name}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{format(new Date(`2000-01-01T${period.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${period.end_time}`), 'h:mm a')}
										</Typography>
										{period.trainer && (
											<Typography variant="caption" display="block" color="text.secondary">
												Trainer: {period.trainer}
											</Typography>
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
							<TableCell colSpan={hasPeriods ? dailyPlan.length + 2 : 3} align="center" sx={{ py: 10 }}>
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
										<TableCell colSpan={hasPeriods ? dailyPlan.length + 1 : 2} align="center">
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
										statuses={statuses}
										onPeriodStatusChange={onPeriodStatusChange}
										onTrainerNotesChange={onTrainerNotesChange}
										onMarkCandidateAll={onMarkCandidateAll}
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
										statuses={statuses}
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
