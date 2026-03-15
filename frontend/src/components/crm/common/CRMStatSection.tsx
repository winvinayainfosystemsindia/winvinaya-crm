import React from 'react';
import { Box, Paper, Typography, Stack, Grid } from '@mui/material';

export interface StatItem {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	color?: string;
}

interface CRMStatSectionProps {
	stats: StatItem[];
	title?: string;
}

const CRMStatSection: React.FC<CRMStatSectionProps> = ({ stats, title }) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				mb: 3,
				bgcolor: '#ffffff',
				border: '1px solid #d5dbdb',
				borderRadius: '2px',
			}}
		>
			{title && (
				<Typography
					variant="subtitle2"
					sx={{
						fontWeight: 800,
						color: '#545b64',
						textTransform: 'uppercase',
						letterSpacing: '0.05em',
						mb: 2,
						fontSize: '0.75rem'
					}}
				>
					{title}
				</Typography>
			)}
			<Grid container spacing={3}>
				{stats.map((stat, index) => (
					<Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
						<Stack direction="row" spacing={2} alignItems="center">
							<Box
								sx={{
									p: 1,
									borderRadius: '2px',
									bgcolor: stat.color ? `${stat.color}15` : 'rgba(0, 126, 185, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								{stat.icon && React.isValidElement(stat.icon) && React.cloneElement(stat.icon as React.ReactElement<any>, {
									sx: { 
										fontSize: 20, 
										color: stat.color || '#007eb9' 
									}
								})}
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										color: '#545b64',
										display: 'block',
										fontWeight: 500,
										lineHeight: 1.2
									}}
								>
									{stat.label}
								</Typography>
								<Typography
									variant="h6"
									sx={{
										fontWeight: 700,
										color: '#16191f',
										lineHeight: 1.2
									}}
								>
									{stat.value}
								</Typography>
							</Box>
						</Stack>
					</Grid>
				))}
			</Grid>
		</Paper>
	);
};

export default CRMStatSection;
