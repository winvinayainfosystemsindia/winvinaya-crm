import React from 'react';
import { TableRow, TableCell, Skeleton } from '@mui/material';

interface JobRoleTableLoaderProps {
	rowsPerPage: number;
}

const JobRoleTableLoader: React.FC<JobRoleTableLoaderProps> = ({ rowsPerPage }) => {
	return (
		<>
			{Array.from(new Array(rowsPerPage)).map((_, index) => (
				<TableRow key={index}>
					{Array.from(new Array(8)).map((_, cellIndex) => (
						<TableCell key={cellIndex} sx={{ py: 2 }}>
							<Skeleton variant="rectangular" height={cellIndex === 0 ? 40 : 20} sx={{ borderRadius: '2px' }} />
						</TableCell>
					))}
				</TableRow>
			))}
		</>
	);
};

export default JobRoleTableLoader;
