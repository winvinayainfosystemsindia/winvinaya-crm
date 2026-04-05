import React from 'react';
import {
	TableHead,
	TableRow,
	TableCell,
	useTheme
} from '@mui/material';

const ProjectTableHead: React.FC = () => {
	const theme = useTheme();

	return (
		<TableHead>
			<TableRow sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
				<TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 2 }}>Project Name</TableCell>
				<TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 2 }}>Training Batches</TableCell>
				<TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 2 }}>Owner</TableCell>
				<TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 2 }}>Created By</TableCell>
				<TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 2 }}>Created At</TableCell>
				<TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 2 }}>Status</TableCell>
				<TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 2 }}>Actions</TableCell>
			</TableRow>
		</TableHead>
	);
};

export default ProjectTableHead;
