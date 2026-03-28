import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface CRMPageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
}

const CRMPageHeader: React.FC<CRMPageHeaderProps> = ({ title, subtitle, actions }) => {
	return (
		<Box sx={{ mb: 4 }}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', sm: 'center' }}
				spacing={2}
			>
				<Box>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 300,
							color: '#232f3e',
							mb: 0.5
						}}
					>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="body2" color="text.secondary">
							{subtitle}
						</Typography>
					)}
				</Box>

				{actions && (
					<Stack direction="row" spacing={1.5}>
						{actions}
					</Stack>
				)}
			</Stack>
		</Box>
	);
};

export default CRMPageHeader;
