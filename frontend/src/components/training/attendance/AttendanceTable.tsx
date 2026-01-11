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
} from '@mui/material';
import { format } from 'date-fns';
import type { CandidateAllocation, TrainingAttendance, TrainingBatchEvent } from '../../../models/training';
import AttendanceTableRow from './AttendanceTableRow';

interface AttendanceTableProps {
	allocations: CandidateAllocation[];
	selectedDate: Date;
	attendance: TrainingAttendance[];
	onStatusChange: (candidateId: number, status: string) => void;
	onRemarkChange: (candidateId: number, remark: string) => void;
	currentEvent?: TrainingBatchEvent;
	isDateOutOfRange: boolean;
	statuses: Array<{ value: string; label: string; icon: React.ReactNode; color: string }>;
}

const AttendanceTable: React.FC<AttendanceTableProps> = memo(({
	allocations,
	selectedDate,
	attendance,
	onStatusChange,
	onRemarkChange,
	currentEvent,
	isDateOutOfRange,
	statuses
}) => {
	const dateStr = format(selectedDate, 'yyyy-MM-dd');

	const getCandidateStatus = (candidateId: number) => {
		return attendance.find(a => a.candidate_id === candidateId && a.date === dateStr)?.status || 'present';
	};

	const getCandidateRemark = (candidateId: number) => {
		return attendance.find(a => a.candidate_id === candidateId && a.date === dateStr)?.remarks || '';
	};

	return (
		<TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaeded', borderRadius: '4px' }}>
			<Table>
				<TableHead sx={{ bgcolor: '#f8f9fa' }}>
					<TableRow>
						<TableCell sx={{ fontWeight: 700, width: '40%' }}>Student Details</TableCell>
						<TableCell align="center" sx={{ fontWeight: 700 }}>Attendance Status</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{allocations.length === 0 ? (
						<TableRow>
							<TableCell colSpan={3} align="center" sx={{ py: 10 }}>
								<Typography color="text.secondary">No students allocated to this batch.</Typography>
							</TableCell>
						</TableRow>
					) : (
						allocations.map(allocation => {
							const status = getCandidateStatus(allocation.candidate_id);
							const remark = getCandidateRemark(allocation.candidate_id);
							const isActive = !currentEvent && !isDateOutOfRange;

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
						})
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
});

AttendanceTable.displayName = 'AttendanceTable';

export default AttendanceTable;

