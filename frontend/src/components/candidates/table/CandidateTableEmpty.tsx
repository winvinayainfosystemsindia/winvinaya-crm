import React from 'react';
import {
	TableRow,
	TableCell,
	Stack,
	Typography
} from '@mui/material';

const CandidateTableEmpty: React.FC = () => {
	return (
		<TableRow>
			<TableCell colSpan={7} align="center" sx={{ py: 10 }}>
				<Stack spacing={1} alignItems="center">
					<Typography variant="h6" color="text.secondary">No candidates found</Typography>
					<Typography variant="body2" color="text.disabled">
						Try adjusting your filters or search terms
					</Typography>
				</Stack>
			</TableCell>
		</TableRow>
	);
};

export default CandidateTableEmpty;
