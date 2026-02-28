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
	Tooltip,
	IconButton,
} from '@mui/material';
import { EventBusy as HolidayIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import { format, isWeekend } from 'date-fns';
import type { TrainingAttendance, CandidateAllocation, TrainingBatchEvent } from '../../../../models/training';
import { STATUS_MAP } from './AttendanceLegendBar';
import type { ConfirmDialogState } from './ClearAttendanceDialog';

interface AttendanceMatrixTableProps {
	days: Date[];
	allocations: CandidateAllocation[];
	attendance: TrainingAttendance[];
	batchEvents: TrainingBatchEvent[];
	isAdmin: boolean;
	onOpenClearDialog: (allocation: CandidateAllocation) => void;
	getCandidateRecordCount: (candidateId: number) => number;
	setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialogState>>;
}

// ── Cell helpers ──────────────────────────────────────────────

const HolidayCell: React.FC<{ dateStr: string; title: string }> = ({ dateStr, title }) => (
	<TableCell key={dateStr} align="center" sx={{ bgcolor: '#fff5f5', color: '#d32f2f', p: 0 }}>
		<Tooltip title={`Holiday: ${title}`}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}>
				<HolidayIcon sx={{ fontSize: 16 }} />
				<Typography sx={{ fontSize: '8px', fontWeight: 700 }}>HOL</Typography>
			</Box>
		</Tooltip>
	</TableCell>
);

const WeekendCell: React.FC<{ dateStr: string }> = ({ dateStr }) => (
	<TableCell key={dateStr} align="center" sx={{ bgcolor: '#fafafa', p: 0 }}>
		<Typography sx={{ fontSize: '10px', color: '#aab7b8', fontWeight: 700 }}>W/E</Typography>
	</TableCell>
);

const EmptyCell: React.FC<{ dateStr: string }> = ({ dateStr }) => (
	<TableCell key={dateStr} align="center" sx={{ p: 0 }}>
		<Typography sx={{ color: '#d5dbdb' }}>-</Typography>
	</TableCell>
);

const StatusCell: React.FC<{ dateStr: string; dayRecords: TrainingAttendance[] }> = ({ dateStr, dayRecords }) => {
	const statusCounts = dayRecords.reduce((acc, rec) => {
		acc[rec.status] = (acc[rec.status] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const total = dayRecords.length;
	const consolidated =
		statusCounts['absent'] === total ? 'absent' :
			statusCounts['present'] === total ? 'present' :
				'half_day';

	const statusInfo = STATUS_MAP[consolidated];
	const tooltipTitle = dayRecords
		.map(r => `${r.period?.activity_name || 'Full Day'}: ${r.status.toUpperCase()}`)
		.join('\n');

	return (
		<TableCell key={dateStr} align="center" sx={{ p: 0 }}>
			<Tooltip title={tooltipTitle}>
				<Box sx={{ color: statusInfo.color, display: 'flex', justifyContent: 'center' }}>
					{statusInfo.icon}
				</Box>
			</Tooltip>
		</TableCell>
	);
};

// ── Main component ────────────────────────────────────────────

const AttendanceMatrixTable: React.FC<AttendanceMatrixTableProps> = ({
	days,
	allocations,
	attendance,
	batchEvents,
	isAdmin,
	onOpenClearDialog,
	getCandidateRecordCount,
}) => {
	const getHoliday = (day: Date) => {
		const dateStr = format(day, 'yyyy-MM-dd');
		return batchEvents.find(e => e.date === dateStr && e.event_type === 'holiday');
	};

	return (
		<TableContainer
			component={Paper}
			elevation={0}
			sx={{ border: '1px solid #eaeded', borderRadius: '4px', maxHeight: '70vh', overflow: 'auto' }}
		>
			<Table size="small" stickyHeader sx={{ minWidth: (days.length * 50) + 300 }}>

				{/* ── Head ── */}
				<TableHead>
					<TableRow>
						<TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa', zIndex: 10, left: 0, position: 'sticky', borderRight: '1px solid #eaeded', width: 260, minWidth: 260 }}>
							Student Name
						</TableCell>
						{days.map(day => (
							<TableCell
								key={day.toISOString()}
								align="center"
								sx={{ fontWeight: 700, bgcolor: isWeekend(day) ? '#f2f3f3' : '#f8f9fa', minWidth: 50, p: 1 }}
							>
								<Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>{format(day, 'dd')}</Typography>
								<Typography variant="caption" color="text.secondary">{format(day, 'MMM')}</Typography>
							</TableCell>
						))}
						{isAdmin && (
							<TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa', minWidth: 60, textAlign: 'center' }}>
								Actions
							</TableCell>
						)}
					</TableRow>
				</TableHead>

				{/* ── Body ── */}
				<TableBody>
					{allocations.map(allocation => {
						const recordCount = getCandidateRecordCount(allocation.candidate_id);

						return (
							<TableRow key={allocation.id} hover>

								{/* Student name cell (sticky) */}
								<TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 2, borderRight: '1px solid #eaeded', fontWeight: 600 }}>
									<Typography variant="body2" sx={{ fontWeight: 600 }}>{allocation.candidate?.name}</Typography>
									<Typography variant="caption" color="text.secondary">{allocation.candidate?.email}</Typography>
									{recordCount === 0 && (
										<Typography variant="caption" sx={{ display: 'block', color: '#aab7b8', fontStyle: 'italic' }}>
											No records
										</Typography>
									)}
								</TableCell>

								{/* Day cells */}
								{days.map(day => {
									const dateStr = format(day, 'yyyy-MM-dd');
									const holiday = getHoliday(day);

									if (holiday) return <HolidayCell key={dateStr} dateStr={dateStr} title={holiday.title} />;
									if (isWeekend(day)) return <WeekendCell key={dateStr} dateStr={dateStr} />;

									const dayRecords = attendance.filter(
										a => a.candidate_id === allocation.candidate_id && a.date === dateStr
									);

									if (dayRecords.length === 0) return <EmptyCell key={dateStr} dateStr={dateStr} />;
									return <StatusCell key={dateStr} dateStr={dateStr} dayRecords={dayRecords} />;
								})}

								{/* Admin actions cell */}
								{isAdmin && (
									<TableCell align="center" sx={{ p: 0.5 }}>
										{recordCount > 0 ? (
											<Tooltip title={`Clear all ${recordCount} records for ${allocation.candidate?.name}`}>
												<IconButton
													size="small"
													color="error"
													onClick={() => onOpenClearDialog(allocation)}
													sx={{ opacity: 0.7, '&:hover': { opacity: 1, bgcolor: '#fff0f0' }, transition: 'all 0.15s' }}
												>
													<DeleteForeverIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										) : (
											<Typography variant="caption" sx={{ color: '#d5dbdb' }}>—</Typography>
										)}
									</TableCell>
								)}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default AttendanceMatrixTable;
