import React, { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import { eachDayOfInterval, parseISO, startOfDay } from 'date-fns';

import type { TrainingAttendance, CandidateAllocation, TrainingBatch, TrainingBatchEvent } from '../../../../models/training';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { deleteAttendanceByCandidate } from '../../../../store/slices/attendanceSlice';
import { useSnackbar } from 'notistack';

import AttendanceLegendBar from './AttendanceLegendBar';
import OrphanedRecordsAlert, { type OrphanedCandidate } from './OrphanedRecordsAlert';
import ClearAttendanceDialog, { type ConfirmDialogState } from './ClearAttendanceDialog';
import AttendanceMatrixTable from './AttendanceMatrixTable';

// ── Types ─────────────────────────────────────────────────────

interface AttendanceReportProps {
	attendance: TrainingAttendance[];
	allocations: CandidateAllocation[];
	batch: TrainingBatch;
	batchEvents: TrainingBatchEvent[];
}

const EMPTY_DIALOG: ConfirmDialogState = {
	open: false,
	candidateId: null,
	candidateName: '',
	recordCount: 0,
};

// ── Component ─────────────────────────────────────────────────

const AttendanceReport: React.FC<AttendanceReportProps> = ({ attendance, allocations, batch, batchEvents }) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const currentUser = useAppSelector(state => state.auth.user);
	const isAdmin = !!(currentUser?.is_superuser || currentUser?.role === 'admin');

	const [deleting, setDeleting] = useState(false);
	const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(EMPTY_DIALOG);

	// ── Derived data ──────────────────────────────────────────

	/** All calendar days in the batch window */
	const days = useMemo(() => {
		const startStr = batch.start_date || batch.duration?.start_date;
		const endStr = batch.approx_close_date || batch.duration?.end_date;
		if (!startStr || !endStr) return [];
		try {
			return eachDayOfInterval({
				start: startOfDay(parseISO(startStr)),
				end: startOfDay(parseISO(endStr)),
			});
		} catch (e) {
			console.error('Invalid interval for attendance report', e);
			return [];
		}
	}, [batch]);

	/** Candidates with records in this batch who are no longer allocated */
	const orphanedCandidates = useMemo<OrphanedCandidate[]>(() => {
		const allocatedIds = new Set(allocations.map(a => a.candidate_id));
		const orphanMap = new Map<number, { count: number; name?: string }>(); // candidateId -> {count, name}

		attendance.forEach(rec => {
			if (!allocatedIds.has(rec.candidate_id)) {
				const existing = orphanMap.get(rec.candidate_id);
				if (existing) {
					existing.count += 1;
					if (!existing.name && rec.candidate?.name) {
						existing.name = rec.candidate.name;
					}
				} else {
					orphanMap.set(rec.candidate_id, {
						count: 1,
						name: rec.candidate?.name,
					});
				}
			}
		});

		return Array.from(orphanMap.entries()).map(([candidateId, data]) => ({
			candidateId,
			name: data.name || `Candidate #${candidateId}`,
			count: data.count,
		}));
	}, [attendance, allocations]);

	// ── Helpers ───────────────────────────────────────────────

	const getCandidateRecordCount = (candidateId: number) =>
		attendance.filter(a => a.candidate_id === candidateId).length;

	const openClearDialog = (allocation: CandidateAllocation) =>
		setConfirmDialog({
			open: true,
			candidateId: allocation.candidate_id,
			candidateName: allocation.candidate?.name || 'Unknown',
			recordCount: getCandidateRecordCount(allocation.candidate_id),
		});

	const openClearDialogForOrphan = (candidate: OrphanedCandidate) =>
		setConfirmDialog({ open: true, candidateId: candidate.candidateId, candidateName: candidate.name, recordCount: candidate.count });

	const closeDialog = () => { if (!deleting) setConfirmDialog(EMPTY_DIALOG); };

	// ── Delete handler ────────────────────────────────────────

	const handleConfirmDelete = async () => {
		if (!confirmDialog.candidateId) return;
		setDeleting(true);
		try {
			const result = await dispatch(deleteAttendanceByCandidate({
				candidateId: confirmDialog.candidateId,
				batchId: batch.id,
			})).unwrap();

			enqueueSnackbar(
				`Cleared ${result.deleted_count} record(s) for ${confirmDialog.candidateName}`,
				{ variant: 'success' }
			);
			setConfirmDialog(EMPTY_DIALOG);
		} catch (err: any) {
			enqueueSnackbar(err || 'Failed to clear attendance records', { variant: 'error' });
		} finally {
			setDeleting(false);
		}
	};

	// ── Render ────────────────────────────────────────────────

	return (
		<Box>
			{/* Header */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
				<Typography variant="h6" sx={{ color: '#232f3e', fontWeight: 600 }}>
					Batch Attendance History Matrix
				</Typography>
				{isAdmin && (
					<Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<DeleteForeverIcon sx={{ fontSize: 16, color: 'error.light' }} />
						Click the delete icon on a row to clear all records for that candidate
					</Typography>
				)}
			</Box>

			{/* Orphaned records warning (admin only) */}
			{isAdmin && (
				<OrphanedRecordsAlert
					orphanedCandidates={orphanedCandidates}
					onClear={openClearDialogForOrphan}
				/>
			)}

			{/* Attendance matrix */}
			<AttendanceMatrixTable
				days={days}
				allocations={allocations}
				attendance={attendance}
				batchEvents={batchEvents}
				isAdmin={isAdmin}
				onOpenClearDialog={openClearDialog}
				getCandidateRecordCount={getCandidateRecordCount}
				setConfirmDialog={setConfirmDialog}
			/>

			{/* Status legend */}
			<AttendanceLegendBar />

			{/* Delete confirmation dialog */}
			<ClearAttendanceDialog
				state={confirmDialog}
				deleting={deleting}
				onClose={closeDialog}
				onConfirm={handleConfirmDelete}
			/>
		</Box>
	);
};

export default AttendanceReport;
