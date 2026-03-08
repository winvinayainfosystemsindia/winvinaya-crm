import React from 'react';
import {
	TableRow,
	TableCell,
	IconButton,
	Chip,
	Tooltip,
	Collapse,
	Box,
	Typography,
	Table,
	TableHead,
	TableBody,
	Alert,
	Button,
	Stack,
} from '@mui/material';
import {
	KeyboardArrowDown as ExpandMoreIcon,
	KeyboardArrowUp as ExpandLessIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Warning as WarningIcon,
	CheckCircle as ApprovedIcon,
	HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import type { DSREntry } from '../../../../models/dsr';
import { DSRStatusValues } from '../../../../models/dsr';

interface HistoryRowProps {
	entry: DSREntry;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onDelete: (id: string) => void;
	onEdit?: (id: string) => void;
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
	isExpanded,
	onToggleExpand,
	onDelete,
	onEdit
}) => {
	const totalHours = entry.items.reduce((sum, item) => sum + item.hours, 0);
	const isRejected = entry.status === DSRStatusValues.DRAFT && entry.admin_notes;
	const isDraft = entry.status === DSRStatusValues.DRAFT;

	return (
		<>
			<TableRow
				hover
				sx={{
					// Highlight rejected rows that need action
					bgcolor: isRejected ? '#fffaf9' : 'inherit',
					borderLeft: isRejected ? '3px solid #d13212' : 'none',
				}}
			>
				<TableCell>
					<IconButton size="small" onClick={onToggleExpand}>
						{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
					</IconButton>
				</TableCell>
				<TableCell sx={{ fontWeight: 600 }}>
					{new Date(entry.report_date).toLocaleDateString('en-GB', {
						day: '2-digit', month: 'short', year: 'numeric'
					})}
				</TableCell>
				<TableCell>
					<StatusChip entry={entry} />
				</TableCell>
				<TableCell>{totalHours.toFixed(1)} hrs</TableCell>
				<TableCell>
					{entry.submitted_at
						? new Date(entry.submitted_at).toLocaleString('en-GB', {
							day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
						})
						: '—'}
				</TableCell>
				<TableCell align="right">
					{isDraft && (
						<Stack direction="row" spacing={0.5} justifyContent="flex-end">
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
						</Stack>
					)}
				</TableCell>
			</TableRow>

			{/* Expanded detail row */}
			<TableRow>
				<TableCell sx={{ py: 0 }} colSpan={6}>
					<Collapse in={isExpanded} timeout="auto" unmountOnExit>
						<Box sx={{ p: 3, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>

							{/* Admin rejection feedback — shown prominently */}
							{isRejected && (
								<Alert
									severity="error"
									icon={<WarningIcon />}
									sx={{ mb: 2, borderRadius: '2px', border: '1px solid #f5bdaf' }}
									action={
										<Button
											size="small"
											variant="contained"
											sx={{
												bgcolor: '#d13212', '&:hover': { bgcolor: '#a52715' },
												textTransform: 'none', fontWeight: 700, fontSize: '0.75rem'
											}}
											onClick={() => onEdit ? onEdit(entry.public_id) : undefined}
										>
											Fix & Resubmit
										</Button>
									}
								>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
										Admin Feedback — Action Required
									</Typography>
									<Typography variant="body2">{entry.admin_notes}</Typography>
								</Alert>
							)}

							{/* Activity breakdown table */}
							<Typography variant="subtitle2" gutterBottom fontWeight={700} sx={{ color: '#232f3e', mb: 2 }}>
								Activity Breakdown
							</Typography>
							<Table size="small">
								<TableHead sx={{ bgcolor: '#eee' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Project</TableCell>
										<TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Activity</TableCell>
										<TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Duration</TableCell>
										<TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Description</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{entry.items.map((item, idx) => (
										<TableRow key={idx}>
											<TableCell sx={{ fontSize: '0.8125rem' }}>{item.project_name}</TableCell>
											<TableCell sx={{ fontSize: '0.8125rem' }}>{item.activity_name}</TableCell>
											<TableCell sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
												{item.start_time} – {item.end_time} ({item.hours}h)
											</TableCell>
											<TableCell sx={{ fontSize: '0.8125rem' }}>{item.description}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

export default HistoryRow;
