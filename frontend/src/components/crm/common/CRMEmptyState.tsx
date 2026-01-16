import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Add as AddIcon, Inbox as InboxIcon } from '@mui/icons-material';

interface CRMEmptyStateProps {
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
	icon?: React.ReactNode;
}

const CRMEmptyState: React.FC<CRMEmptyStateProps> = ({
	title,
	description,
	actionLabel,
	onAction,
	icon = <InboxIcon sx={{ fontSize: 64, color: '#d5dbdb' }} />
}) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 8,
				textAlign: 'center',
				border: '1px dashed #d5dbdb',
				bgcolor: '#fafafa',
				borderRadius: '2px'
			}}
		>
			<Box sx={{ mb: 2 }}>
				{icon}
			</Box>

			<Typography variant="h6" sx={{ color: '#16191f', fontWeight: 700, mb: 1 }}>
				{title}
			</Typography>

			<Typography variant="body1" sx={{ color: '#545b64', maxWidth: 400, mx: 'auto', mb: 3 }}>
				{description}
			</Typography>

			{actionLabel && onAction && (
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={onAction}
					sx={{
						px: 3,
						py: 1,
						boxShadow: 'none',
						'&:hover': {
							boxShadow: 'none'
						}
					}}
				>
					{actionLabel}
				</Button>
			)}
		</Paper>
	);
};

export default CRMEmptyState;
