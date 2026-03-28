import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import CompanyList from '../../components/crm/companies/CompanyList';

const CompanyManagement: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: isMobile ? 2 : 3 }}>
			<Container maxWidth="xl" sx={{ px: isMobile ? 1 : { sm: 2, md: 3 } }}>
				<CompanyList
					title="Company Management"
					subtitle="Manage organizational profiles, account statuses, and corporate partnerships"
				/>
			</Container>
		</Box>
	)
};

export default CompanyManagement;
