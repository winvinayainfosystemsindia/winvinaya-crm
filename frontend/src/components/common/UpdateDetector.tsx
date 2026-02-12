import React, { useState, useEffect, useCallback } from 'react';
import {
	Snackbar,
	Button,
	Alert,
	AlertTitle,
	Box,
	Typography,
	useTheme
} from '@mui/material';
import { Refresh as RefreshIcon, Update as UpdateIcon } from '@mui/icons-material';

// The current version of the application (should match version.json on release)
const APP_VERSION = '1.0.1';

/**
 * UpdateDetector Component
 * 
 * Periodically checks the server for a new version of the application.
 * If a mismatch is detected, it prompts the user to refresh the page.
 */
const UpdateDetector: React.FC = () => {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const theme = useTheme();

	const checkForUpdates = useCallback(async () => {
		try {
			// Fetch version.json with a cache-busting timestamp
			const response = await fetch(`/version.json?t=${Date.now()}`);
			if (!response.ok) return;

			const data = await response.json();

			if (data.version && data.version !== APP_VERSION) {
				console.log(`[UpdateDetector] New version detected: ${data.version} (Current: ${APP_VERSION})`);
				setUpdateAvailable(true);
			}
		} catch (error) {
			console.error('[UpdateDetector] Failed to check for updates:', error);
		}
	}, []);

	useEffect(() => {
		// Initial check on mount
		checkForUpdates();

		// Poll for updates every 5 minutes
		const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

		return () => clearInterval(interval);
	}, [checkForUpdates]);

	const handleRefresh = () => {
		// Force reload the page from the server
		window.location.reload();
	};

	return (
		<Snackbar
			open={updateAvailable}
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			sx={{ mt: 8 }} // Push down to not hide the Navbar
		>
			<Alert
				severity="info"
				variant="filled"
				icon={<UpdateIcon />}
				action={
					<Button
						color="inherit"
						size="small"
						onClick={handleRefresh}
						startIcon={<RefreshIcon />}
						sx={{
							fontWeight: 700,
							textTransform: 'none',
							bgcolor: 'rgba(255,255,255,0.15)',
							'&:hover': {
								bgcolor: 'rgba(255,255,255,0.25)',
							}
						}}
					>
						Refresh Now
					</Button>
				}
				sx={{
					width: '100%',
					boxShadow: theme.shadows[10],
					borderRadius: '12px',
					background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
					'& .MuiAlert-message': {
						pr: 2
					}
				}}
			>
				<AlertTitle sx={{ fontWeight: 800, mb: 0 }}>New Update Available</AlertTitle>
				<Box sx={{ display: 'flex', flexDirection: 'column' }}>
					<Typography variant="body2">
						A new version of WinVinaya CRM is ready. Please refresh to experience the latest features and improvements.
					</Typography>
				</Box>
			</Alert>
		</Snackbar>
	);
};

export default UpdateDetector;
