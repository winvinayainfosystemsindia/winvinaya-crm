import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	onClose: () => void;
	onConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
	loading?: boolean;
	severity?: 'error' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	title,
	message,
	onClose,
	onConfirm,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	loading = false,
	severity = 'warning'
}) => {
	const getSeverityColor = () => {
		switch (severity) {
			case 'error': return '#d32f2f';
			case 'warning': return '#ed6c02';
			case 'info': return '#0288d1';
			default: return '#ed6c02';
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<WarningIcon sx={{ color: getSeverityColor() }} />
				<Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
					{title}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1">
					{message}
				</Typography>
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3 }}>
				<Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>
					{cancelText}
				</Button>
				<Button
					variant="contained"
					onClick={onConfirm}
					disabled={loading}
					sx={{
						bgcolor: severity === 'error' ? '#d32f2f' : '#232f3e',
						'&:hover': {
							bgcolor: severity === 'error' ? '#b71c1c' : '#1a242e'
						},
						textTransform: 'none',
						minWidth: 100
					}}
				>
					{loading ? 'Processing...' : confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;
