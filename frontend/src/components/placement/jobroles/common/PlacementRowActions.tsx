import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import {
	MoreVert as MoreIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';

interface PlacementRowActionsProps {
	onEdit: () => void;
	onDelete?: () => void;
}

const PlacementRowActions: React.FC<PlacementRowActionsProps> = ({ onEdit, onDelete }) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => setAnchorEl(null);

	return (
		<>
			<Tooltip title="Actions">
				<IconButton size="small" onClick={handleClick}>
					<MoreIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: 'visible',
						filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
						border: '1px solid #d5dbdb'
					}
				}}
			>
				<MenuItem onClick={(e) => { e.stopPropagation(); handleClose(); onEdit(); }}>
					<ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
					<ListItemText primary="Edit" primaryTypographyProps={{ fontSize: '0.875rem' }} />
				</MenuItem>
				{onDelete && (
					<MenuItem onClick={(e) => { e.stopPropagation(); handleClose(); onDelete(); }} sx={{ color: '#d13212' }}>
						<ListItemIcon><DeleteIcon fontSize="small" sx={{ color: '#d13212' }} /></ListItemIcon>
						<ListItemText primary="Delete" primaryTypographyProps={{ fontSize: '0.875rem' }} />
					</MenuItem>
				)}
			</Menu>
		</>
	);
};

export default PlacementRowActions;
