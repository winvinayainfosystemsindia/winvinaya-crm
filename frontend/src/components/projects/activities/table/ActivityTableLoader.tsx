import React from 'react';
import {
	TableRow,
	TableCell,
	CircularProgress
} from '@mui/material';

const ActivityTableLoader: React.FC = () => {
	return (
		<TableRow>
			<TableCell colSpan={5} align="center" sx={{ py: 6 }}>
				<CircularProgress size={24} color="primary" />
			</TableCell>
		</TableRow>
	);
};

export default ActivityTableLoader;
