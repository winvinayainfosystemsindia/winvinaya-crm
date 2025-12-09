import React from 'react';
import { Typography, Paper } from '@mui/material';

const SystemStatus: React.FC = () => {
	return (
		<Paper sx={{ p: 3, height: '100%', backgroundColor: '#f9f9f9', border: '1px dashed #ccc' }}>
			<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
				System Status
			</Typography>
			<Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
				● All systems operational
			</Typography>
			<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
				Last check: 2 mins ago
			</Typography>
		</Paper>
	);
};

export default SystemStatus;
