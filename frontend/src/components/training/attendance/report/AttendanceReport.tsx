import React, { useMemo, useState } from 'react';
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
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Alert,
	CircularProgress
} from '@mui/material';
import {
	CheckCircle as PresentIcon,
	Cancel as AbsentIcon,
	AccessTime as LateIcon,
	Contrast as HalfDayIcon,
	EventBusy as HolidayIcon,
	DeleteForever as DeleteForeverIcon,
	WarningAmber as WarningIcon
} from '@mui/icons-material';
import { format, eachDayOfInterval, parseISO, startOfDay, isWeekend } from 'date-fns';
import type { TrainingAttendance, CandidateAllocation, TrainingBatch, TrainingBatchEvent } from '../../../../models/training';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { deleteAttendanceByCandidate } from '../../../../store/slices/attendanceSlice';
import { useSnackbar } from 'notistack';

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

interface ConfirmDialogState {
	open: boolean;
	candidateId: number | null;
	candidateName: string;
	recordCount: number;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ attendance, allocations, batch, batchEvents }) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const currentUser = useAppSelector(state => state.auth.user);
	const isAdmin = currentUser?.is_superuser || currentUser?.role === 'admin';

	const [deleting, setDeleting] = useState(false);
	const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
		open: false,
		candidateId: null,
		candidateName: '',
		recordCount: 0,
	});

	// Detect orphaned candidates: they have records in this batch but are no longer allocated
	const orphanedCandidates = useMemo(() => {
		const allocatedIds = new Set(allocations.map(a => a.candidate_id));
		const orphanMap = new Map<number, { count: number }>();

		attendance.forEach(rec => {
			if (!allocatedIds.has(rec.candidate_id)) {
				const existing = orphanMap.get(rec.candidate_id);
				if (existing) {
					existing.count += 1;
				} else {
					orphanMap.set(rec.candidate_id, { count: 1 });
				}
			}
		});

		return Array.from(orphanMap.entries()).map(([candidateId, data]) => ({
			candidateId,
			// Try to get name from allocations data (for candidates who were recently removed,
			// their info might still be in batch.other or we use the id as a fallback)
			name: `Candidate #${candidateId}`,
			count: data.count,
		}));
	}, [attendance, allocations]);

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

	// Count total attendance records for a candidate in this batch
	const getCandidateRecordCount = (candidateId: number) =>
		attendance.filter(a => a.candidate_id === candidateId).length;

	const handleOpenClearDialog = (allocation: CandidateAllocation) => {
		const count = getCandidateRecordCount(allocation.candidate_id);
		setConfirmDialog({
			open: true,
			candidateId: allocation.candidate_id,
			candidateName: allocation.candidate?.name || 'Unknown',
			recordCount: count,
		});
	};

	const handleConfirmDelete = async () => {
		if (!confirmDialog.candidateId) return;
		setDeleting(true);
		try {
			const result = await dispatch(deleteAttendanceByCandidate({
				candidateId: confirmDialog.candidateId,
				batchId: batch.id,
			})).unwrap();

			enqueueSnackbar(
				`Successfully cleared ${result.deleted_count} attendance record(s) for ${confirmDialog.candidateName}`,
				{ variant: 'success' }
			);
			setConfirmDialog({ open: false, candidateId: null, candidateName: '', recordCount: 0 });
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to clear attendance records', { variant: 'error' });
		} finally {
			setDeleting(false);
		}
	};

	const handleCloseDialog = () => {
		if (deleting) return;
		setConfirmDialog({ open: false, candidateId: null, candidateName: '', recordCount: 0 });
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
				<Typography variant="h6" sx={{ color: '#232f3e', fontWeight: 600 }}>
					Batch Attendance History Matrix
				</Typography>
				{isAdmin && (
					<Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<DeleteForeverIcon sx={{ fontSize: 16, color: 'error.light' }} />
						Click the delete icon on a candidate row to clear all their records
					</Typography>
				)}
			</Box>

			{/* ── Orphaned Records Warning ── */}
			{isAdmin && orphanedCandidates.length > 0 && (
				<Paper
					variant="outlined"
					sx={{ mb: 3, borderColor: '#ff9900', borderRadius: '8px', overflow: 'hidden' }}
				>
					<Box sx={{ bgcolor: '#fff8ee', px: 2.5, py: 1.5, borderBottom: '1px solid #ffe0a0', display: 'flex', alignItems: 'center', gap: 1 }}>
						<WarningIcon sx={{ color: '#e65100', fontSize: 20 }} />
						<Box>
							<Typography variant="body2" sx={{ fontWeight: 700, color: '#b34900' }}>
								Orphaned Attendance Records Found
							</Typography>
							<Typography variant="caption" color="text.secondary">
								The following candidate(s) were removed from this batch but still have attendance records here.
								These records should be cleared to keep the data clean.
							</Typography>
						</Box>
					</Box>
					{orphanedCandidates.map(oc => (
						<Box
							key={oc.candidateId}
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								px: 2.5,
								py: 1.25,
								borderBottom: '1px solid #fdebd0',
								'&:last-child': { borderBottom: 'none' },
								bgcolor: 'white',
							}}
						>
							<Box>
								<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e' }}>
									{oc.name}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{oc.count} attendance record{oc.count !== 1 ? 's' : ''} — no longer allocated to this batch
								</Typography>
							</Box>
							<Tooltip title={`Clear all ${oc.count} records for ${oc.name}`}>
								<Button
									variant="outlined"
									color="error"
									size="small"
									startIcon={<DeleteForeverIcon />}
									onClick={() => setConfirmDialog({ open: true, candidateId: oc.candidateId, candidateName: oc.name, recordCount: oc.count })}
									sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 600 }}
								>
									Clear {oc.count} Record{oc.count !== 1 ? 's' : ''}
								</Button>
							</Tooltip>
						</Box>
					))}
				</Paper>
			)}

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
				<Table size="small" stickyHeader sx={{ minWidth: (days.length * 50) + 300 }}>
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
									width: 260,
									minWidth: 260
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
							{isAdmin && (
								<TableCell
									sx={{
										fontWeight: 700,
										bgcolor: '#f8f9fa',
										minWidth: 60,
										textAlign: 'center'
									}}
								>
									Actions
								</TableCell>
							)}
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
									{getCandidateRecordCount(allocation.candidate_id) === 0 && (
										<Typography variant="caption" sx={{ display: 'block', color: '#aab7b8', fontStyle: 'italic' }}>
											No records
										</Typography>
									)}
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

									// Consolidated Status Logic
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

								{/* Admin Actions Column */}
								{isAdmin && (
									<TableCell align="center" sx={{ p: 0.5 }}>
										{getCandidateRecordCount(allocation.candidate_id) > 0 ? (
											<Tooltip title={`Clear all ${getCandidateRecordCount(allocation.candidate_id)} attendance records for ${allocation.candidate?.name}`}>
												<IconButton
													size="small"
													color="error"
													onClick={() => handleOpenClearDialog(allocation)}
													sx={{
														opacity: 0.7,
														'&:hover': { opacity: 1, bgcolor: '#fff0f0' },
														transition: 'all 0.15s'
													}}
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

			{/* Confirmation Dialog */}
			<Dialog
				open={confirmDialog.open}
				onClose={handleCloseDialog}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '8px' } }}
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
					<WarningIcon sx={{ color: 'error.main', fontSize: 28 }} />
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
							Clear All Attendance Records
						</Typography>
						<Typography variant="body2" color="text.secondary">
							This action cannot be undone
						</Typography>
					</Box>
				</DialogTitle>

				<DialogContent>
					<Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }}>
						You are about to delete <strong>{confirmDialog.recordCount}</strong> attendance
						record{confirmDialog.recordCount !== 1 ? 's' : ''} for{' '}
						<strong>{confirmDialog.candidateName}</strong> in this batch.
					</Alert>
					<DialogContentText>
						This is typically used when a candidate was incorrectly added to this batch and needs
						to be cleaned up. All their marked attendance data for this batch will be soft-deleted
						and will no longer appear in any reports.
					</DialogContentText>
				</DialogContent>

				<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
					<Button
						onClick={handleCloseDialog}
						disabled={deleting}
						variant="outlined"
						sx={{ textTransform: 'none', borderRadius: '6px' }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirmDelete}
						disabled={deleting}
						variant="contained"
						color="error"
						startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
						sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 700 }}
					>
						{deleting ? 'Deleting...' : `Delete ${confirmDialog.recordCount} Record${confirmDialog.recordCount !== 1 ? 's' : ''}`}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AttendanceReport;
