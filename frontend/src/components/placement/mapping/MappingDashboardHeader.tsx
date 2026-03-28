import React from 'react';
import { Box, Typography } from '@mui/material';
import { AWS_COLORS } from './mappingTypes';

const MappingDashboardHeader: React.FC = () => {
	return (
		<Box sx={{ mb: 3 }}>
			<Typography variant="h4" sx={{ fontWeight: 700, color: AWS_COLORS.headerText, mb: 0.5 }}>
				Matchmaking Dashboard
			</Typography>
			<Typography variant="body2" sx={{ color: AWS_COLORS.secondaryText }}>
				High-performance matchmaking engine to pair candidates with enterprise job roles.
			</Typography>
		</Box>
	);
};

export default MappingDashboardHeader;
