import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Stack,
	Box
} from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

interface ExtendBatchDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (newDate: string, reason: string) => void;
	currentCloseDate: string;
	batchName: string;
}

const ExtendBatchDialog: React.FC<ExtendBatchDialogProps> = ({
	open,
	onClose,
	onConfirm,
	currentCloseDate,
	batchName
}) => {
	const [newDate, setNewDate] = useState('');
	const [reason, setReason] = useState('');

	useEffect(() => {
		if (open) {
			setNewDate(currentCloseDate || new Date().toISOString().split('T')[0]);
			setReason('');
		}
	}, [open, currentCloseDate]);

	const handleConfirm = () => {
		onConfirm(newDate, reason);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					border: '1px solid #d5dbdb'
				}
			}}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Typography variant="h6" sx={{ fontSize: '1.25rem' }}>
						Extend Batch Date
					</Typography>
					<IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>
			<DialogContent sx={{ mt: 3 }}>
				<Stack spacing={3}>
					<Box sx={{ p: 2, bgcolor: '#f2f3f3', borderLeft: '4px solid #ec7211' }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
							{batchName}
						</Typography>
						<Typography variant="caption" color="textSecondary">
							Current End Date: {currentCloseDate}
						</Typography>
					</Box>

					<TextField
						label="New Completion Date"
						type="date"
						fullWidth
						size="small"
						InputLabelProps={{ shrink: true }}
						value={newDate}
						onChange={(e) => setNewDate(e.target.value)}
						variant="outlined"
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
					/>

					<TextField
						label="Reason for Extension"
						multiline
						rows={3}
						fullWidth
						size="small"
						placeholder="e.g. Additional training module required, holidays, etc."
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						variant="outlined"
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
					/>

					<Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<InfoIcon sx={{ fontSize: 16 }} />
						This action will be recorded in the batch extension history as an audit trail.
					</Typography>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
				<Button
					onClick={onClose}
					sx={{ color: '#16191f', fontWeight: 700, textTransform: 'none' }}
				>
					Cancel
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					disabled={!newDate || !reason || newDate === currentCloseDate}
					sx={{
						bgcolor: '#ec7211',
						color: '#ffffff',
						px: 3,
						fontWeight: 700,
						borderRadius: '2px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: '#eb5f07', boxShadow: 'none' },
						'&.Mui-disabled': { bgcolor: '#f2f3f3', color: '#aab7b8' }
					}}
				>
					Confirm Extension
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ExtendBatchDialog;
