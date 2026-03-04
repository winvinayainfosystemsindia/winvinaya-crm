import React from 'react';
import {
	TableHead,
	TableRow,
	TableCell,
	useTheme
} from '@mui/material';

const ActivityTableHead: React.FC = () => {
	const theme = useTheme();

	return (
		<TableHead>
			<TableRow sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Activity Name</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Period</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Status</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Description</TableCell>
				<TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Actions</TableCell>
			</TableRow>
		</TableHead>
	);
};

export default ActivityTableHead;
