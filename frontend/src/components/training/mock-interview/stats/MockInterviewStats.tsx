import React from 'react';
import { Box, Paper, Typography, Divider, alpha, useTheme } from '@mui/material';

interface MockInterviewStatsProps {
	stats: {
		total: number;
		cleared: number;
		uniqueCandidates: number;
		absent: number;
		avgRating: number | string;
	};
}

const MockInterviewStats: React.FC<MockInterviewStatsProps> = ({ stats }) => {
	const theme = useTheme();

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				mb: 4,
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 3,
				bgcolor: 'background.paper',
				display: 'flex',
				alignItems: 'center',
				gap: { xs: 3, md: 6 },
				flexWrap: 'wrap',
				boxShadow: theme.shadows[1]
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<Box 
					sx={{ 
						bgcolor: alpha(theme.palette.primary.main, 0.08), 
						p: 1.25, 
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Box sx={{ width: 20, height: 20, bgcolor: 'primary.main', borderRadius: '4px' }} />
				</Box>
				<Box>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
						Total Sessions
					</Typography>
					<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
						{stats.total}
					</Typography>
				</Box>
			</Box>

			<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<Box 
					sx={{ 
						bgcolor: alpha(theme.palette.success.main, 0.08), 
						p: 1.25, 
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Box sx={{ width: 20, height: 20, bgcolor: 'success.main', borderRadius: '50%' }} />
				</Box>
				<Box>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
						Cleared
					</Typography>
					<Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1.2 }}>
						{stats.cleared}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<Box 
					sx={{ 
						bgcolor: alpha(theme.palette.info.main, 0.08), 
						p: 1.25, 
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Box sx={{ width: 20, height: 20, bgcolor: 'info.main', borderRadius: '50%' }} />
				</Box>
				<Box>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
						Candidates
					</Typography>
					<Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main', lineHeight: 1.2 }}>
						{stats.uniqueCandidates}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<Box 
					sx={{ 
						bgcolor: alpha(theme.palette.grey[500], 0.08), 
						p: 1.25, 
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Box sx={{ width: 20, height: 20, bgcolor: 'text.disabled', borderRadius: '50%' }} />
				</Box>
				<Box>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
						Absent
					</Typography>
					<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.disabled', lineHeight: 1.2 }}>
						{stats.absent}
					</Typography>
				</Box>
			</Box>

			<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<Box 
					sx={{ 
						bgcolor: alpha(theme.palette.warning.main, 0.08), 
						p: 1.25, 
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Box sx={{ width: 20, height: 20, bgcolor: 'warning.main', borderRadius: '50%' }} />
				</Box>
				<Box>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
						Avg Rating
					</Typography>
					<Typography variant="h5" sx={{ fontWeight: 800, color: 'warning.main', lineHeight: 1.2 }}>
						{stats.avgRating}/10
					</Typography>
				</Box>
			</Box>
		</Paper>
	);
};

export default MockInterviewStats;
