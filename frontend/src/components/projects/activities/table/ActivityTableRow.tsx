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
}

const ActivityTableRow: React.FC<ActivityTableRowProps> = ({
	activity,
	onActionClick
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

	return (
		<TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
			<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: theme.palette.text.primary, fontWeight: 600 }}>
				{activity.name}
			</TableCell>
			<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
				{new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}
			</TableCell>
			<TableCell sx={{ py: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{
						width: 8,
						height: 8,
						borderRadius: '50%',
						bgcolor: getStatusColorCode(activity.status)
					}} />
					<Typography sx={{ fontSize: '0.8125rem', color: getStatusColorCode(activity.status) }}>
						{activity.status.charAt(0) + activity.status.slice(1).toLowerCase()}
					</Typography>
				</Box>
			</TableCell>
			<TableCell sx={{ py: 2 }}>
				<Typography variant="body2" sx={{
					maxWidth: 250,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					fontSize: '0.8125rem',
					color: theme.palette.text.secondary
				}}>
					{activity.description}
				</Typography>
			</TableCell>
			<TableCell align="right" sx={{ py: 1 }}>
				<IconButton
					size="small"
					onClick={(e) => onActionClick(e, activity)}
					sx={{ color: theme.palette.text.secondary }}
				>
					<MoreIcon fontSize="small" />
				</IconButton>
			</TableCell>
		</TableRow>
	);
};

export default ActivityTableRow;
