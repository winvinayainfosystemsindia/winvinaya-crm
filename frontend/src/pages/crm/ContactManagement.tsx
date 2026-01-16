import React from 'react';
import { Box, Container } from '@mui/material';
import ContactList from '../../components/crm/contacts/ContactList';

const ContactManagement: React.FC = () => {
	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
				<ContactList />
			</Container>
		</Box>
	)
};

export default ContactManagement;
