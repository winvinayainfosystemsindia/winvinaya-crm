import React from 'react';
import {
	TableRow,
	TableCell,
	IconButton,
	Chip,
	Typography,
	Box,
	useTheme,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Warning as WarningIcon,
	CheckCircle as ApprovedIcon,
	HourglassEmpty as PendingIcon,
	Visibility as ViewIcon,
	MoreVert as MoreIcon
} from '@mui/icons-material';
import ConfirmDialog from '../../../common/ConfirmDialog';
import type { DSREntry } from '../../../../models/dsr';
import { DSRStatusValues } from '../../../../models/dsr';

interface HistoryRowProps {
	entry: DSREntry;
	onDelete: (id: string) => void;
	onEdit?: (id: string) => void;
	onView?: (id: string) => void;
}

const StatusChip: React.FC<{ entry: DSREntry }> = ({ entry }) => {
	// DRAFT with admin_notes = rejected and returned, needs re-submission
	const isRejected = entry.status === DSRStatusValues.DRAFT && entry.admin_notes;

	if (isRejected) {
		return (
			<Chip
				icon={<WarningIcon />}
				label="Re-submission Required"
				size="small"
				sx={{
					bgcolor: '#fdf3f1',
					color: '#d13212',
					border: '1px solid #f5bdaf',
					fontWeight: 700,
					fontSize: '0.65rem',
					borderRadius: '2px',
					'& .MuiChip-icon': { color: '#d13212', fontSize: 14 }
				}}
			/>
		);
	}

	const config: Record<string, { label: string; color: string; bg: string; border: string; icon?: React.ReactNode }> = {
		[DSRStatusValues.DRAFT]: {
			label: 'In Draft',
			color: '#545b64', bg: '#f3f3f3', border: '#d5dbdb'
		},
		[DSRStatusValues.SUBMITTED]: {
			label: 'Pending Review',
			color: '#0058d0', bg: '#f1f4ff', border: '#bdccf4',
			icon: <PendingIcon />
		},
		[DSRStatusValues.APPROVED]: {
			label: 'Approved',
			color: '#1d8102', bg: '#e6f4ea', border: '#a3d7a3',
			icon: <ApprovedIcon />
		},
		[DSRStatusValues.REJECTED]: {
			label: 'Rejected',
			color: '#d13212', bg: '#fdf3f1', border: '#f5bdaf'
		},
	};

	if (entry.is_leave) {
		return (
			<Chip
				label={`Leave: ${entry.leave_type || 'Unspecified'}`}
				size="small"
				sx={{
					bgcolor: '#fff4e5',
					color: '#ed6c02',
					border: '1px solid #ffe0b2',
					fontWeight: 700,
					fontSize: '0.65rem',
					borderRadius: '2px',
				}}
			/>
		);
	}

	const c = config[entry.status] || config[DSRStatusValues.DRAFT];
	return (
		<Chip
			label={c.label}
			size="small"
			sx={{
				bgcolor: c.bg,
				color: c.color,
				border: `1px solid ${c.border}`,
				fontWeight: 700,
				fontSize: '0.65rem',
				borderRadius: '2px',
			}}
		/>
	);
};

const HistoryRow: React.FC<HistoryRowProps> = ({
	entry,
	onDelete,
	onEdit,
	onView
}) => {
	const totalHours = entry.items.reduce((sum, item) => sum + item.hours, 0);
	const isRejected = entry.status === DSRStatusValues.DRAFT && entry.admin_notes;
	const isDraft = entry.status === DSRStatusValues.DRAFT;
	const theme = useTheme();

	return (
		<TableRow
			hover
			sx={{
				// Highlight rejected rows that need action
				bgcolor: isRejected ? '#fffaf9' : 'inherit',
				borderLeft: isRejected ? '3px solid #d13212' : 'none',
			}}
		>
			<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 500 }}>
						{new Date(entry.report_date).toLocaleDateString('en-GB', {
							day: '2-digit', month: 'short', year: 'numeric'
						})}
					</Typography>
				</Box>
			</TableCell>

			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<StatusChip entry={entry} />
				</Box>
			</TableCell>

			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 500, color: entry.is_leave ? '#ed6c02' : 'inherit' }}>
						{entry.is_leave ? '—' : `${totalHours.toFixed(1)} hrs`}
					</Typography>
				</Box>
			</TableCell>

			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 500 }}>
						{entry.submitted_at
							? new Date(entry.submitted_at).toLocaleString('en-GB', {
								day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
							})
							: '—'}
					</Typography>
				</Box>
			</TableCell>

			<TableCell align="right">
				<ActionMenu 
					entry={entry} 
					onView={onView} 
					onEdit={onEdit} 
					onDelete={onDelete} 
					isDraft={isDraft} 
					isRejected={!!isRejected} 
				/>
			</TableCell>
		</TableRow>
	);
};

interface ActionMenuProps {
	entry: DSREntry;
	onView?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete: (id: string) => void;
	isDraft: boolean;
	isRejected: boolean;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ entry, onView, onEdit, onDelete, isDraft, isRejected }) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleAction = (cb?: (id: string) => void) => {
		handleClose();
		if (cb) cb(entry.public_id);
	};

	const handleDeleteClick = () => {
		handleClose();
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		setDeleteDialogOpen(false);
		onDelete(entry.public_id);
	};

	return (
		<>
			<IconButton
				size="small"
				onClick={handleClick}
				sx={{ color: '#545b64' }}
			>
				<MoreIcon fontSize="small" />
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				PaperProps={{
					sx: {
						minWidth: 160,
						boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
						border: '1px solid #e5e7eb',
						borderRadius: '4px'
					}
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<MenuItem onClick={() => handleAction(onView)} sx={{ py: 1 }}>
					<ListItemIcon>
						<ViewIcon fontSize="small" sx={{ color: '#545b64' }} />
					</ListItemIcon>
					<ListItemText primary="View Details" primaryTypographyProps={{ fontSize: '0.8125rem' }} />
				</MenuItem>

				{isDraft && (
					<MenuItem onClick={() => handleAction(onEdit)} sx={{ py: 1 }}>
						<ListItemIcon>
							<EditIcon fontSize="small" sx={isRejected ? { color: '#d13212' } : { color: '#545b64' }} />
						</ListItemIcon>
						<ListItemText 
							primary={isRejected ? 'Fix & Resubmit' : 'Edit Draft'} 
							primaryTypographyProps={{ fontSize: '0.8125rem', color: isRejected ? '#d13212' : 'inherit' }} 
						/>
					</MenuItem>
				)}

				{isDraft && (
					<MenuItem onClick={handleDeleteClick} sx={{ py: 1, color: '#d32f2f' }}>
						<ListItemIcon>
							<DeleteIcon fontSize="small" color="error" />
						</ListItemIcon>
						<ListItemText primary="Delete Draft" primaryTypographyProps={{ fontSize: '0.8125rem' }} />
					</MenuItem>
				)}
			</Menu>

			<ConfirmDialog
				open={deleteDialogOpen}
				title="Delete DSR Entry"
				message={`Are you sure you want to delete the DSR entry for ${new Date(entry.report_date).toLocaleDateString()}? This action cannot be undone.`}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={handleDeleteConfirm}
				confirmText="Delete"
				severity="error"
			/>
		</>
	);
};

export default HistoryRow;
