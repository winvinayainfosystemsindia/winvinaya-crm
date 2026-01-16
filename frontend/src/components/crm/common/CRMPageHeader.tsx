import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface CRMPageHeaderProps {
	title: string;
	actions?: React.ReactNode;
}

const CRMPageHeader: React.FC<CRMPageHeaderProps> = ({ title, actions }) => {
	return (
		<Box sx={{ mb: 4 }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				spacing={2}
			>
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
