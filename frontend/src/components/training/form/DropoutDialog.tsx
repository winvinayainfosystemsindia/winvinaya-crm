import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	TextField
} from '@mui/material';

interface DropoutDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	remark: string;
	onRemarkChange: (value: string) => void;
	submitting: boolean;
}

const DropoutDialog: React.FC<DropoutDialogProps> = ({
	open,
	onClose,
	onConfirm,
	remark,
	onRemarkChange,
	submitting
}) => {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>Mark as Dropout</DialogTitle>
			<DialogContent>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Please provide a reason for the candidate dropping out. This action will update their active status in the training batch.
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={4}
					placeholder="Reason for dropping out (e.g., medical reasons, joined other job...)"
					value={remark}
					onChange={(e) => onRemarkChange(e.target.value)}
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: '4px'
						}
					}}
				/>
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3 }}>
				<Button onClick={onClose} disabled={submitting} sx={{ textTransform: 'none' }}>
					Cancel
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={onConfirm}
					disabled={!remark.trim() || submitting}
					sx={{
						textTransform: 'none',
						minWidth: 120,
						fontWeight: 600
					}}
				>
					{submitting ? 'Updating...' : 'Confirm Dropout'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DropoutDialog;
