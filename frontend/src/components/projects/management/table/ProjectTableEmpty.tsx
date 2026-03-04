import React from 'react';
import {
	TableRow,
	TableCell
} from '@mui/material';

const ProjectTableEmpty: React.FC = () => {
	return (
		<TableRow>
			<TableCell colSpan={5} align="center" sx={{ py: 6, color: '#545b64', fontSize: '0.8125rem' }}>
				No projects found.
			</TableCell>
		</TableRow>
	);
};

export default ProjectTableEmpty;
