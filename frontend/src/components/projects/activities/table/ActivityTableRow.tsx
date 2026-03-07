import React from 'react';
import {
	TableRow,
	TableCell,
	Box,
	Typography,
	IconButton,
	useTheme
} from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import type { DSRActivity } from '../../../../models/dsr';
import { DSRActivityStatusValues } from '../../../../models/dsr';

interface ActivityTableRowProps {
	activity: DSRActivity;
	onActionClick: (event: React.MouseEvent<HTMLButtonElement>, activity: DSRActivity) => void;
	canEdit?: boolean;
}

const ActivityTableRow: React.FC<ActivityTableRowProps> = ({
	activity,
	onActionClick,
	canEdit = false
}) => {
	const theme = useTheme();

	const getStatusColorCode = (status: string) => {
		switch (status) {
			case DSRActivityStatusValues.COMPLETED: return '#037f0c';
			case DSRActivityStatusValues.IN_PROGRESS: return '#0073bb';
			case DSRActivityStatusValues.ON_HOLD: return '#ec7211';
			case DSRActivityStatusValues.CANCELLED: return '#d13212';
			default: return '#545b64';
		}
	};

	const getTimelineInfo = () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const end = new Date(activity.end_date);
		end.setHours(0, 0, 0, 0);
		const actual = activity.actual_end_date ? new Date(activity.actual_end_date) : null;
		if (actual) actual.setHours(0, 0, 0, 0);

		const isCompleted = activity.status === DSRActivityStatusValues.COMPLETED;

		if (isCompleted && actual) {
			const diff = Math.floor((actual.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
			if (diff > 0) {
				return { label: `Delayed by ${diff} day${diff > 1 ? 's' : ''}`, color: '#d13212', bgcolor: 'rgba(209, 50, 18, 0.08)' };
			} else if (diff < 0) {
				return { label: `Finished ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} early`, color: '#037f0c', bgcolor: 'rgba(3, 127, 12, 0.08)' };
			}
			return { label: 'Finished on time', color: '#037f0c', bgcolor: 'rgba(3, 127, 12, 0.08)' };
		}

		if (!isCompleted) {
			const diff = Math.floor((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
			if (diff > 0) {
				return { label: `Overdue by ${diff} day${diff > 1 ? 's' : ''}`, color: '#d13212', bgcolor: 'rgba(209, 50, 18, 0.08)', fontWeight: 700 };
			} else if (diff === 0) {
				return { label: 'Due today', color: '#ec7211', bgcolor: 'rgba(236, 114, 17, 0.08)', fontWeight: 700 };
			} else if (Math.abs(diff) <= 3) {
				return { label: `Due in ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''}`, color: '#ec7211', bgcolor: 'rgba(236, 114, 17, 0.08)' };
			}
		}

		return { label: activity.actual_end_date ? `Actual: ${new Date(activity.actual_end_date).toLocaleDateString()}` : 'On track', color: '#545b64', bgcolor: 'transparent' };
	};

	const timeline = getTimelineInfo();

	const toTitleCase = (str: string) => {
		if (!str) return '';
		return str.replace(
			/\w\S*/g,
			(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
		);
	};

	return (
		<TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
			<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 500 }}>
						{toTitleCase(activity.name)}
					</Typography>
				</Box>
			</TableCell>
			<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
				{activity.assigned_user ? (activity.assigned_user.full_name || activity.assigned_user.username) : 'Unassigned'}
			</TableCell>
			<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
				<Typography sx={{ fontSize: '0.8125rem' }}>{new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}</Typography>
				{activity.actual_end_date && (
					<Typography sx={{ fontSize: '0.75rem', color: '#037f0c', mt: 0.5, fontWeight: 500 }}>
						Actual Finish: {new Date(activity.actual_end_date).toLocaleDateString()}
					</Typography>
				)}
			</TableCell>
			<TableCell sx={{ py: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{
						width: 8,
						height: 8,
						borderRadius: '50%',
						bgcolor: getStatusColorCode(activity.status)
					}} />
					<Typography sx={{ fontSize: '0.8125rem', color: getStatusColorCode(activity.status), fontWeight: 500 }}>
						{activity.status.charAt(0) + activity.status.slice(1).toLowerCase()}
					</Typography>
				</Box>
			</TableCell>
			<TableCell sx={{ py: 2 }}>
				<Box sx={{
					px: 1.5,
					py: 0.5,
					borderRadius: 1,
					display: 'inline-block',
					bgcolor: timeline.bgcolor,
					color: timeline.color,
					fontSize: '0.75rem',
					fontWeight: timeline.fontWeight || 500,
					border: timeline.bgcolor !== 'transparent' ? `1px solid ${timeline.color}40` : 'none'
				}}>
					{timeline.label}
				</Box>
			</TableCell>
			<TableCell sx={{ py: 2 }}>
				<Typography variant="body2" sx={{
					maxWidth: 200,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					fontSize: '0.8125rem',
					color: theme.palette.text.secondary
				}}>
					{activity.description}
				</Typography>
			</TableCell>
			{canEdit && (
				<TableCell align="right" sx={{ py: 1 }}>
					<IconButton
						size="small"
						onClick={(e) => onActionClick(e, activity)}
						sx={{ color: theme.palette.text.secondary }}
					>
						<MoreIcon fontSize="small" />
					</IconButton>
				</TableCell>
			)}
		</TableRow>
	);
};

export default ActivityTableRow;
