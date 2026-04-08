import React from 'react';
import { Paper, Stack, Box, Typography, IconButton } from '@mui/material';
import { MoreVert as MenuIcon } from '@mui/icons-material';
import { formatTime12h } from '../../utils/planFormatters';
import type { TrainingBatchPlan } from '../../../../../models/training';

interface PlanEntryCardProps {
	entry: TrainingBatchPlan;
	canEdit: boolean;
	isExporting: boolean;
	onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, entry: TrainingBatchPlan) => void;
}

const PlanEntryCard: React.FC<PlanEntryCardProps> = ({
	entry,
	canEdit,
	isExporting,
	onMenuOpen
}) => {
	const isBreak = entry.activity_type === 'break';

	return (
		<Paper
			elevation={0}
			sx={{
				p: 1.5,
				bgcolor: isBreak ? 'grey.100' : 'primary.50',
				borderLeft: '4px solid',
				borderLeftColor: isBreak ? 'grey.400' : 'primary.main',
				borderRadius: 1,
				position: 'relative',
				boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
			}}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
						{entry.activity_name}
					</Typography>
					<Typography variant="caption" display="flex" alignItems="center" color="primary.dark" fontWeight="500">
						{formatTime12h(entry.start_time)} - {formatTime12h(entry.end_time)}
					</Typography>
					{entry.trainer && ['course', 'hr_session', 'mock_interview'].includes(entry.activity_type) && (
						<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
							Trainer: {entry.trainer}
						</Typography>
					)}
					{entry.notes && (
						<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
							Note: {entry.notes}
						</Typography>
					)}
				</Box>
				{canEdit && !isExporting && (
					<IconButton
						size="small"
						onClick={(e) => onMenuOpen(e, entry)}
						sx={{ 
							p: 0.5,
							ml: 1,
							color: 'text.secondary',
							'&:hover': { bgcolor: 'action.selected' }
						}}
					>
						<MenuIcon sx={{ fontSize: 20 }} />
					</IconButton>
				)}
			</Stack>
		</Paper>
	);
};

export default PlanEntryCard;
