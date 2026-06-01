import React, { memo } from 'react';
import {
	TableRow,
	TableCell,
	Typography,
	Chip,
	IconButton,
	Tooltip,
	useTheme,
	alpha
} from '@mui/material';
import {
	Visibility as ViewIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	MoreVert as MoreIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { CandidateAnalysis } from '../../../../models/CandidateAnalysis';
import type { CandidateAllocation } from '../../../../models/training';
import ActionMenu, { type ActionMenuItem } from '../../../common/action-menu/ActionMenu';

interface CandidateAnalysisTableRowProps {
	analysis: CandidateAnalysis;
	allocations: CandidateAllocation[];
	onView: (analysis: CandidateAnalysis) => void;
	onEdit: (analysis: CandidateAnalysis) => void;
	onDelete: (id: number) => void;
	onFilterCandidate: (id: number) => void;
}

const getRecommendationStyles = (recommendation: string) => {
	switch (recommendation) {
		case 'ready_for_placement':
			return { color: 'success', label: 'Ready for Placement', variant: 'filled' as const };
		case 'needs_additional_training':
			return { color: 'warning', label: 'Needs Training', variant: 'outlined' as const };
		case 'assign_dsr_project':
			return { color: 'info', label: 'Assign DSR Project', variant: 'outlined' as const };
		case 'counseling_required':
			return { color: 'error', label: 'Counseling Required', variant: 'filled' as const };
		default:
			return { color: 'default', label: recommendation.replace(/_/g, ' ').toUpperCase(), variant: 'outlined' as const };
	}
};

const CandidateAnalysisTableRow: React.FC<CandidateAnalysisTableRowProps> = memo(({
	analysis,
	allocations,
	onView,
	onEdit,
	onDelete,
	onFilterCandidate
}) => {
	const theme = useTheme();
	const rec = getRecommendationStyles(analysis.recommendation);
	const candidate = allocations.find(a => a.candidate_id === analysis.candidate_id)?.candidate;

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	const actions: ActionMenuItem[] = [
		{
			label: 'View Analysis',
			icon: <ViewIcon fontSize="small" />,
			onClick: () => onView(analysis)
		},
		{
			label: 'Edit Analysis',
			icon: <EditIcon fontSize="small" />,
			onClick: () => onEdit(analysis),
			color: 'info.main'
		},
		{
			label: 'Delete',
			icon: <DeleteIcon fontSize="small" />,
			onClick: () => onDelete(analysis.id),
			color: 'error.main',
			divider: true
		}
	];

	return (
		<TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
			<TableCell>
				<Typography variant="body2" fontWeight={600}>
					{format(new Date(analysis.analysis_date), 'MMM dd, yyyy')}
				</Typography>
			</TableCell>
			<TableCell>
				<Tooltip title="Click to filter by candidate">
					<Typography
						variant="body2"
						onClick={() => onFilterCandidate(analysis.candidate_id)}
						sx={{
							fontWeight: 800,
							color: 'primary.main',
							cursor: 'pointer',
							'&:hover': { textDecoration: 'underline', color: 'primary.dark' }
						}}
					>
						{candidate?.name || analysis.candidate?.name || 'Unknown Candidate'}
					</Typography>
				</Tooltip>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
					{candidate?.email || 'N/A'}
				</Typography>
			</TableCell>
			<TableCell>
				<Typography variant="body2" fontWeight={500}>
					{analysis.analyst_name || 'Unassigned'}
				</Typography>
			</TableCell>
			<TableCell>
				<Chip
					label={rec.label}
					size="small"
					color={rec.color as any}
					variant={rec.variant}
					sx={{
						fontWeight: 700,
						fontSize: '0.7rem',
						borderRadius: '4px',
						height: '24px'
					}}
				/>
			</TableCell>
			<TableCell>
				<Chip
					label={analysis.status || 'draft'}
					size="small"
					variant="outlined"
					sx={{
						fontWeight: 600,
						fontSize: '0.65rem',
						textTransform: 'uppercase',
						borderRadius: '4px',
						height: '20px',
						bgcolor: analysis.status === 'completed' ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.warning.main, 0.05),
						borderColor: analysis.status === 'completed' ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.warning.main, 0.2),
						color: analysis.status === 'completed' ? 'success.main' : 'warning.main',
					}}
				/>
			</TableCell>
			<TableCell align="right">
				<IconButton size="small" onClick={handleOpenMenu}>
					<MoreIcon fontSize="small" />
				</IconButton>
				<ActionMenu
					anchorEl={anchorEl}
					open={open}
					onClose={handleCloseMenu}
					actions={actions}
				/>
			</TableCell>
		</TableRow>
	);
});

CandidateAnalysisTableRow.displayName = 'CandidateAnalysisTableRow';

export default CandidateAnalysisTableRow;
