import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const RecentActivity: React.FC = () => {
	return (
		<Paper sx={{ p: 3, height: '100%' }}>
			<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
				Recent Activity
			</Typography>
			<Box sx={{ mt: 2 }}>
				<Typography variant="body2" color="text.secondary">
					• Candidate <strong>John Doe</strong> updated their profile.
				</Typography>
				<Box sx={{ my: 1 }} />
				<Typography variant="body2" color="text.secondary">
					• Interview scheduled for <strong>Sarah Smith</strong> with <strong>TechCorp</strong>.
				</Typography>
				<Box sx={{ my: 1 }} />
				<Typography variant="body2" color="text.secondary">
					• New job opening added: <strong>Software Engineer</strong> at <strong>InfoSys</strong>.
				</Typography>
			</Box>
		</Paper>
	);
};

export default RecentActivity;
