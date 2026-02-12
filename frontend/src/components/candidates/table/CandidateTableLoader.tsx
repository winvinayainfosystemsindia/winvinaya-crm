import React from 'react';
import {
	TableRow,
	TableCell,
	Box,
	CircularProgress,
	Typography
} from '@mui/material';

interface CandidateTableLoaderProps {
	rowsPerPage: number;
}

const CandidateTableLoader: React.FC<CandidateTableLoaderProps> = ({ rowsPerPage }) => {
	return (
		<>
			{Array.from(new Array(rowsPerPage)).map((_, index) => (
				<TableRow key={`skeleton-${index}`}>
					<TableCell colSpan={7} sx={{ py: 2.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<CircularProgress size={20} thickness={5} />
							<Typography variant="body2" color="text.secondary">Loading data...</Typography>
						</Box>
					</TableCell>
				</TableRow>
			))}
		</>
	);
};

export default CandidateTableLoader;
