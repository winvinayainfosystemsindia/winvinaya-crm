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
} from '@mui/material';
import {
	KeyboardArrowDown as ExpandMoreIcon,
	KeyboardArrowUp as ExpandLessIcon,
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { DSREntry, DSRStatus } from '../../../../models/dsr';
import { DSRStatusValues } from '../../../../models/dsr';

interface HistoryRowProps {
	entry: DSREntry;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onDelete: (id: string) => void;
}

const HistoryRow: React.FC<HistoryRowProps> = ({
	entry,
	isExpanded,
	onToggleExpand,
	onDelete
}) => {
	const navigate = useNavigate();

	const getStatusColor = (s: DSRStatus) => {
		switch (s) {
			case DSRStatusValues.SUBMITTED: return 'primary';
			case DSRStatusValues.APPROVED: return 'success';
			case DSRStatusValues.REJECTED: return 'error';
			default: return 'default';
		}
	};

	const totalHours = entry.items.reduce((sum, item) => sum + item.hours, 0);

	return (
		<>
			<TableRow hover>
				<TableCell>
					<IconButton size="small" onClick={onToggleExpand}>
						{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
					</IconButton>
				</TableCell>
				<TableCell sx={{ fontWeight: 600 }}>{new Date(entry.report_date).toLocaleDateString()}</TableCell>
				<TableCell>
					<Chip
						label={entry.status.toUpperCase()}
						color={getStatusColor(entry.status)}
						size="small"
						variant="outlined"
						sx={{ borderRadius: '2px', fontWeight: 700, fontSize: '0.65rem' }}
					/>
				</TableCell>
				<TableCell>
					{totalHours.toFixed(1)} hrs
				</TableCell>
				<TableCell>
					{entry.submitted_at ? new Date(entry.submitted_at).toLocaleString() : 'N/A'}
				</TableCell>
				<TableCell align="right">
					{entry.status === DSRStatusValues.DRAFT && (
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
							<Tooltip title="Edit Draft">
								<IconButton size="small" onClick={() => navigate(`/dashboard/dsr/submission?id=${entry.public_id}`)}>
									<EditIcon fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete Draft">
								<IconButton size="small" color="error" onClick={() => onDelete(entry.public_id)}>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Box>
					)}
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell sx={{ py: 0 }} colSpan={6}>
					<Collapse in={isExpanded} timeout="auto" unmountOnExit>
						<Box sx={{ p: 3, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
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
											<TableCell sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{item.start_time} - {item.end_time} ({item.hours}h)</TableCell>
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
