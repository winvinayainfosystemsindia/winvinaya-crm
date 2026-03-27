import React from 'react';
import {
	TableRow,
	TableCell,
	Typography,
	Box,
	useTheme
} from '@mui/material';
import { AssignmentOutlined as ActivityIcon } from '@mui/icons-material';

const ActivityTableEmpty: React.FC = () => {
	const theme = useTheme();

	return (
		<TableRow>
			<TableCell colSpan={10} align="center" sx={{ py: 10, borderBottom: 'none' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
					<ActivityIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
					<Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
						No activities found for this project.
					</Typography>
					<Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
						Try adjusting your filters or search term.
					</Typography>
				</Box>
			</TableCell>
		</TableRow>
	);
};

export default ActivityTableEmpty;
