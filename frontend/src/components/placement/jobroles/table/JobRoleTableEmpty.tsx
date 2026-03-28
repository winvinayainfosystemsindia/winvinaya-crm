import React from 'react';
import { TableRow, TableCell, Box, Typography } from '@mui/material';
import { SearchOff as NoSearchIcon } from '@mui/icons-material';

const JobRoleTableEmpty: React.FC = () => {
	return (
		<TableRow>
			<TableCell colSpan={8} align="center" sx={{ py: 12 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
					<NoSearchIcon sx={{ fontSize: 64, color: '#545b64', mb: 2 }} />
					<Typography variant="h6" sx={{ fontWeight: 600, color: '#16191f' }}>
						No Job Roles match your filters
					</Typography>
					<Typography variant="body2" sx={{ color: '#545b64', maxWidth: 400, mt: 1 }}>
						Try adjusting your filters or search terms, or create a new job role to get started with mapping candidates.
					</Typography>
				</Box>
			</TableCell>
		</TableRow>
	);
};

export default JobRoleTableEmpty;
