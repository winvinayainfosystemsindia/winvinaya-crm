import React from 'react';
import {
	Box,
	Container,
	Typography,
	useTheme,
	useMediaQuery
} from '@mui/material';
import TrainingStats from '../../components/training/stats/TrainingStats';
import TrainingTable from '../../components/training/batch/TrainingTable';

const TrainingBatchList: React.FC = () => {
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
						Training Batches
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage and monitor all training batches
					</Typography>
				</Box>

				{/* Stats Section */}
				<TrainingStats />

				{/* Table Section */}
				<TrainingTable />
			</Container>
		</Box>
	);
};

export default TrainingBatchList;
