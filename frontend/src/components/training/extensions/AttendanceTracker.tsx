import React, { useState, useEffect, useMemo } from 'react';
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
	IconButton,
	Button,
	Tooltip,
	CircularProgress,
	Stack
} from '@mui/material';
import {
	Save as SaveIcon,
	ChevronLeft as LeftIcon,
	ChevronRight as RightIcon,
	CheckCircle as PresentIcon,
	Cancel as AbsentIcon,
	AccessTime as LateIcon,
	Contrast as HalfDayIcon
} from '@mui/icons-material';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingBatch, CandidateAllocation, TrainingAttendance } from '../../../models/training';

interface AttendanceTrackerProps {
	batch: TrainingBatch;
	allocations: CandidateAllocation[];
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ batch, allocations }) => {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
	const [viewDate, setViewDate] = useState(new Date());

	// Generate visible dates (e.g., 7 days around viewDate)
	const visibleDates = useMemo(() => {
		const start = addDays(viewDate, -3);
		const end = addDays(viewDate, 3);
		return eachDayOfInterval({ start, end });
	}, [viewDate]);

	useEffect(() => {
		fetchAttendance();
	}, [batch.id]);

	const fetchAttendance = async () => {
		setLoading(true);
		try {
			const data = await trainingExtensionService.getAttendance(batch.id);
			setAttendance(data);
		} catch (error) {
			console.error('Failed to fetch attendance', error);
		} finally {
			setLoading(false);
		}
	};

	const getStatus = (candidateId: number, date: Date) => {
		const dateStr = format(date, 'yyyy-MM-dd');
		return attendance.find(a => a.candidate_id === candidateId && a.date === dateStr)?.status || 'present';
	};

	const toggleStatus = (candidateId: number, date: Date) => {
		const dateStr = format(date, 'yyyy-MM-dd');
		const statuses: ('present' | 'absent' | 'late' | 'half_day')[] = ['present', 'absent', 'late', 'half_day'];

		setAttendance(prev => {
			const existingIdx = prev.findIndex(a => a.candidate_id === candidateId && a.date === dateStr);
			const currentStatus = existingIdx >= 0 ? prev[existingIdx].status : 'present';
			const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

			if (existingIdx >= 0) {
				const updated = [...prev];
				updated[existingIdx] = { ...updated[existingIdx], status: nextStatus };
				return updated;
			} else {
				return [...prev, { batch_id: batch.id, candidate_id: candidateId, date: dateStr, status: nextStatus, remarks: null }];
			}
		});
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			// We only save records that have been modified or aren't default if not in DB
			// For simplicity we save all current state
			await trainingExtensionService.updateBulkAttendance(attendance);
			// Show success? 
		} catch (error) {
			console.error('Failed to save attendance', error);
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;

	return (
		<Box>
			<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Stack direction="row" spacing={2} alignItems="center">
					<IconButton onClick={() => setViewDate(d => addDays(d, -7))}><LeftIcon /></IconButton>
					<Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
						{format(visibleDates[0], 'MMM dd')} - {format(visibleDates[6], 'MMM dd, yyyy')}
					</Typography>
					<IconButton onClick={() => setViewDate(d => addDays(d, 7))}><RightIcon /></IconButton>
				</Stack>
				<Button
					variant="contained"
					startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
					onClick={handleSave}
					disabled={saving}
					sx={{ bgcolor: '#007eb9', '&:hover': { bgcolor: '#00679a' } }}
				>
					{saving ? 'Saving...' : 'Save Attendance'}
				</Button>
			</Box>

			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
				<Table size="small">
					<TableHead sx={{ bgcolor: '#f8f9fa' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700, minWidth: 200, borderRight: '1px solid #e0e0e0' }}>Student Name</TableCell>
							{visibleDates.map(date => (
								<TableCell key={date.toISOString()} align="center" sx={{ fontWeight: 700, minWidth: 100 }}>
									<Box>
										<Typography variant="caption" sx={{ display: 'block', color: '#545b64' }}>{format(date, 'EEE').toUpperCase()}</Typography>
										<Typography variant="body2">{format(date, 'dd')}</Typography>
									</Box>
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{allocations.map(allocation => (
							<TableRow key={allocation.id} hover>
								<TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
									{allocation.candidate?.name}
								</TableCell>
								{visibleDates.map(date => {
									const status = getStatus(allocation.candidate_id, date);
									return (
										<TableCell key={date.toISOString()} align="center">
											<Tooltip title={`Click to change: ${status}`}>
												<IconButton size="small" onClick={() => toggleStatus(allocation.candidate_id, date)}>
													{status === 'present' && <PresentIcon sx={{ color: '#2e7d32' }} />}
													{status === 'absent' && <AbsentIcon sx={{ color: '#d32f2f' }} />}
													{status === 'late' && <LateIcon sx={{ color: '#fb8c00' }} />}
													{status === 'half_day' && <HalfDayIcon sx={{ color: '#0288d1' }} />}
												</IconButton>
											</Tooltip>
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 3 }}>
				<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>LEGEND</Typography>
				<Stack direction="row" spacing={3}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<PresentIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
						<Typography variant="caption">Present</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<AbsentIcon sx={{ color: '#d32f2f', fontSize: 18 }} />
						<Typography variant="caption">Absent</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<LateIcon sx={{ color: '#fb8c00', fontSize: 18 }} />
						<Typography variant="caption">Late</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<HalfDayIcon sx={{ color: '#0288d1', fontSize: 18 }} />
						<Typography variant="caption">Half Day</Typography>
					</Box>
				</Stack>
			</Box>
		</Box>
	);
};

export default AttendanceTracker;
