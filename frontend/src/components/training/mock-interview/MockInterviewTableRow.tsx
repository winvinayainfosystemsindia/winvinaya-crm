import React, { memo } from 'react';
import {
	TableRow,
	TableCell,
	Typography,
	Chip,
	Stack,
	IconButton,
	Box,
	LinearProgress,
	Tooltip,
	useTheme
} from '@mui/material';
import {
	Visibility as ViewIcon,
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { MockInterview } from '../../../models/MockInterview';
import type { CandidateAllocation } from '../../../models/training';

interface MockInterviewTableRowProps {
	interview: MockInterview;
	allocations: CandidateAllocation[];
	onView: (interview: MockInterview) => void;
	onEdit: (interview: MockInterview) => void;
	onDelete: (id: number) => void;
	onFilterCandidate: (id: number) => void;
}

const getStatusStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case 'cleared':
			return { color: 'success', label: 'Cleared', variant: 'filled' };
		case 'rejected':
			return { color: 'error', label: 'Rejected', variant: 'filled' };
		case 're-test':
			return { color: 'warning', label: 'Re-test', variant: 'outlined' };
		case 'pending':
			return { color: 'info', label: 'Pending', variant: 'outlined' };
		case 'absent':
			return { color: 'default', label: 'Absent', variant: 'filled' };
		default:
			return { color: 'default', label: status.toUpperCase(), variant: 'outlined' };
	}
};

const MockInterviewTableRow: React.FC<MockInterviewTableRowProps> = memo(({
	interview,
	allocations,
	onView,
	onEdit,
	onDelete,
	onFilterCandidate
}) => {
	const theme = useTheme();
	const status = getStatusStyles(interview.status);
	const candidate = allocations.find(a => a.candidate_id === interview.candidate_id)?.candidate;

	const isAbsent = interview.status === 'absent';

	const renderRating = (rating: number | undefined) => {
		if (rating === undefined || rating === null) return <Typography variant="body2" color="text.secondary">N/A</Typography>;

		const color = rating >= 8 ? theme.palette.success.main : rating >= 5 ? theme.palette.warning.main : theme.palette.error.main;

		return (
			<Box sx={{ minWidth: 100 }}>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Box sx={{ width: '100%', mr: 1 }}>
						<LinearProgress
							variant="determinate"
							value={rating * 10}
							sx={{
								height: 6,
								borderRadius: 3,
								backgroundColor: theme.palette.grey[200],
								'& .MuiLinearProgress-bar': {
									backgroundColor: color
								}
							}}
						/>
					</Box>
					<Typography variant="caption" fontWeight={600} color="text.secondary">
						{rating}/10
					</Typography>
				</Stack>
			</Box>
		);
	};

	return (
		<TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
			<TableCell>
				<Typography variant="body2" fontWeight={600}>
					{format(new Date(interview.interview_date), 'MMM dd, yyyy')}
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{format(new Date(interview.interview_date), 'hh:mm a')}
				</Typography>
			</TableCell>
			<TableCell>
				<Tooltip title="Click to view all sessions for this candidate">
					<Typography
						variant="body2"
						onClick={() => onFilterCandidate(interview.candidate_id)}
						sx={{
							fontWeight: 700,
							color: '#007eb9',
							cursor: 'pointer',
							'&:hover': { textDecoration: 'underline' }
						}}
					>
						{candidate?.name || 'Unknown Candidate'}
					</Typography>
				</Tooltip>
				<Typography variant="caption" sx={{ color: '#545b64' }}>
					{candidate?.email || 'N/A'}
				</Typography>
			</TableCell>
			<TableCell>
				<Typography variant="body2" fontWeight={500}>
					{interview.interviewer_name || 'Unassigned'}
				</Typography>
			</TableCell>
			<TableCell>
				<Chip
					label={status.label}
					size="small"
					color={status.color as any}
					variant={status.variant as any}
					sx={{
						fontWeight: 600,
						fontSize: '0.7rem',
						borderRadius: '4px',
						height: '24px'
					}}
				/>
			</TableCell>
			<TableCell>
				{isAbsent ? (
					<Typography variant="caption" sx={{ fontStyle: 'italic', color: '#879196' }}>
						Score not available (Absent)
					</Typography>
				) : (
					renderRating(interview.overall_rating || 0)
				)}
			</TableCell>
			<TableCell align="right">
				<Stack direction="row" spacing={0.5} justifyContent="flex-end">
					<Tooltip title="View details">
						<IconButton size="small" onClick={() => onView(interview)}>
							<ViewIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Edit session">
						<IconButton size="small" onClick={() => onEdit(interview)}>
							<EditIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete">
						<IconButton size="small" color="error" onClick={() => onDelete(interview.id)}>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			</TableCell>
		</TableRow>
	);
});

MockInterviewTableRow.displayName = 'MockInterviewTableRow';

export default MockInterviewTableRow;

