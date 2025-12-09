import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer: React.FC = () => {
	return (
		<Box
			component="footer"
			sx={{
				py: 1,
				px: 2,
				mt: 'auto',
				backgroundColor: (theme) =>
					theme.palette.mode === 'light'
						? theme.palette.grey[200]
						: theme.palette.grey[800],
			}}
		>
			<Container maxWidth="lg">
				<Typography variant="body2" color="text.secondary" align="center">
					{'Copyright © '}
					<Link color="inherit" href="https://winvinaya.com/">
						WinVinaya Infosystems
					</Link>{' '}
					{new Date().getFullYear()}
					{'. All rights reserved.'}
				</Typography>
			</Container>
		</Box>
	);
};

export default Footer;
