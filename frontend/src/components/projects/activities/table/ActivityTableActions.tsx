import React from 'react';
import {
	Menu,
	MenuItem
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import type { DSRActivity } from '../../../../models/dsr';

interface ActivityTableActionsProps {
	anchorEl: null | HTMLElement;
	open: boolean;
	onClose: () => void;
	activeActivity: DSRActivity | null;
	onEdit: (activity: DSRActivity) => void;
	onDelete: (activity: DSRActivity) => void;
}

const ActivityTableActions: React.FC<ActivityTableActionsProps> = ({
	anchorEl,
	open,
	onClose,
	activeActivity,
	onEdit,
	onDelete
}) => {
	if (!activeActivity) return null;

	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		>
			<MenuItem onClick={() => { onEdit(activeActivity); onClose(); }}>
				<EditIcon sx={{ fontSize: 18, mr: 1, color: '#545b64' }} />
				Edit
			</MenuItem>
			<MenuItem onClick={() => { onDelete(activeActivity); onClose(); }} sx={{ color: '#d13212' }}>
				<DeleteIcon sx={{ fontSize: 18, mr: 1, color: '#d13212' }} />
				Delete
			</MenuItem>
		</Menu>
	);
};

export default ActivityTableActions;
