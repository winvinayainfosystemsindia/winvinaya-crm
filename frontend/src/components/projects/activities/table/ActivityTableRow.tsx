import React from 'react';
import {
	TableRow,
	TableCell,
	Box,
	Typography,
	IconButton,
	Stack,
	useTheme
} from '@mui/material';
import { 
	MoreVert as MoreIcon,
	AssignmentOutlined as ActivityIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
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

		return { label: activity.actual_end_date ? `Actual: ${dayjs(activity.actual_end_date).format('DD-MMM-YYYY')}` : 'On track', color: '#545b64', bgcolor: 'transparent' };
	};

	const timeline = getTimelineInfo();

	return (
		<TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
			<TableCell sx={{ py: 2.5, minWidth: 200 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
					<ActivityIcon sx={{ color: '#0073bb', fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>
						{activity.name}
					</Typography>
				</Box>
				{activity.description && (
					<Typography variant="caption" sx={{ 
						color: 'text.secondary',
						display: '-webkit-box',
						WebkitLineClamp: 1,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						maxWidth: 250
					}}>
						{activity.description}
					</Typography>
				)}
			</TableCell>

			{/* Assigned To Column */}
			<TableCell sx={{ py: 2.5 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{activity.assigned_users && activity.assigned_users.length > 0 ? (
						activity.assigned_users.map((u) => (
							<Typography key={u.id} variant="body2" sx={{ color: 'text.primary', fontSize: '0.8125rem' }}>
								{u.full_name || u.username}
							</Typography>
						))
					) : (
						<Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', fontSize: '0.8125rem' }}>
							Unassigned
						</Typography>
					)}
				</Box>
			</TableCell>

			{/* Start Date Column */}
			<TableCell sx={{ py: 2.5 }}>
				<Stack spacing={0.5}>
					<Box sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
						<Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 40 }}>Est:</Box>
						<Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
							{dayjs(activity.start_date).format('DD MMM YYYY')}
						</Typography>
					</Box>
					{activity.actual_start_date && (
						<Box sx={{ fontSize: '0.8125rem', color: theme.palette.primary.main, fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
							<Box component="span" sx={{ opacity: 0.8, fontWeight: 600, minWidth: 40 }}>Act:</Box>
							<Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
								{dayjs(activity.actual_start_date).format('DD MMM YYYY')}
							</Typography>
						</Box>
					)}
				</Stack>
			</TableCell>

			{/* End Date Column */}
			<TableCell sx={{ py: 2.5 }}>
				<Stack spacing={0.5}>
					<Box sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
						<Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 40 }}>Est:</Box>
						<Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
							{dayjs(activity.end_date).format('DD MMM YYYY')}
						</Typography>
					</Box>
					{activity.actual_end_date && (
						<Box sx={{ fontSize: '0.8125rem', color: '#037f0c', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
							<Box component="span" sx={{ opacity: 0.8, fontWeight: 600, minWidth: 40 }}>Act:</Box>
							<Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
								{dayjs(activity.actual_end_date).format('DD MMM YYYY')}
							</Typography>
						</Box>
					)}
				</Stack>
			</TableCell>

			{/* Status Column */}
			<TableCell sx={{ py: 2.5 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{
						width: 8,
						height: 8,
						borderRadius: '50%',
						bgcolor: getStatusColorCode(activity.status),
						flexShrink: 0
					}} />
					<Typography sx={{ 
						fontSize: '0.8125rem', 
						color: '#232f3e',
						fontWeight: 600,
						textTransform: 'capitalize',
						whiteSpace: 'nowrap'
					}}>
						{activity.status.replace('_', ' ')}
					</Typography>
				</Box>
			</TableCell>

			{/* Effort Column */}
			<TableCell sx={{ py: 2.5 }}>
				<Stack spacing={0.5}>
					<Box sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
						<Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 70 }}>Estimate:</Box>
						<Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
							{activity.estimated_hours ? `${activity.estimated_hours}h` : 'N/A'}
						</Typography>
					</Box>
					<Box sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#232f3e', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
						<Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 70 }}>Actual:</Box>
						<Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
							{activity.total_actual_hours || 0}h
						</Typography>
					</Box>
				</Stack>
			</TableCell>

			{/* Timeline Column */}
			<TableCell sx={{ py: 2.5 }}>
				<Box sx={{
					px: 1.5,
					py: 0.75,
					borderRadius: '16px',
					display: 'inline-flex',
					alignItems: 'center',
					bgcolor: timeline.bgcolor === 'transparent' ? '#f2f3f3' : timeline.bgcolor,
					color: timeline.color,
					fontSize: '0.75rem',
					fontWeight: 700,
					border: timeline.bgcolor !== 'transparent' ? `1px solid ${timeline.color}30` : '1px solid #d5dbdb'
				}}>
					{timeline.label}
				</Box>
			</TableCell>

			{/* Action Column */}
			{canEdit && (
				<TableCell align="right" sx={{ py: 2.5 }}>
					<IconButton
						size="small"
						onClick={(e) => onActionClick(e, activity)}
						sx={{ 
							color: '#545b64',
							'&:hover': { bgcolor: '#eaeded', color: '#232f3e' }
						}}
					>
						<MoreIcon fontSize="small" />
					</IconButton>
				</TableCell>
			)}
		</TableRow>
	);
};

export default ActivityTableRow;
