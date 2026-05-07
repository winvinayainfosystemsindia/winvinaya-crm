import React from 'react';
import { 
	Snackbar, 
	Alert, 
	Button, 
	Stack, 
	useTheme 
} from '@mui/material';
import { 
	Timer as TimerIcon, 
	Warning as WarningIcon 
} from '@mui/icons-material';

interface SessionMonitoringProps {
	showStartReminder: boolean;
	showInactivityAlert: boolean;
	showTimeRunningAlert: boolean;
	onStart: () => void;
	onResume: () => void;
	onCloseInactivity: () => void;
}

/**
 * SessionMonitoring Component.
 * Encapsulates enterprise-grade session reminders and inactivity alerts.
 * Features brand-aligned colors (Enterprise Brand Orange) and glassmorphism aesthetics.
 */
const SessionMonitoring: React.FC<SessionMonitoringProps> = ({
	showStartReminder,
	showInactivityAlert,
	showTimeRunningAlert,
	onStart,
	onResume,
	onCloseInactivity
}) => {
	const theme = useTheme();

	return (
		<>
			{/* Time Running Warning (2 Minutes Inactivity) */}
			<Snackbar 
				open={showTimeRunningAlert} 
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				sx={{ mt: 12 }}
			>
				<Alert 
					severity="info" 
					variant="standard"
					icon={<TimerIcon sx={{ color: 'primary.main' }} />}
					sx={{ 
						borderRadius: '4px',
						border: '1px solid',
						borderColor: 'primary.light',
						bgcolor: 'background.paper',
						color: 'text.primary',
						fontWeight: 600,
						boxShadow: theme.shadows[4],
						'& .MuiAlert-message': {
							fontSize: '0.875rem'
						}
					}}
				>
					Reminder: The interview timer is still running.
				</Alert>
			</Snackbar>

			{/* Start Reminder Prompt */}
			<Snackbar 
				open={showStartReminder} 
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				sx={{ mt: 12 }}
			>
				<Alert 
					severity="info" 
					icon={<TimerIcon sx={{ color: 'primary.main' }} />}
					action={
						<Button 
							variant="contained" 
							size="small" 
							onClick={onStart} 
							sx={{ 
								bgcolor: 'primary.main',
								color: 'white',
								fontWeight: 800,
								px: 2,
								'&:hover': {
									bgcolor: 'primary.dark',
								}
							}}
						>
							START NOW
						</Button>
					}
					sx={{ 
						borderRadius: '4px',
						border: '1px solid',
						borderColor: 'primary.light',
						bgcolor: 'background.paper',
						color: 'text.primary',
						boxShadow: theme.shadows[8],
						fontWeight: 600,
						py: 1,
						px: 2,
						'& .MuiAlert-icon': { 
							animation: 'pulse 2s infinite',
							opacity: 1
						},
						'& .MuiAlert-message': {
							fontSize: '0.95rem',
							letterSpacing: '-0.01em'
						}
					}}
				>
					You have started filling the form. Please start the stopwatch to track interview duration.
				</Alert>
			</Snackbar>

			{/* Inactivity Alert Prompt */}
			<Snackbar 
				open={showInactivityAlert} 
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				onClose={onCloseInactivity}
				sx={{ mt: 12 }}
			>
				<Alert 
					severity="error" 
					icon={<WarningIcon sx={{ color: 'error.main' }} />}
					action={
						<Stack direction="row" spacing={1}>
							<Button 
								variant="contained" 
								color="error"
								size="small" 
								onClick={onResume} 
								sx={{ fontWeight: 800, px: 2 }}
							>
								STILL HERE (RESUME)
							</Button>
						</Stack>
					}
					sx={{ 
						borderRadius: '4px',
						border: '1px solid',
						borderColor: 'error.light',
						bgcolor: 'background.paper',
						color: 'text.primary',
						boxShadow: theme.shadows[12],
						fontWeight: 600,
						minWidth: 450,
						py: 1.5,
						px: 2,
						'& .MuiAlert-message': {
							fontSize: '0.95rem'
						}
					}}
				>
					Inactivity detected for 3 minutes. The session has been paused automatically. Are you still there?
				</Alert>
			</Snackbar>

			<style>
				{`
					@keyframes pulse {
						0% { opacity: 1; transform: scale(1); }
						50% { opacity: 0.5; transform: scale(1.2); }
						100% { opacity: 1; transform: scale(1); }
					}
				`}
			</style>
		</>
	);
};

export default SessionMonitoring;
