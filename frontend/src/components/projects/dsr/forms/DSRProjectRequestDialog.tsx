import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Box,
	Alert
} from '@mui/material';
import dsrProjectRequestService from '../../../../services/dsrProjectRequestService';
import useToast from '../../../../hooks/useToast';

interface DSRProjectRequestDialogProps {
	open: boolean;
	onClose: () => void;
	initialName?: string;
}

const DSRProjectRequestDialog: React.FC<DSRProjectRequestDialogProps> = ({ open, onClose, initialName = '' }) => {
	const [name, setName] = useState(initialName);
	const [reason, setReason] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const toast = useToast();

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError('Project name is required');
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			await dsrProjectRequestService.createRequest({
				project_name: name.trim(),
				reason: reason.trim() || undefined
			});
			toast.success('Project request submitted successfully! An admin will review it.');
			onClose();
			setName('');
			setReason('');
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Failed to submit request');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ fontWeight: 700, color: '#232f3e' }}>
				Request New Project
			</DialogTitle>
			<DialogContent>
				<Typography variant="body2" sx={{ mb: 3, color: '#545b64' }}>
					If the project you are working on is not in the list, please request it here. 
					Once an admin approves it, it will appear in the DSR list.
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
				)}

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
					<TextField
						label="Project Name"
						fullWidth
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. Internal Training Portal"
						required
						autoFocus
					/>
					<TextField
						label="Reason / Client Details"
						fullWidth
						multiline
						rows={3}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Please provide some context for this new project..."
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 2, px: 3 }}>
				<Button onClick={onClose} disabled={submitting}>Cancel</Button>
				<Button 
					onClick={handleSubmit} 
					variant="contained" 
					disabled={submitting}
					sx={{ 
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' }
					}}
				>
					{submitting ? 'Submitting...' : 'Submit Request'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DSRProjectRequestDialog;
