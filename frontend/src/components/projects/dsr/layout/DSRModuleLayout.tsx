import React from 'react';
import {
	Box,
	Container,
	Typography,
	useTheme,
	useMediaQuery
} from '@mui/material';

interface DSRModuleLayoutProps {
	title: string;
	subtitle: string;
	children: (props: { loading: boolean }) => React.ReactNode;
}

const DSRModuleLayout: React.FC<DSRModuleLayoutProps> = ({
	title,
	subtitle,
	children
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh' }}>
			{/* Professional AWS Service Header */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', pt: 2, pb: 4, mb: 0 }}>
				<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
					<Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-start', mb: 4, gap: 3 }}>
						<Box>
							<Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5, letterSpacing: '-0.02em', fontSize: isMobile ? '1.5rem' : '2rem' }}>
								{title}
							</Typography>
							<Typography variant="body2" sx={{ color: '#aab7bd', maxWidth: 600 }}>
								{subtitle}
							</Typography>
						</Box>
					</Box>
				</Container>
			</Box>

			<Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
				{children({ loading: false })}
			</Container>
		</Box>
	);
};

export default DSRModuleLayout;
