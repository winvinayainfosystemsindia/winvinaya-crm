import React from 'react';
import { Box, Container } from '@mui/material';
import LeadList from '../../components/crm/leads/LeadList';

const LeadManagement: React.FC = () => {
	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
				<LeadList />
			</Container>
		</Box>
	)
};

export default LeadManagement;
