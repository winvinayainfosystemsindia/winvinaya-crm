import React, { useState } from 'react';
import {
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Tooltip,
	Typography
} from '@mui/material';
import {
	MoreVert,
	Visibility,
	Edit,
	Delete
} from '@mui/icons-material';
import type { CandidateListItem } from '../../../models/candidate';

interface CandidateTableActionsProps {
	candidate: CandidateListItem;
	userRole: string | null;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (candidate: CandidateListItem) => void;
}

const CandidateTableActions: React.FC<CandidateTableActionsProps> = ({
	candidate,
	userRole,
	onView,
	onEdit,
	onDelete
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleAction = (action: () => void) => {
		action();
		handleClose();
	};

	const isAdmin = userRole === 'admin';
	const isManager = isAdmin || userRole === 'manager';

	return (
		<>
			<Tooltip title="Actions">
				<IconButton
					size="small"
					onClick={handleClick}
					aria-controls={open ? 'candidate-actions-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
				>
					<MoreVert fontSize="small" />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				id="candidate-actions-menu"
				open={open}
				onClose={handleClose}
				onClick={handleClose}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				PaperProps={{
					elevation: 2,
					sx: {
						minWidth: 150,
						border: '1px solid #d5dbdb',
						'& .MuiMenuItem-root': {
							px: 1.5,
							py: 1,
						}
					}
				}}
			>
				<MenuItem onClick={() => handleAction(() => onView(candidate.public_id))}>
					<ListItemIcon>
						<Visibility fontSize="small" sx={{ color: 'primary.main' }} />
					</ListItemIcon>
					<ListItemText>
						<Typography variant="body2">View Details</Typography>
					</ListItemText>
				</MenuItem>

				{isManager && (
					<MenuItem onClick={() => handleAction(() => onEdit(candidate.public_id))}>
						<ListItemIcon>
							<Edit fontSize="small" sx={{ color: 'warning.main' }} />
						</ListItemIcon>
						<ListItemText>
							<Typography variant="body2">Edit Candidate</Typography>
						</ListItemText>
					</MenuItem>
				)}

				{isAdmin && (
					<MenuItem
						onClick={() => handleAction(() => onDelete(candidate))}
						sx={{ color: 'error.main' }}
					>
						<ListItemIcon>
							<Delete fontSize="small" color="error" />
						</ListItemIcon>
						<ListItemText>
							<Typography variant="body2" color="error">Delete Candidate</Typography>
						</ListItemText>
					</MenuItem>
				)}
			</Menu>
		</>
	);
};

export default CandidateTableActions;
