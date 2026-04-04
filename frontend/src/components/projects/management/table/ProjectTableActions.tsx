import React from 'react';
import {
	Menu,
	MenuItem
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	ListAlt as ActivityIcon,
	TrendingUp as ProgressIcon
} from '@mui/icons-material';
import type { DSRProject } from '../../../../models/dsr';

import { useAppSelector } from '../../../../store/hooks';

interface ProjectTableActionsProps {
	anchorEl: null | HTMLElement;
	open: boolean;
	onClose: () => void;
	activeProject: DSRProject | null;
	onEdit: (project: DSRProject) => void;
	onDelete: (project: DSRProject) => void;
	onManageActivities: (project: DSRProject) => void;
	onViewSummary: (project: DSRProject) => void;
}

const ProjectTableActions: React.FC<ProjectTableActionsProps> = ({
	anchorEl,
	open,
	onClose,
	activeProject,
	onEdit,
	onDelete,
	onManageActivities,
	onViewSummary
}) => {
	const { user } = useAppSelector((state) => state.auth);
	const isPrivileged = user?.role === 'admin' || user?.role === 'manager';

	if (!activeProject) return null;

	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		>
			{activeProject.project_type === 'training' && (
				<MenuItem onClick={() => { onViewSummary(activeProject); onClose(); }}>
					<ProgressIcon sx={{ fontSize: 18, mr: 1, color: '#1d8102' }} />
					View Training Summary
				</MenuItem>
			)}
			<MenuItem onClick={() => { onManageActivities(activeProject); onClose(); }}>
				<ActivityIcon sx={{ fontSize: 18, mr: 1, color: '#0073bb' }} />
				Manage Activities
			</MenuItem>
			{isPrivileged && (
				<MenuItem onClick={() => { onEdit(activeProject); onClose(); }}>
					<EditIcon sx={{ fontSize: 18, mr: 1, color: '#545b64' }} />
					Edit
				</MenuItem>
			)}
			{user?.role === 'admin' && (
				<MenuItem onClick={() => { onDelete(activeProject); onClose(); }} sx={{ color: '#d13212' }}>
					<DeleteIcon sx={{ fontSize: 18, mr: 1, color: '#d13212' }} />
					Delete
				</MenuItem>
			)}
		</Menu>
	);
};

export default ProjectTableActions;
