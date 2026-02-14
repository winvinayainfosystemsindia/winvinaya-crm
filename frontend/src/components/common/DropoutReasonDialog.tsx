import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Box
} from '@mui/material';

interface DropoutReasonDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	candidateName?: string;
}

const DropoutReasonDialog: React.FC<DropoutReasonDialogProps> = ({
	open,
	onClose,
	onConfirm,
	candidateName
}) => {
	const [reason, setReason] = useState('');
	const [error, setError] = useState('');

	const handleConfirm = () => {
		if (!reason.trim()) {
			setError('Please provide a reason for dropout');
			return;
		}
		onConfirm(reason);
		setReason('');
		setError('');
	};

	const handleClose = () => {
		onClose();
		setReason('');
		setError('');
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ bgcolor: '#d32f2f', color: 'white' }}>
				Mark Candidate as Dropout
			</DialogTitle>
			<DialogContent sx={{ pt: 3 }}>
				<Box sx={{ mt: 2 }}>
					<Typography variant="body1" gutterBottom>
						Are you sure you want to mark <strong>{candidateName || 'this candidate'}</strong> as a dropout?
					</Typography>
					<Typography variant="body2" color="text.secondary" paragraph>
						Please provide a reason for this action. This is required for tracking purposes.
					</Typography>

					<TextField
						autoFocus
						margin="dense"
						label="Reason for Dropout"
						fullWidth
						multiline
						rows={3}
						value={reason}
						onChange={(e) => {
							setReason(e.target.value);
							if (error) setError('');
						}}
						error={!!error}
						helperText={error}
						required
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={handleClose} color="inherit">
					Cancel
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					color="error"
				>
					Confirm Dropout
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DropoutReasonDialog;
