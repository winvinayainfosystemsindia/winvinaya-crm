import React from 'react';
import {
	Box,
	Container,
	Typography,
	useTheme,
	useMediaQuery,
	Paper
} from '@mui/material';

const CandidateAllocation: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: isMobile ? 2 : 3 }}>
			<Container maxWidth="xl" sx={{ px: isMobile ? 1 : { sm: 2, md: 3 } }}>
				{/* Page Header */}
				<Box sx={{ mb: 4 }}>
					<Typography
						variant={isMobile ? "h5" : "h4"}
						component="h1"
						sx={{
							fontWeight: 300,
							color: '#232f3e',
							mb: 0.5
						}}
					>
						Candidate Batch Allocation
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Allocate candidates to training batches
					</Typography>
				</Box>

				<Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #d5dbdb', boxShadow: 'none' }}>
					<Typography color="text.secondary">
						Candidate allocation interface is under development.
					</Typography>
				</Paper>
			</Container>
		</Box>
	);
};

export default CandidateAllocation;
