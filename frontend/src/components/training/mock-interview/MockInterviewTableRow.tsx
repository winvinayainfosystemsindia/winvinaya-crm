import React, { memo } from 'react';
import {
	TableRow,
	TableCell,
	Typography,
	Chip,
	Stack,
	Tooltip,
	IconButton,
	Box,
	LinearProgress,
	useTheme
} from '@mui/material';
import {
	Visibility as ViewIcon,
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { MockInterview } from '../../../models/MockInterview';

interface MockInterviewTableRowProps {
	interview: MockInterview;
	onView: (interview: MockInterview) => void;
	onEdit: (interview: MockInterview) => void;
	onDelete: (id: number) => void;
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
		default:
			return { color: 'default', label: status, variant: 'outlined' };
	}
};

const MockInterviewTableRow: React.FC<MockInterviewTableRowProps> = memo(({
	interview,
	onView,
	onEdit,
	onDelete
}) => {
	const theme = useTheme();
	const status = getStatusStyles(interview.status);

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
				{renderRating(interview.overall_rating || 0)}
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

