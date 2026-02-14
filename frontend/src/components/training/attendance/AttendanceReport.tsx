import React, { useMemo } from 'react';
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
	Tooltip
} from '@mui/material';
import {
	CheckCircle as PresentIcon,
	Cancel as AbsentIcon,
	AccessTime as LateIcon,
	Contrast as HalfDayIcon,
	EventBusy as HolidayIcon
} from '@mui/icons-material';
import { format, eachDayOfInterval, parseISO, startOfDay, isWeekend } from 'date-fns';
import type { TrainingAttendance, CandidateAllocation, TrainingBatch, TrainingBatchEvent } from '../../../models/training';

interface AttendanceReportProps {
	attendance: TrainingAttendance[];
	allocations: CandidateAllocation[];
	batch: TrainingBatch;
	batchEvents: TrainingBatchEvent[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
	present: { label: 'P', color: '#007d35', icon: <PresentIcon fontSize="small" /> },
	absent: { label: 'A', color: '#d13212', icon: <AbsentIcon fontSize="small" /> },
	late: { label: 'L', color: '#ff9900', icon: <LateIcon fontSize="small" /> },
	half_day: { label: 'H', color: '#007eb9', icon: <HalfDayIcon fontSize="small" /> },
};

const AttendanceReport: React.FC<AttendanceReportProps> = ({ attendance, allocations, batch, batchEvents }) => {
	// Calculate the full batch duration
	const days = useMemo(() => {
		const startStr = batch.start_date || batch.duration?.start_date;
		const endStr = batch.approx_close_date || batch.duration?.end_date;

		if (!startStr || !endStr) return [];

		const start = startOfDay(parseISO(startStr));
		const end = startOfDay(parseISO(endStr));

		try {
			return eachDayOfInterval({ start, end });
		} catch (e) {
			console.error("Invalid interval for attendance report", e);
			return [];
		}
	}, [batch]);

	const getHoliday = (date: Date) => {
		const dateStr = format(date, 'yyyy-MM-dd');
		return batchEvents.find(e => e.date === dateStr && e.event_type === 'holiday');
	};

	return (
		<Box>
			<Typography variant="h6" sx={{ color: '#232f3e', fontWeight: 600, mb: 2 }}>
				Batch Attendance History Matrix
			</Typography>

			<TableContainer
				component={Paper}
				elevation={0}
				sx={{
					border: '1px solid #eaeded',
					borderRadius: '4px',
					maxHeight: '70vh',
					overflow: 'auto'
				}}
			>
				<Table size="small" stickyHeader sx={{ minWidth: (days.length * 50) + 250 }}>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									fontWeight: 700,
									bgcolor: '#f8f9fa',
									zIndex: 10,
									left: 0,
									position: 'sticky',
									borderRight: '1px solid #eaeded',
									width: 250,
									minWidth: 250
								}}
							>
								Student Name
							</TableCell>
							{days.map(day => (
								<TableCell
									key={day.toISOString()}
									align="center"
									sx={{
										fontWeight: 700,
										bgcolor: isWeekend(day) ? '#f2f3f3' : '#f8f9fa',
										minWidth: 50,
										p: 1
									}}
								>
									<Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
										{format(day, 'dd')}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{format(day, 'MMM')}
									</Typography>
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{allocations.map(allocation => (
							<TableRow key={allocation.id} hover>
								<TableCell
									sx={{
										position: 'sticky',
										left: 0,
										bgcolor: 'white',
										zIndex: 2,
										borderRight: '1px solid #eaeded',
										fontWeight: 600
									}}
								>
									<Typography variant="body2" sx={{ fontWeight: 600 }}>
										{allocation.candidate?.name}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{allocation.candidate?.email}
									</Typography>
								</TableCell>

								{days.map(day => {
									const dateStr = format(day, 'yyyy-MM-dd');
									const holiday = getHoliday(day);

									if (holiday) {
										return (
											<TableCell
												key={dateStr}
												align="center"
												sx={{ bgcolor: '#fff5f5', color: '#d32f2f', p: 0 }}
											>
												<Tooltip title={`Holiday: ${holiday.title}`}>
													<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}>
														<HolidayIcon sx={{ fontSize: 16 }} />
														<Typography sx={{ fontSize: '8px', fontWeight: 700 }}>HOL</Typography>
													</Box>
												</Tooltip>
											</TableCell>
										);
									}

									if (isWeekend(day)) {
										return (
											<TableCell
												key={dateStr}
												align="center"
												sx={{ bgcolor: '#fafafa', p: 0 }}
											>
												<Typography sx={{ fontSize: '10px', color: '#aab7b8', fontWeight: 700 }}>W/E</Typography>
											</TableCell>
										);
									}

									// Get all records for this candidate and date
									const dayRecords = attendance.filter(a => a.candidate_id === allocation.candidate_id && a.date === dateStr);

									if (dayRecords.length === 0) {
										return (
											<TableCell key={dateStr} align="center" sx={{ p: 0 }}>
												<Typography sx={{ color: '#d5dbdb' }}>-</Typography>
											</TableCell>
										);
									}

									// Consolidated Status Logic:
									// 1. All Present -> Present
									// 2. All Absent -> Absent
									// 3. Mix -> Half Day

									const statusCounts = dayRecords.reduce((acc, rec) => {
										acc[rec.status] = (acc[rec.status] || 0) + 1;
										return acc;
									}, {} as Record<string, number>);

									let consolidatedStatus = 'present';
									const totalRecords = dayRecords.length;

									if (statusCounts['absent'] === totalRecords) {
										consolidatedStatus = 'absent';
									} else if (statusCounts['present'] === totalRecords) {
										consolidatedStatus = 'present';
									} else {
										// Mix of status or mixed presence
										consolidatedStatus = 'half_day';
									}

									const statusInfo = STATUS_MAP[consolidatedStatus];
									const tooltipTitle = dayRecords.map(r =>
										`${r.period?.activity_name || 'Full Day'}: ${r.status.toUpperCase()}`
									).join('\n');

									return (
										<TableCell key={dateStr} align="center" sx={{ p: 0 }}>
											<Tooltip title={tooltipTitle}>
												<Box sx={{ color: statusInfo.color, display: 'flex', justifyContent: 'center' }}>
													{statusInfo.icon}
												</Box>
											</Tooltip>
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Legend */}
			<Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: '#fdfdfd' }}>
				<Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', color: '#545b64' }}>
					LEGEND
				</Typography>
				<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
					{Object.entries(STATUS_MAP).map(([val, info]) => (
						<Box key={val} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box sx={{ color: info.color, display: 'flex' }}>{info.icon}</Box>
							<Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{val}</Typography>
						</Box>
					))}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<HolidayIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
						<Typography variant="caption">Holiday</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<Typography variant="caption" sx={{ color: '#aab7b8', fontWeight: 700, border: '1px solid #eaeded', px: 0.5, fontSize: '9px' }}>W/E</Typography>
						<Typography variant="caption">Weekend</Typography>
					</Box>
				</Box>
			</Paper>
		</Box>
	);
};

export default AttendanceReport;
