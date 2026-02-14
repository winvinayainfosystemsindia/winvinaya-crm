import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Stack,
	Box,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Fade,
	IconButton
} from '@mui/material';
import {
	School as SchoolIcon,
	Close as CloseIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createPlanEntry, updatePlanEntry } from '../../../../store/slices/trainingPlanSlice';
import { useSnackbar } from 'notistack';
import type { TrainingBatch, TrainingBatchPlan } from '../../../../models/training';
import type { User } from '../../../../models/user';
import type { RootState } from '../../../../store/store';
import {
	ACTIVITY_TYPES,
	BREAK_OPTIONS,
	HR_OPTIONS,
	MOCK_OPTIONS
} from '../utils/planConstants';

interface PlanEntryDialogProps {
	open: boolean;
	onClose: () => void;
	selectedEntry: Partial<TrainingBatchPlan> | null;
	setSelectedEntry: (entry: Partial<TrainingBatchPlan> | null) => void;
	formLoading: boolean;
	setFormLoading: (loading: boolean) => void;
	selectedBatch: TrainingBatch;
	formErrors: Record<string, string>;
	setFormErrors: (errors: Record<string, string>) => void;
	validatePlan: (entry: Partial<TrainingBatchPlan>) => Record<string, string> | null;
}

const PlanEntryDialog: React.FC<PlanEntryDialogProps> = ({
	open,
	onClose,
	selectedEntry,
	setSelectedEntry,
	formLoading,
	setFormLoading,
	selectedBatch,
	formErrors,
	setFormErrors,
	validatePlan
}) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { users } = useAppSelector((state: RootState) => state.users);
	const courses = selectedBatch?.courses || [];

	const handleSaveEntry = async () => {
		if (!selectedEntry) return;

		const errors = validatePlan(selectedEntry);
		if (errors) {
			setFormErrors(errors);
			return;
		}

		setFormLoading(true);
		try {
			if (selectedEntry.public_id) {
				const { public_id, id, date, batch_id, created_at, updated_at, ...updateData } = selectedEntry as any;
				await dispatch(updatePlanEntry({
					publicId: selectedEntry.public_id,
					data: updateData
				})).unwrap();
				enqueueSnackbar('Entry updated successfully', { variant: 'success' });
			} else {
				await dispatch(createPlanEntry({
					...selectedEntry,
					batch_public_id: selectedBatch.public_id
				})).unwrap();
				enqueueSnackbar('Entry created successfully', { variant: 'success' });
			}
			onClose();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to save entry', { variant: 'error' });
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionComponent={Fade}
			TransitionProps={{ timeout: 400 }}
			PaperProps={{
				sx: {
					borderRadius: '4px',
					boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
					minHeight: '60vh'
				}
			}}>
			<DialogTitle sx={{
				bgcolor: '#232f3e',
				color: '#ffffff',
				py: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<SchoolIcon />
					<Box>
						<Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
							{selectedEntry?.public_id ? 'Edit Plan Entry' : 'Add Plan Entry'}
						</Typography>
						<Typography variant="caption" sx={{ color: '#879196', display: 'block' }}>
							{selectedEntry?.public_id ? `Entry ID: ${selectedEntry.public_id}` : 'Schedule a new activity'}
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={onClose} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ mt: 1 }}>
					<Box>
						<Typography variant="caption" color="text.secondary">
							Date: {selectedEntry?.date}
						</Typography>
					</Box>

					<FormControl fullWidth error={!!formErrors.activity_type}>
						<InputLabel>Activity Type</InputLabel>
						<Select
							value={selectedEntry?.activity_type || 'course'}
							label="Activity Type"
							onChange={(e) => {
								setSelectedEntry({
									...selectedEntry,
									activity_type: e.target.value as any,
									activity_name: e.target.value === 'break' ? 'General Break' : ''
								});
								if (formErrors.activity_type) setFormErrors({ ...formErrors, activity_type: '' });
							}}
						>
							{ACTIVITY_TYPES.map(type => (
								<MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
							))}
						</Select>
						{formErrors.activity_type && <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>{formErrors.activity_type}</Typography>}
					</FormControl>

					{selectedEntry?.activity_type === 'course' && (
						<FormControl fullWidth required error={!!formErrors.activity_name}>
							<InputLabel>Course</InputLabel>
							<Select
								value={selectedEntry?.activity_name || ''}
								label="Course"
								onChange={(e) => {
									setSelectedEntry({ ...selectedEntry, activity_name: e.target.value });
									if (formErrors.activity_name) setFormErrors({ ...formErrors, activity_name: '' });
								}}
							>
								{courses.map((c: any) => {
									const name = typeof c === 'string' ? c : c.name;
									return <MenuItem key={name} value={name}>{name}</MenuItem>;
								})}
								{courses.length === 0 && <MenuItem disabled>No courses in batch</MenuItem>}
							</Select>
							{formErrors.activity_name && <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>{formErrors.activity_name}</Typography>}
						</FormControl>
					)}

					{selectedEntry?.activity_type === 'break' && (
						<FormControl fullWidth required>
							<InputLabel>Break Type</InputLabel>
							<Select
								value={selectedEntry?.activity_name || ''}
								label="Break Type"
								onChange={(e) => setSelectedEntry({ ...selectedEntry, activity_name: e.target.value })}
							>
								{BREAK_OPTIONS.map(opt => (
									<MenuItem key={opt} value={opt}>{opt}</MenuItem>
								))}
							</Select>
						</FormControl>
					)}

					{selectedEntry?.activity_type === 'hr_session' && (
						<FormControl fullWidth required>
							<InputLabel>HR Activity</InputLabel>
							<Select
								value={selectedEntry?.activity_name || ''}
								label="HR Activity"
								onChange={(e) => setSelectedEntry({ ...selectedEntry, activity_name: e.target.value })}
							>
								{HR_OPTIONS.map(opt => (
									<MenuItem key={opt} value={opt}>{opt}</MenuItem>
								))}
							</Select>
						</FormControl>
					)}

					{selectedEntry?.activity_type === 'mock_interview' && (
						<FormControl fullWidth required>
							<InputLabel>Interview Type</InputLabel>
							<Select
								value={selectedEntry?.activity_name || ''}
								label="Interview Type"
								onChange={(e) => setSelectedEntry({ ...selectedEntry, activity_name: e.target.value })}
							>
								{MOCK_OPTIONS.map(opt => (
									<MenuItem key={opt} value={opt}>{opt}</MenuItem>
								))}
							</Select>
						</FormControl>
					)}

					{['event', 'other'].includes(selectedEntry?.activity_type || '') && (
						<TextField
							label="Activity Name"
							fullWidth
							required
							error={!!formErrors.activity_name}
							helperText={formErrors.activity_name}
							value={selectedEntry?.activity_name || ''}
							onChange={(e) => {
								setSelectedEntry({ ...selectedEntry, activity_name: e.target.value });
								if (formErrors.activity_name) setFormErrors({ ...formErrors, activity_name: '' });
							}}
						/>
					)}

					<Stack direction="row" spacing={2}>
						<TextField
							label="Start Time"
							type="time"
							fullWidth
							required
							error={!!formErrors.start_time}
							helperText={formErrors.start_time}
							value={selectedEntry?.start_time || ''}
							onChange={(e) => {
								setSelectedEntry({ ...selectedEntry, start_time: e.target.value });
								if (formErrors.start_time) setFormErrors({ ...formErrors, start_time: '' });
							}}
							InputLabelProps={{ shrink: true }}
							inputProps={{ step: 300 }}
						/>
						<TextField
							label="End Time"
							type="time"
							fullWidth
							required
							error={!!formErrors.end_time}
							helperText={formErrors.end_time}
							value={selectedEntry?.end_time || ''}
							onChange={(e) => {
								setSelectedEntry({ ...selectedEntry, end_time: e.target.value });
								if (formErrors.end_time) setFormErrors({ ...formErrors, end_time: '' });
							}}
							InputLabelProps={{ shrink: true }}
							inputProps={{ step: 300 }}
						/>
					</Stack>

					{['course', 'hr_session'].includes(selectedEntry?.activity_type || '') && (
						<FormControl fullWidth error={!!formErrors.trainer}>
							<InputLabel>Trainer</InputLabel>
							<Select
								required
								label="Trainer"
								value={selectedEntry?.trainer || ''}
								onChange={(e) => {
									setSelectedEntry({ ...selectedEntry, trainer: e.target.value });
									if (formErrors.trainer) setFormErrors({ ...formErrors, trainer: '' });
								}}
							>
								{users.map((u: User) => (
									<MenuItem key={u.id} value={u.full_name}>
										{u.full_name}
									</MenuItem>
								))}
							</Select>
							{formErrors.trainer && <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>{formErrors.trainer}</Typography>}
						</FormControl>
					)}

					<TextField
						label="Notes (Optional)"
						fullWidth
						multiline
						rows={2}
						value={selectedEntry?.notes || ''}
						onChange={(e) => setSelectedEntry({ ...selectedEntry, notes: e.target.value })}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={handleSaveEntry}
					disabled={formLoading}
				>
					{formLoading ? 'Saving...' : 'Save'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PlanEntryDialog;
