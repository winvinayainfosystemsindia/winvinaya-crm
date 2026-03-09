import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
	Box,
	Typography,
	TextField,
	InputAdornment,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Radio,
	Paper,
	CircularProgress,
	Alert,
	Chip,
	FormControlLabel,
	Checkbox
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTrainingBatches, reallocateCandidate } from '../../../store/slices/trainingSlice';
import { useSnackbar } from 'notistack';
import type { CandidateAllocation } from '../../../models/training';

interface MoveCandidateDialogProps {
	open: boolean;
	onClose: () => void;
	allocation: CandidateAllocation | null;
}

const MoveCandidateDialog: React.FC<MoveCandidateDialogProps> = ({
	open,
	onClose,
	allocation
}) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { batches, loading } = useAppSelector((state) => state.training);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedBatchId, setSelectedBatchId] = useState<string>('');
	const [transferData, setTransferData] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			dispatch(fetchTrainingBatches({ status: 'running,planned', limit: 500 }));
			setSelectedBatchId('');
		}
	}, [open, dispatch]);

	const filteredBatches = batches.filter(b =>
		(b.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			b.training_mode?.toLowerCase().includes(searchTerm.toLowerCase())) &&
		b.id !== allocation?.batch_id
	);

	const handleSubmit = async () => {
		if (!selectedBatchId || !allocation) return;

		setSubmitting(true);
		try {
			await dispatch(reallocateCandidate({
				publicId: allocation.public_id,
				newBatchPublicId: selectedBatchId,
				transferData: transferData
			})).unwrap();

			enqueueSnackbar(`Successfully moved candidate to new batch`, { variant: 'success' });

			// Refresh current batch allocations
			// (The thunk already removes it from the current state, but just in case)

			onClose();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to move candidate', { variant: 'error' });
		} finally {
			setSubmitting(false);
		}
	};

	if (!allocation) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { borderRadius: '4px' }
			}}
		>
			<DialogTitle sx={{
				bgcolor: '#232f3e',
				color: 'white',
				py: 1.5,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
					Move Candidate: {allocation.candidate?.name}
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 3 }}>
				<Box sx={{ mb: 2, mt: 1 }}>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Move candidate from <strong>{allocation.batch?.batch_name}</strong> to:
					</Typography>
					<TextField
						fullWidth
						size="small"
						placeholder="Search target batch by name or course..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						sx={{ bgcolor: 'white', mt: 1 }}
					/>
				</Box>

				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress size={32} />
					</Box>
				) : filteredBatches.length === 0 ? (
					<Alert severity="info" sx={{ borderRadius: '2px' }}>
						No available batches found to move the candidate to.
					</Alert>
				) : (
					<TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', maxHeight: 400 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={{ bgcolor: '#f8f9fa', width: 50 }}></TableCell>
									<TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Batch Name</TableCell>
									<TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Course</TableCell>
									<TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Status</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredBatches.map((batch) => (
									<TableRow
										key={batch.public_id}
										hover
										selected={selectedBatchId === batch.public_id}
										onClick={() => setSelectedBatchId(batch.public_id)}
										sx={{ cursor: 'pointer' }}
									>
										<TableCell padding="checkbox">
											<Radio
												checked={selectedBatchId === batch.public_id}
												size="small"
											/>
										</TableCell>
										<TableCell>{batch.batch_name}</TableCell>
										<TableCell>{batch.training_mode || '-'}</TableCell>
										<TableCell>
											<Chip
												label={batch.status}
												size="small"
												color={batch.status === 'running' ? 'success' : 'primary'}
												variant="outlined"
												sx={{ borderRadius: '2px', fontWeight: 500, textTransform: 'capitalize' }}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{allocation.status !== 'allocated' && (
					<Box sx={{ mt: 2 }}>
						<FormControlLabel
							control={
								<Checkbox
									checked={transferData}
									onChange={(e) => setTransferData(e.target.checked)}
									sx={{ color: '#ff9900', '&.Mui-checked': { color: '#ff9900' } }}
								/>
							}
							label={
								<Box>
									<Typography variant="body2" sx={{ fontWeight: 500 }}>
										Transfer existing progress (attendance, scores, etc.)
									</Typography>
									<Typography variant="caption" color="text.secondary">
										If checked, current training records will be moved to the new batch.
									</Typography>
								</Box>
							}
						/>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
				<Button onClick={onClose} disabled={submitting}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={!selectedBatchId || submitting}
					sx={{
						bgcolor: '#ff9900',
						'&:hover': { bgcolor: '#ec7211' },
						textTransform: 'none',
						px: 3,
						boxShadow: 'none',
						borderRadius: '2px'
					}}
				>
					{submitting ? <CircularProgress size={20} color="inherit" /> : 'Move Candidate'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default MoveCandidateDialog;
