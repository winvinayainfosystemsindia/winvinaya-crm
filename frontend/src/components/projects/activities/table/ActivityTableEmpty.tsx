import React from 'react';
import {
	TableRow,
	TableCell,
	useTheme
} from '@mui/material';

const ActivityTableEmpty: React.FC = () => {
	const theme = useTheme();

	return (
		<TableRow>
			<TableCell colSpan={6} align="center" sx={{ py: 6, color: theme.palette.text.secondary, fontSize: '0.8125rem' }}>
				No activities found for this project.
			</TableCell>
		</TableRow>
	);
};

export default ActivityTableEmpty;
