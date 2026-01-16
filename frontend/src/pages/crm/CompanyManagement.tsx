import React from 'react';
import { Box, Container } from '@mui/material';
import CompanyList from '../../components/crm/companies/CompanyList';

const CompanyManagement: React.FC = () => {
	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
				<CompanyList />
			</Container>
		</Box>
	)
};

export default CompanyManagement;
