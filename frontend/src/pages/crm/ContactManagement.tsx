import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import ContactList from '../../components/crm/contacts/ContactList';

const ContactManagement: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: isMobile ? 2 : 3 }}>
			<Container maxWidth="xl" sx={{ px: isMobile ? 1 : { sm: 2, md: 3 } }}>
				<ContactList
					title="Contact Management"
					subtitle="Manage individual stakeholder profiles and professional relationships"
				/>
			</Container>
		</Box>
	)
};

export default ContactManagement;
