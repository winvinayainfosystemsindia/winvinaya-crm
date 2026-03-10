import {
	TableRow,
	TableCell,
	IconButton,
	Chip,
	Tooltip,
	Stack,
	Typography,
	Box,
	useTheme
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Warning as WarningIcon,
	CheckCircle as ApprovedIcon,
	HourglassEmpty as PendingIcon,
	Visibility as ViewIcon,
} from '@mui/icons-material';
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
				<Stack direction="row" spacing={0.5} justifyContent="flex-end">
					<Tooltip title="View Details">
						<IconButton
							size="small"
							onClick={() => onView ? onView(entry.public_id) : undefined}
							sx={{ color: '#545b64' }}
						>
							<ViewIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					{isDraft && (
						<>
							<Tooltip title={isRejected ? 'Fix & Resubmit' : 'Edit Draft'}>
								<IconButton
									size="small"
									sx={isRejected ? { color: '#d13212' } : {}}
									onClick={() => onEdit ? onEdit(entry.public_id) : undefined}
								>
									<EditIcon fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete Draft">
								<IconButton size="small" color="error" onClick={() => onDelete(entry.public_id)}>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</>
					)}
				</Stack>
			</TableCell>
		</TableRow>
	);
};

export default HistoryRow;
