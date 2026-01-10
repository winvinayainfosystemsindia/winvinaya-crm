import React from 'react';
import {
	Box,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	FormControl,
	Select,
	MenuItem,
	TextField,
	Avatar
} from '@mui/material';
import { format } from 'date-fns';
import type { CandidateAllocation, TrainingAttendance, TrainingBatchEvent } from '../../../models/training';

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

const AttendanceTable: React.FC<AttendanceTableProps> = ({
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
								<TableRow key={allocation.id} hover sx={{ opacity: isActive ? 1 : 0.6 }}>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<Avatar sx={{ bgcolor: '#eaeded', color: '#545b64', fontSize: '0.875rem', fontWeight: 700 }}>
												{allocation.candidate?.name?.[0]}
											</Avatar>
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 600 }}>{allocation.candidate?.name}</Typography>
												<Typography variant="caption" color="text.secondary">{allocation.candidate?.email}</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell align="center">
										<FormControl size="small" sx={{ minWidth: 150 }}>
											<Select
												value={status}
												onChange={(e) => onStatusChange(allocation.candidate_id, e.target.value)}
												disabled={!isActive}
												sx={{
													fontSize: '0.875rem',
													fontWeight: 600,
													'& .MuiOutlinedInput-root': { borderRadius: '2px' }
												}}
											>
												{statuses.map(s => (
													<MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.875rem' }}>
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
															{s.icon}
															{s.label}
														</Box>
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</TableCell>
									<TableCell>
										<TextField
											fullWidth
											size="small"
											placeholder="Add remark..."
											value={remark}
											onChange={(e) => onRemarkChange(allocation.candidate_id, e.target.value)}
											disabled={!isActive}
											variant="standard"
											InputProps={{ disableUnderline: true, sx: { fontSize: '0.8125rem' } }}
										/>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default AttendanceTable;
