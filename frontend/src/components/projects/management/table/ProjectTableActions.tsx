import React from 'react';
import {
	Menu,
	MenuItem
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	ListAlt as ActivityIcon
} from '@mui/icons-material';
import type { DSRProject } from '../../../../models/dsr';

interface ProjectTableActionsProps {
	anchorEl: null | HTMLElement;
	open: boolean;
	onClose: () => void;
	activeProject: DSRProject | null;
	onEdit: (project: DSRProject) => void;
	onDelete: (project: DSRProject) => void;
	onManageActivities: (project: DSRProject) => void;
}

const ProjectTableActions: React.FC<ProjectTableActionsProps> = ({
	anchorEl,
	open,
	onClose,
	activeProject,
	onEdit,
	onDelete,
	onManageActivities
}) => {
	if (!activeProject) return null;

	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		>
			<MenuItem onClick={() => { onManageActivities(activeProject); onClose(); }}>
				<ActivityIcon sx={{ fontSize: 18, mr: 1, color: '#0073bb' }} />
				Manage Activities
			</MenuItem>
			<MenuItem onClick={() => { onEdit(activeProject); onClose(); }}>
				<EditIcon sx={{ fontSize: 18, mr: 1, color: '#545b64' }} />
				Edit
			</MenuItem>
			<MenuItem onClick={() => { onDelete(activeProject); onClose(); }} sx={{ color: '#d13212' }}>
				<DeleteIcon sx={{ fontSize: 18, mr: 1, color: '#d13212' }} />
				Delete
			</MenuItem>
		</Menu>
	);
};

export default ProjectTableActions;
