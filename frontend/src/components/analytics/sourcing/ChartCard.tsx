import React from 'react';
import { Paper, Typography, Box, useTheme, type SxProps, type Theme } from '@mui/material';

interface ChartCardProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	sx?: SxProps<Theme>;
	action?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, sx, action }) => {
	const theme = useTheme();

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				borderRadius: 3,
				border: `1px solid ${theme.palette.divider}`,
				boxShadow: '0px 2px 4px rgba(0,0,0,0.02)', // Very subtle shadow
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: '#ffffff',
				...sx,
			}}
		>
			<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{subtitle}
						</Typography>
					)}
				</Box>
				{action && <Box>{action}</Box>}
			</Box>
			<Box sx={{ flexGrow: 1, position: 'relative' }}>
				{children}
			</Box>
		</Paper>
	);
};

export default ChartCard;
