import React, { useState } from 'react';
import {
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Paper, Typography, Chip, Box, CircularProgress, Button,
	Dialog, DialogTitle, DialogContent, DialogActions,
	TextField, Alert, Stack
} from '@mui/material';
import {
	CheckCircle as ApproveIcon,
	Cancel as RejectIcon,
	Person as PersonIcon,
	CalendarMonth as CalendarIcon,
	HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { DSREntry } from '../../../../models/dsr';

interface DSRReviewQueueProps {
	entries: DSREntry[];
	loading: boolean;
	onApprove: (publicId: string, notes?: string) => Promise<void>;
	onReject: (publicId: string, reason: string) => Promise<void>;
}

interface RejectDialogState {
	open: boolean;
	entryId: string;
	reason: string;
	error: string;
}

const DSRReviewQueue: React.FC<DSRReviewQueueProps> = ({ entries, loading, onApprove, onReject }) => {
	const [approving, setApproving] = useState<string | null>(null);
	const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
		open: false, entryId: '', reason: '', error: ''
	});

	const handleApprove = async (id: string) => {
		setApproving(id);
		try {
			await onApprove(id);
		} finally {
			setApproving(null);
		}
	};

	const openRejectDialog = (entryId: string) =>
		setRejectDialog({ open: true, entryId, reason: '', error: '' });

	const closeRejectDialog = () =>
		setRejectDialog({ open: false, entryId: '', reason: '', error: '' });

	const handleRejectSubmit = async () => {
		if (rejectDialog.reason.trim().length < 10) {
			setRejectDialog(prev => ({ ...prev, error: 'Rejection reason must be at least 10 characters.' }));
			return;
		}
		await onReject(rejectDialog.entryId, rejectDialog.reason.trim());
		closeRejectDialog();
	};

	if (loading && entries.length === 0) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	if (entries.length === 0) {
		return (
			<Paper variant="outlined" sx={{
				p: 4, textAlign: 'center', bgcolor: '#f9f9f9',
				borderRadius: '2px', borderStyle: 'dashed', borderColor: '#d5dbdb'
			}}>
				<PendingIcon sx={{ fontSize: 40, color: '#aab7bd', mb: 1 }} />
				<Typography variant="body1" sx={{ color: '#545b64', fontWeight: 600 }}>
					All caught up!
				</Typography>
				<Typography variant="body2" sx={{ color: '#879596' }}>
					No DSR entries are currently awaiting review.
				</Typography>
			</Paper>
		);
	}

	return (
		<>
			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '2px', borderColor: '#d5dbdb' }}>
				<Table size="small">
					<TableHead sx={{ bgcolor: '#f3f3f3' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Employee</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Report Date</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Work Items</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Submitted At</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Type</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700, color: '#545b64', pr: 3 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{entries.map(entry => (
							<TableRow key={entry.public_id} sx={{ '&:hover': { bgcolor: '#fbfbfb' } }}>
								<TableCell>
									<Stack direction="row" alignItems="center" spacing={1}>
										<PersonIcon sx={{ fontSize: 16, color: '#879596' }} />
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											{entry.user?.full_name || entry.user?.username || 'Unknown'}
										</Typography>
									</Stack>
								</TableCell>
								<TableCell>
									<Stack direction="row" alignItems="center" spacing={0.5}>
										<CalendarIcon sx={{ fontSize: 14, color: '#879596' }} />
										<Typography variant="body2">
											{format(new Date(entry.report_date), 'dd MMM yyyy')}
										</Typography>
									</Stack>
								</TableCell>
								<TableCell>
									<Typography variant="body2" sx={{ color: '#232f3e' }}>
										{Array.isArray(entry.items) ? `${entry.items.length} item(s)` : '—'}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="caption" sx={{ color: '#545b64' }}>
										{entry.submitted_at
											? format(new Date(entry.submitted_at), 'dd MMM, HH:mm')
											: '—'}
									</Typography>
								</TableCell>
								<TableCell>
									{entry.is_previous_day_submission ? (
										<Chip label="Past Date" size="small" sx={{
											bgcolor: '#f1faff', color: '#0067b0',
											fontWeight: 700, borderRadius: '2px', fontSize: '0.7rem'
										}} />
									) : (
										<Chip label="Regular" size="small" sx={{
											bgcolor: '#f3f3f3', color: '#545b64',
											fontWeight: 700, borderRadius: '2px', fontSize: '0.7rem'
										}} />
									)}
								</TableCell>
								<TableCell align="right">
									<Stack direction="row" spacing={1} justifyContent="flex-end">
										<Button
											size="small"
											variant="contained"
											startIcon={approving === entry.public_id
												? <CircularProgress size={12} sx={{ color: 'white' }} />
												: <ApproveIcon />}
											disabled={approving === entry.public_id}
											onClick={() => handleApprove(entry.public_id)}
											sx={{
												bgcolor: '#1d8102', '&:hover': { bgcolor: '#16620a' },
												textTransform: 'none', fontWeight: 700, fontSize: '0.75rem'
											}}
										>
											Approve
										</Button>
										<Button
											size="small"
											variant="outlined"
											startIcon={<RejectIcon />}
											onClick={() => openRejectDialog(entry.public_id)}
											sx={{
												color: '#d13212', borderColor: '#d13212',
												'&:hover': { bgcolor: '#fdf3f1', borderColor: '#a52715' },
												textTransform: 'none', fontWeight: 700, fontSize: '0.75rem'
											}}
										>
											Reject
										</Button>
									</Stack>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Rejection Reason Dialog */}
			<Dialog open={rejectDialog.open} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 700, color: '#232f3e', borderBottom: '1px solid #d5dbdb', pb: 2 }}>
					Reject DSR Entry
				</DialogTitle>
				<DialogContent sx={{ pt: 3 }}>
					<Alert severity="warning" sx={{ mb: 2, borderRadius: '2px' }}>
						The user will be notified and their DSR will be returned to <strong>Draft</strong> status for re-submission.
					</Alert>
					<TextField
						label="Rejection Reason"
						placeholder="Explain clearly why this DSR is being rejected so the user can correct it..."
						multiline
						rows={4}
						fullWidth
						value={rejectDialog.reason}
						onChange={e => setRejectDialog(prev => ({ ...prev, reason: e.target.value, error: '' }))}
						error={!!rejectDialog.error}
						helperText={rejectDialog.error || `${rejectDialog.reason.length}/10 minimum characters`}
						sx={{
							'& .MuiOutlinedInput-root': {
								'&.Mui-focused fieldset': { borderColor: '#ec7211' }
							},
							'& .MuiInputLabel-root.Mui-focused': { color: '#ec7211' }
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={closeRejectDialog} sx={{ textTransform: 'none', color: '#545b64' }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleRejectSubmit}
						sx={{
							bgcolor: '#d13212', '&:hover': { bgcolor: '#a52715' },
							textTransform: 'none', fontWeight: 700
						}}
					>
						Confirm Rejection
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default DSRReviewQueue;
