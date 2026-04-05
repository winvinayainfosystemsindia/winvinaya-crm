import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Edit as EditIcon, ContentCopy as CopyIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { TrainingBatchPlan } from '../../../../../models/training';

interface PlanActionMenuProps {
	anchorEl: HTMLElement | null;
	onClose: () => void;
	onEdit: (entry: TrainingBatchPlan) => void;
	onReplicate: (entry: TrainingBatchPlan) => void;
	onDelete: (publicId: string) => void;
	selectedEntry: TrainingBatchPlan | null;
}

const PlanActionMenu: React.FC<PlanActionMenuProps> = ({
	anchorEl,
	onClose,
	onEdit,
	onReplicate,
	onDelete,
	selectedEntry
}) => {
	if (!selectedEntry) return null;

	return (
		<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
			PaperProps={{
				elevation: 3,
				sx: { minWidth: 160, borderRadius: 2 }
			}}
		>
			<MenuItem onClick={() => { onEdit(selectedEntry); onClose(); }}>
				<ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
				<ListItemText>Edit</ListItemText>
			</MenuItem>
			<MenuItem onClick={() => { onReplicate(selectedEntry); onClose(); }}>
				<ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
				<ListItemText>Copy to next day</ListItemText>
			</MenuItem>
			<MenuItem onClick={() => { onDelete(selectedEntry.public_id); onClose(); }} sx={{ color: 'error.main' }}>
				<ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
				<ListItemText>Delete</ListItemText>
			</MenuItem>
		</Menu>
	);
};

export default PlanActionMenu;
