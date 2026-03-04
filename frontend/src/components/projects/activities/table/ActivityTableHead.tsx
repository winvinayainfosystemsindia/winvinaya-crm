import React from 'react';
import {
	TableHead,
	TableRow,
	TableCell,
	useTheme
} from '@mui/material';

interface ActivityTableHeadProps {
	canEdit?: boolean;
}

const ActivityTableHead: React.FC<ActivityTableHeadProps> = ({ canEdit = false }) => {
	const theme = useTheme();

	return (
		<TableHead>
			<TableRow sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Activity Name</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Period</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Status</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Timeline</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Description</TableCell>
				{canEdit && <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Actions</TableCell>}
			</TableRow>
		</TableHead>
	);
};

export default ActivityTableHead;
