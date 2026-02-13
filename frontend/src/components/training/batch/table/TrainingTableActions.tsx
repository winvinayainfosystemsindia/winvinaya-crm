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
	Edit,
	Delete,
	EventRepeat
} from '@mui/icons-material';
import type { TrainingBatch } from '../../../../models/training';

interface TrainingTableActionsProps {
	batch: TrainingBatch;
	isAdmin: boolean;
	onEdit: (batch: TrainingBatch) => void;
	onExtend: (batch: TrainingBatch) => void;
	onDelete: (batch: TrainingBatch) => void;
}

const TrainingTableActions: React.FC<TrainingTableActionsProps> = ({
	batch,
	isAdmin,
	onEdit,
	onExtend,
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

	return (
		<>
			<Tooltip title="Actions">
				<IconButton
					size="small"
					onClick={handleClick}
					aria-controls={open ? 'batch-actions-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					sx={{ color: 'text.secondary' }}
				>
					<MoreVert fontSize="small" />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				id="batch-actions-menu"
				open={open}
				onClose={handleClose}
				onClick={handleClose}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				PaperProps={{
					elevation: 2,
					sx: {
						minWidth: 160,
						border: '1px solid #d5dbdb',
						'& .MuiMenuItem-root': {
							px: 1.5,
							py: 1,
						}
					}
				}}
			>
				<MenuItem onClick={() => handleAction(() => onExtend(batch))}>
					<ListItemIcon>
						<EventRepeat fontSize="small" sx={{ color: 'primary.main' }} />
					</ListItemIcon>
					<ListItemText>
						<Typography variant="body2">Extend Batch</Typography>
					</ListItemText>
				</MenuItem>

				<MenuItem onClick={() => handleAction(() => onEdit(batch))}>
					<ListItemIcon>
						<Edit fontSize="small" sx={{ color: 'warning.main' }} />
					</ListItemIcon>
					<ListItemText>
						<Typography variant="body2">Edit Batch</Typography>
					</ListItemText>
				</MenuItem>

				{isAdmin && (
					<MenuItem
						onClick={() => handleAction(() => onDelete(batch))}
						sx={{ color: 'error.main' }}
					>
						<ListItemIcon>
							<Delete fontSize="small" color="error" />
						</ListItemIcon>
						<ListItemText>
							<Typography variant="body2" color="error">Delete Batch</Typography>
						</ListItemText>
					</MenuItem>
				)}
			</Menu>
		</>
	);
};

export default TrainingTableActions;
