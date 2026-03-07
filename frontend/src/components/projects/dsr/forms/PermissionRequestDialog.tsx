import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
	Typography,
	Box,
	TextField,
	Alert,
	Fade
} from '@mui/material';
import {
	Close as CloseIcon,
	RequestQuote as RequestIcon
} from '@mui/icons-material';
import dsrService from '../../../../services/dsrService';
import useToast from '../../../../hooks/useToast';

interface PermissionRequestDialogProps {
	open: boolean;
	onClose: () => void;
}

const PermissionRequestDialog: React.FC<PermissionRequestDialogProps> = ({ open, onClose }) => {
	const [reportDate, setReportDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
	const [reason, setReason] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const toast = useToast();

	const handleSubmit = async () => {
		if (!reportDate || !reason) {
			toast.warning('Please select a date and provide a reason');
			return;
		}

		if (reason.length < 5) {
			toast.warning('Reason must be at least 5 characters long');
			return;
		}

		if (new Date(reportDate) >= new Date(new Date().setHours(0, 0, 0, 0))) {
			toast.warning('Permission is only needed for past dates');
			return;
		}

		setSubmitting(true);
		try {
			await dsrService.createPermissionRequest({ report_date: reportDate, reason });
			toast.success('Permission request submitted successfully!');
			onClose();
			setReason('');
		} catch (error: any) {
			toast.error(error || 'Failed to submit request');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			TransitionComponent={Fade}
			PaperProps={{
				sx: { borderRadius: '2px' }
			}}
		>
			<DialogTitle sx={{
				bgcolor: '#232f3e',
				color: 'white',
				py: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<RequestIcon />
					<Box>
						<Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
							Request Past-Date Submission
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={onClose} sx={{ color: 'white' }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 4, pt: 6, bgcolor: '#f2f3f3' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					<Alert severity="info" sx={{ borderRadius: '2px' }}>
						Admins must approve requests for past-date submissions before you can file the report.
					</Alert>

					<TextField
						label="Requested Date"
						type="date"
						fullWidth
						value={reportDate}
						onChange={(e) => setReportDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
						size="small"
						sx={{ bgcolor: 'white' }}
						disabled={submitting}
					/>

					<TextField
						label="Reason for Delay"
						multiline
						rows={3}
						fullWidth
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Explain why this DSR was delayed..."
						size="small"
						sx={{ bgcolor: 'white' }}
						disabled={submitting}
					/>
				</Box>
			</DialogContent>

			<DialogActions sx={{ p: 3, borderTop: '1px solid #d5dbdb', bgcolor: 'white' }}>
				<Button onClick={onClose} sx={{ color: '#545b64', textTransform: 'none', fontWeight: 700 }}>
					Cancel
				</Button>
				<Box sx={{ flexGrow: 1 }} />
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={submitting}
					sx={{
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' },
						px: 4,
						textTransform: 'none',
						fontWeight: 700
					}}
				>
					Raise Request
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PermissionRequestDialog;
