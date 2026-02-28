import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Alert,
	Button,
	Box,
	Typography,
	CircularProgress,
} from '@mui/material';
import { WarningAmber as WarningIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';

export interface ConfirmDialogState {
	open: boolean;
	candidateId: number | null;
	candidateName: string;
	recordCount: number;
}

interface ClearAttendanceDialogProps {
	state: ConfirmDialogState;
	deleting: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const ClearAttendanceDialog: React.FC<ClearAttendanceDialogProps> = ({ state, deleting, onClose, onConfirm }) => (
	<Dialog
		open={state.open}
		onClose={onClose}
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
				You are about to delete <strong>{state.recordCount}</strong> attendance
				record{state.recordCount !== 1 ? 's' : ''} for{' '}
				<strong>{state.candidateName}</strong> in this batch.
			</Alert>
			<DialogContentText>
				This is typically used when a candidate was incorrectly added to this batch.
				All their marked attendance data will be soft-deleted and will no longer appear in any reports.
			</DialogContentText>
		</DialogContent>

		<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
			<Button
				onClick={onClose}
				disabled={deleting}
				variant="outlined"
				sx={{ textTransform: 'none', borderRadius: '6px' }}
			>
				Cancel
			</Button>
			<Button
				onClick={onConfirm}
				disabled={deleting}
				variant="contained"
				color="error"
				startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
				sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 700 }}
			>
				{deleting ? 'Deleting...' : `Delete ${state.recordCount} Record${state.recordCount !== 1 ? 's' : ''}`}
			</Button>
		</DialogActions>
	</Dialog>
);

export default ClearAttendanceDialog;
