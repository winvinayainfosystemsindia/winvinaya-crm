import React from 'react';
import JobRoleList from '../../components/placement/jobroles/JobRoleList';
import { Box, Container } from '@mui/material';

const JobRoleManagement: React.FC = () => {
	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
				<JobRoleList />
			</Container>
		</Box>
	)
};

export default JobRoleManagement;
