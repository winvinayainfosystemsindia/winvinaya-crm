import React, { memo, useState } from 'react';
import {
	TableRow,
	TableCell,
	Box,
	Avatar,
	Typography,
	FormControl,
	Select,
	MenuItem,
	TextField,
	IconButton,
	Tooltip,
	Badge,
	Chip
} from '@mui/material';
import { Notes as NotesIcon, EditNote as EditNoteIcon } from '@mui/icons-material';
import type { CandidateAllocation, TrainingAttendance, TrainingBatchPlan } from '../../../../models/training';
import TrainerNotesDialog from '../dialogs/TrainerNotesDialog';
import { format } from 'date-fns';

interface AttendanceTableRowProps {
	allocation: CandidateAllocation;
	isActive: boolean;
	statuses: Array<{ value: string; label: string; icon: React.ReactNode; color: string }>;

	// Period-based props (optional)
	dailyPlan?: TrainingBatchPlan[];
	getPeriodAttendance?: (periodId: number) => TrainingAttendance | undefined;
	onPeriodStatusChange?: (candidateId: number, periodId: number, status: string) => void;
	onTrainerNotesChange?: (candidateId: number, periodId: number, notes: string) => void;

	// Legacy full-day props (optional)
	status?: string;
	remark?: string;
	onStatusChange?: (candidateId: number, status: string) => void;
	onRemarkChange?: (candidateId: number, remark: string) => void;
	canEditPeriod?: (period: TrainingBatchPlan) => boolean;
}

const AttendanceTableRow: React.FC<AttendanceTableRowProps> = memo(({
	allocation,
	isActive,
	statuses,
	dailyPlan,
	getPeriodAttendance,
	onPeriodStatusChange,
	onTrainerNotesChange,
	status,
	remark,
	onStatusChange,
	onRemarkChange,
	canEditPeriod
}) => {
	const hasPeriods = dailyPlan && dailyPlan.length > 0;

	// Dialog state for trainer notes
	const [notesDialogOpen, setNotesDialogOpen] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<TrainingBatchPlan | null>(null);
	const [currentNotes, setCurrentNotes] = useState('');

	const handleOpenNotesDialog = (period: TrainingBatchPlan, notes: string) => {
		setSelectedPeriod(period);
		setCurrentNotes(notes);
		setNotesDialogOpen(true);
	};

	const handleSaveNotes = (notes: string) => {
		if (selectedPeriod && onTrainerNotesChange) {
			onTrainerNotesChange(allocation.candidate_id, selectedPeriod.id!, notes);
		}
	};

	return (
		<>
			<TableRow hover sx={{ opacity: isActive ? 1 : 0.6 }}>
				{/* Student Details Column */}
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


				{hasPeriods ? (
					// Period-based cells
					dailyPlan!.map((period) => {
						const periodAttendance = getPeriodAttendance!(period.id!);
						const periodStatus = periodAttendance?.status || 'present';
						const trainerNotes = periodAttendance?.trainer_notes || '';
						const hasNotes = trainerNotes.trim().length > 0;

						return (
							<TableCell key={period.id} align="center">
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
									{period.activity_type === 'break' ? (
										<Chip
											label="BREAK"
											size="small"
											variant="outlined"
											sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20, color: 'error.main', borderColor: 'error.light', bgcolor: '#fff5f5' }}
										/>
									) : (
										<FormControl size="small" sx={{ minWidth: 120 }}>
											<Select
												value={periodStatus}
												onChange={(e) => onPeriodStatusChange!(allocation.candidate_id, period.id!, e.target.value)}
												disabled={!canEditPeriod!(period)}
												sx={{
													fontSize: '0.8125rem',
													fontWeight: 600,
													bgcolor: canEditPeriod!(period) ? 'transparent' : '#f5f5f5',
													'& .MuiOutlinedInput-root': { borderRadius: '2px' }
												}}
											>
												{statuses.map(s => (
													<MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8125rem' }}>
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
															{s.icon}
															{s.label}
														</Box>
													</MenuItem>
												))}
											</Select>
										</FormControl>
									)}

									{/* Trainer Notes Button with Badge */}
									<Tooltip title={!canEditPeriod!(period) ? "Read-only" : (hasNotes ? "View/Edit Notes" : "Add Trainer Notes")}>
										<IconButton
											size="small"
											onClick={() => handleOpenNotesDialog(period, trainerNotes)}
											disabled={!isActive || (period.activity_type === 'break')}
											sx={{

												color: hasNotes ? '#007eb9' : '#545b64',
												bgcolor: hasNotes ? '#e3f2fd' : 'transparent',
												'&:hover': {
													bgcolor: hasNotes ? '#bbdefb' : '#f0f7ff',
													color: '#007eb9'
												},
												transition: 'all 0.2s'
											}}
										>
											<Badge
												variant="dot"
												color="primary"
												invisible={!hasNotes}
												sx={{
													'& .MuiBadge-badge': {
														bgcolor: '#007eb9'
													}
												}}
											>
												{hasNotes ? <EditNoteIcon fontSize="small" /> : <NotesIcon fontSize="small" />}
											</Badge>
										</IconButton>
									</Tooltip>

									{/* Notes Preview */}
									{hasNotes && (
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{
												maxWidth: 140,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												fontSize: '0.75rem',
												fontStyle: 'italic'
											}}
										>
											"{trainerNotes}"
										</Typography>
									)}
								</Box>
							</TableCell>
						);
					})
				) : (
					// Legacy full-day cells
					<>
						<TableCell align="center">
							<FormControl size="small" sx={{ minWidth: 150 }}>
								<Select
									value={status}
									onChange={(e) => onStatusChange!(allocation.candidate_id, e.target.value)}
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
								onChange={(e) => onRemarkChange!(allocation.candidate_id, e.target.value)}
								disabled={!isActive}
								variant="standard"
								InputProps={{ disableUnderline: true, sx: { fontSize: '0.8125rem' } }}
							/>
						</TableCell>
					</>
				)}
			</TableRow>

			{/* Trainer Notes Dialog */}
			{selectedPeriod && (
				<TrainerNotesDialog
					open={notesDialogOpen}
					onClose={() => setNotesDialogOpen(false)}
					onSave={handleSaveNotes}
					candidateName={allocation.candidate?.name || 'Unknown'}
					periodName={selectedPeriod.activity_name || 'Unknown Period'}
					periodTime={`${format(new Date(`2000-01-01T${selectedPeriod.start_time}`), 'h:mm a')} - ${format(new Date(`2000-01-01T${selectedPeriod.end_time}`), 'h:mm a')}`}
					currentNotes={currentNotes}
				/>
			)}
		</>
	);
});

AttendanceTableRow.displayName = 'AttendanceTableRow';

export default AttendanceTableRow;
