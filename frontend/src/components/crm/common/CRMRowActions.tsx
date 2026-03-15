import React, { useState } from 'react';
import {
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Tooltip,
	Divider
} from '@mui/material';
import {
	MoreVert as MoreIcon,
	Visibility as ViewIcon,
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';

export interface ActionMenuItem {
	label: string;
	icon: React.ReactNode;
	onClick: (row: any) => void;
	color?: string;
	divider?: boolean;
	disabled?: boolean;
}

interface CRMRowActionsProps {
	row: any;
	onView?: (row: any) => void;
	onEdit?: (row: any) => void;
	onDelete?: (row: any) => void;
	extraActions?: ActionMenuItem[];
}

const CRMRowActions: React.FC<CRMRowActionsProps> = ({
	row,
	onView,
	onEdit,
	onDelete,
	extraActions = []
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleClose = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		setAnchorEl(null);
	};

	const handleAction = (callback?: (row: any) => void) => (event: React.MouseEvent<HTMLElement>) => {
		handleClose(event);
		if (callback) callback(row);
	};

	return (
		<>
			<Tooltip title="Actions">
				<IconButton
					size="small"
					onClick={handleClick}
					sx={{ 
						color: '#545b64',
						'&:hover': { bgcolor: 'rgba(84, 91, 100, 0.08)' }
					}}
				>
					<MoreIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				PaperProps={{
					elevation: 0,
					sx: {
						minWidth: 150,
						border: '1px solid #d5dbdb',
						borderRadius: '2px',
						mt: 0.5,
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						'& .MuiMenuItem-root': {
							fontSize: '0.875rem',
							py: 1,
							px: 2,
						}
					},
				}}
			>
				{onView && (
					<MenuItem onClick={handleAction(onView)}>
						<ListItemIcon sx={{ minWidth: '32px !important' }}>
							<ViewIcon fontSize="small" sx={{ color: '#007eb9' }} />
						</ListItemIcon>
						<ListItemText>View Details</ListItemText>
					</MenuItem>
				)}
				{onEdit && (
					<MenuItem onClick={handleAction(onEdit)}>
						<ListItemIcon sx={{ minWidth: '32px !important' }}>
							<EditIcon fontSize="small" sx={{ color: '#545b64' }} />
						</ListItemIcon>
						<ListItemText>Edit</ListItemText>
					</MenuItem>
				)}
				
				{extraActions.map((action, index) => (
					<React.Fragment key={index}>
						{action.divider && <Divider sx={{ my: '4px !important' }} />}
						<MenuItem 
							onClick={handleAction(action.onClick)}
							disabled={action.disabled}
						>
							<ListItemIcon sx={{ minWidth: '32px !important', color: action.color }}>
								{action.icon}
							</ListItemIcon>
							<ListItemText sx={{ color: action.color }}>{action.label}</ListItemText>
						</MenuItem>
					</React.Fragment>
				))}

				{onDelete && (
					<>
						<Divider sx={{ my: '4px !important' }} />
						<MenuItem onClick={handleAction(onDelete)} sx={{ color: '#d13212' }}>
							<ListItemIcon sx={{ minWidth: '32px !important' }}>
								<DeleteIcon fontSize="small" sx={{ color: '#d13212' }} />
							</ListItemIcon>
							<ListItemText>Delete</ListItemText>
						</MenuItem>
					</>
				)}
			</Menu>
		</>
	);
};

export default CRMRowActions;
