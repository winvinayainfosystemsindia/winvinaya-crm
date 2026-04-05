import React from 'react';
import { TableCell, Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PlanEntryCard from './PlanEntryCard';
import type { TrainingBatchPlan } from '../../../../../models/training';

interface PlanTableCellProps {
	day: Date;
	dateStr: string;
	periodIdx: number;
	holiday: any;
	entry: TrainingBatchPlan | undefined;
	isNextSlot: boolean;
	canEdit: boolean;
	isExporting: boolean;
	onOpenDialog: (date: Date) => void;
	onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, entry: TrainingBatchPlan) => void;
}

const PlanTableCell: React.FC<PlanTableCellProps> = ({
	dateStr,
	day,
	periodIdx,
	holiday,
	entry,
	isNextSlot,
	canEdit,
	isExporting,
	onOpenDialog,
	onMenuOpen
}) => {
	return (
		<TableCell
			key={`${dateStr}-${periodIdx}`}
			sx={{
				verticalAlign: 'top',
				p: 1,
				position: 'relative',
				minHeight: 80,
				borderRight: '1px solid',
				borderRightColor: 'divider',
				bgcolor: holiday ? (holiday.event_type === 'holiday' ? '#fff5f5' : '#f0f7ff') : 'inherit',
				'&:hover': {
					bgcolor: holiday ? (holiday.event_type === 'holiday' ? '#ffebeb' : '#e6f2ff') : 'action.hover',
					'& .add-btn': { opacity: 1 }
				}
			}}
		>
			{holiday ? (
				<Box sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
					opacity: 0.6
				}}>
					<Typography variant="caption" fontWeight="bold" color={holiday.event_type === 'holiday' ? 'error.main' : 'primary.main'} align="center">
						{holiday.title}
					</Typography>
				</Box>
			) : entry ? (
				<PlanEntryCard 
					entry={entry} 
					canEdit={canEdit} 
					isExporting={isExporting} 
					onMenuOpen={onMenuOpen} 
				/>
			) : isNextSlot && canEdit && !isExporting ? (
				<Button
					className="add-btn"
					fullWidth
					variant="outlined"
					startIcon={<AddIcon />}
					onClick={() => onOpenDialog(day)}
					sx={{
						height: '100%',
						minHeight: 60,
						opacity: 0.6,
						borderStyle: 'dashed',
						borderColor: 'divider',
						'&:hover': { opacity: 1, borderStyle: 'solid' },
					}}
				>
					Add Activity
				</Button>
			) : null}
		</TableCell>
	);
};

export default PlanTableCell;
