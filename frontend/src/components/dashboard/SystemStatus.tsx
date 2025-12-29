import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const SystemStatus: React.FC = () => {
	return (
		<Paper
			component="section"
			aria-labelledby="system-status-title"
			sx={{ p: 3, height: '100%', backgroundColor: '#f9f9f9', border: '1px dashed #ccc' }}
		>
			<Typography variant="h6" id="system-status-title" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
				System Status
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Box
					component="span"
					sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }}
					aria-hidden="true"
				/>
				<Typography variant="body2" color="success.main">
					All systems operational
				</Typography>
			</Box>
			<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
				Last check: 2 mins ago
			</Typography>
		</Paper>
	);
};


export default SystemStatus;
