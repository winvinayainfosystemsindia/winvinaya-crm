import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface DSRStatsCardProps {
	label: string;
	value: string | number;
	unit?: string;
	color?: string;
	sx?: SxProps<Theme>;
}

const DSRStatsCard: React.FC<DSRStatsCardProps> = ({ label, value, unit, color = '#111827', sx }) => {
	return (
		<Box
			sx={{
				px: 3,
				py: 1.5,
				bgcolor: 'white',
				borderRadius: '8px',
				border: '1px solid #e5e7eb',
				minWidth: 160,
				textAlign: { xs: 'center', md: 'right' },
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				...sx
			}}
		>
			<Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
				{label}
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 0.5 }}>
				<Typography variant="h5" sx={{ fontWeight: 600, color, lineHeight: 1 }}>
					{value}
				</Typography>
				{unit && (
					<Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
						{unit}
					</Typography>
				)}
			</Box>
		</Box>
	);
};

export default DSRStatsCard;
