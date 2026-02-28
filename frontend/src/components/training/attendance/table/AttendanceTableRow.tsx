import React, { memo, useState } from 'react';
import {
	TableRow,
	TableCell,
	Box,
	Avatar,
	Typography,
	ToggleButton,
	ToggleButtonGroup,
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

// Status config — single source of truth for color + label
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
	present: { label: 'P', color: '#007d35', bg: '#e8f5e9' },
	absent: { label: 'A', color: '#c62828', bg: '#ffebee' },
	late: { label: 'L', color: '#e65100', bg: '#fff3e0' },
	half_day: { label: 'H', color: '#0277bd', bg: '#e3f2fd' },
};

interface AttendanceTableRowProps {
	allocation: CandidateAllocation;
	isActive: boolean;

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

const StatusToggle: React.FC<{
	value: string;
	onChange: (v: string) => void;
	disabled: boolean;
	isSaved: boolean;
}> = ({ value, onChange, disabled, isSaved }) => {
	const statuses = ['present', 'absent', 'late', 'half_day'];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
			<ToggleButtonGroup
				value={value}
				exclusive
				onChange={(_, v) => { if (v) onChange(v); }}
				disabled={disabled}
				size="small"
				sx={{ '& .MuiToggleButton-root': { py: 0.25, px: 0.75, fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.4, border: '1px solid #ddd' } }}
			>
				{statuses.map(s => {
					const cfg = STATUS_CONFIG[s];
					const active = value === s;
					return (
						<ToggleButton
							key={s}
							value={s}
							sx={{
								color: active ? cfg.color : '#aab7b8',
								bgcolor: active ? cfg.bg : 'transparent',
								borderColor: active ? cfg.color : '#ddd',
								'&.Mui-selected': {
									color: cfg.color,
									bgcolor: cfg.bg,
									borderColor: cfg.color,
									'&:hover': { bgcolor: cfg.bg },
								},
								'&:hover': { bgcolor: '#f5f5f5' },
								transition: 'all 0.15s',
							}}
						>
							{cfg.label}
						</ToggleButton>
					);
				})}
			</ToggleButtonGroup>
			{/* Show saved indicator dot vs unsaved dot */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
				<Box sx={{
					width: 6, height: 6, borderRadius: '50%',
					bgcolor: isSaved ? '#007d35' : '#ff9900',
				}} />
				<Typography variant="caption" sx={{ fontSize: '0.6rem', color: isSaved ? '#007d35' : '#ff9900', fontWeight: 700 }}>
					{isSaved ? 'SAVED' : 'UNSAVED'}
				</Typography>
			</Box>
		</Box>
	);
};

const AttendanceTableRow: React.FC<AttendanceTableRowProps> = memo(({
	allocation,
	isActive,
	dailyPlan,
	getPeriodAttendance,
	onPeriodStatusChange,
	onTrainerNotesChange,
	status,
	remark,
	onStatusChange,
	onRemarkChange,
	canEditPeriod,
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
			<TableRow hover sx={{ opacity: isActive ? 1 : 0.6, '&:hover': { bgcolor: '#fafcff' } }}>
				{/* Student Details Column */}
				<TableCell sx={{ borderRight: '1px solid #eaeded' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Avatar sx={{
							width: 34, height: 34,
							bgcolor: allocation.candidate?.name ? `hsl(${(allocation.candidate.name.charCodeAt(0) * 37) % 360}, 55%, 88%)` : '#eaeded',
							color: '#232f3e', fontSize: '0.8rem', fontWeight: 700
						}}>
							{allocation.candidate?.name?.[0]?.toUpperCase()}
						</Avatar>
						<Box>
							<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e' }}>
								{allocation.candidate?.name}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{allocation.candidate?.email}
							</Typography>
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
						const isSaved = !!periodAttendance?.id;
						const editable = canEditPeriod!(period);

						return (
							<TableCell key={period.id} align="center" sx={{ p: 1 }}>
								{period.activity_type === 'break' ? (
									<Chip
										label="BREAK"
										size="small"
										variant="outlined"
										sx={{ fontWeight: 700, fontSize: '0.6rem', height: 18, color: '#999', borderColor: '#ddd' }}
									/>
								) : (
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'center' }}>
										<StatusToggle
											value={periodStatus}
											onChange={(v) => onPeriodStatusChange!(allocation.candidate_id, period.id!, v)}
											disabled={!editable}
											isSaved={isSaved}
										/>
										{/* Trainer Notes Button */}
										{editable && (
											<Tooltip title={hasNotes ? 'View / Edit Trainer Notes' : 'Add Trainer Notes'}>
												<IconButton
													size="small"
													onClick={() => handleOpenNotesDialog(period, trainerNotes)}
													sx={{
														p: 0.25,
														color: hasNotes ? '#007eb9' : '#aab7b8',
														bgcolor: hasNotes ? '#e3f2fd' : 'transparent',
														'&:hover': { bgcolor: hasNotes ? '#bbdefb' : '#f5f5f5', color: '#007eb9' },
													}}
												>
													<Badge variant="dot" color="primary" invisible={!hasNotes}>
														{hasNotes ? <EditNoteIcon sx={{ fontSize: 16 }} /> : <NotesIcon sx={{ fontSize: 16 }} />}
													</Badge>
												</IconButton>
											</Tooltip>
										)}
									</Box>
								)}
							</TableCell>
						);
					})
				) : (
					// Legacy full-day cells
					<>
						<TableCell align="center" sx={{ p: 1.5 }}>
							<StatusToggle
								value={status || 'present'}
								onChange={(v) => onStatusChange!(allocation.candidate_id, v)}
								disabled={!isActive}
								isSaved={false}
							/>
						</TableCell>
						<TableCell>
							<TextField
								fullWidth
								size="small"
								placeholder="Add remark..."
								value={remark}
								onChange={(e) => onRemarkChange!(allocation.candidate_id, e.target.value)}
								disabled={!isActive}
								variant="outlined"
								inputProps={{ style: { fontSize: '0.8125rem', padding: '6px 10px' } }}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: '#fafafa' } }}
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
