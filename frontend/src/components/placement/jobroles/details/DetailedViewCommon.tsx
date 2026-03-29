import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

export interface InfoRowProps {
	label: string;
	value: React.ReactNode;
	icon?: React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
	<Box sx={{ mb: 2.5, width: '100%' }}>
		<Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
			{icon && <Box sx={{ mr: 1, display: 'flex', color: '#545b64' }}>{icon}</Box>}
			<Typography
				variant="caption"
				sx={{
					color: '#545b64',
					fontWeight: 600,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					fontSize: '0.7rem'
				}}
			>
				{label}
			</Typography>
		</Box>
		<Typography
			variant="body1"
			sx={{
				fontWeight: 500,
				color: '#232f3e',
				fontSize: '0.95rem',
				lineHeight: 1.5,
				minHeight: '1.5rem'
			}}
		>
			{value || '-'}
		</Typography>
	</Box>
);

export const SectionHeader: React.FC<{ title: string; children?: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
	<Box sx={{ mb: 3.5 }}>
		<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				{icon && <Box sx={{ mr: 1.5, display: 'flex', color: '#ec7211' }}>{icon}</Box>}
				<Typography
					variant="h6"
					sx={{
						fontSize: '1.25rem',
						fontWeight: 700,
						color: '#232f3e',
						letterSpacing: '-0.01em'
					}}
				>
					{title}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', gap: 1 }}>
				{children}
			</Box>
		</Box>
		<Divider sx={{ borderColor: '#d5dbdb', opacity: 0.6 }} />
	</Box>
);
