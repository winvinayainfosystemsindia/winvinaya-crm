import React, { memo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button
} from '@mui/material';

interface TrainingBatchDeleteDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	batchName?: string;
}

const TrainingBatchDeleteDialog: React.FC<TrainingBatchDeleteDialogProps> = memo(({
	open,
	onClose,
	onConfirm,
	batchName
}) => {
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle sx={{ fontWeight: 600 }}>Confirm Deletion</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Are you sure you want to delete the batch <strong>{batchName}</strong>?
					This action cannot be undone and will remove all associated data.
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ p: 2.5, pt: 0 }}>
				<Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="error"
					sx={{ textTransform: 'none', fontWeight: 600 }}
				>
					Delete Batch
				</Button>
			</DialogActions>
		</Dialog>
	);
});

TrainingBatchDeleteDialog.displayName = 'TrainingBatchDeleteDialog';

export default TrainingBatchDeleteDialog;
