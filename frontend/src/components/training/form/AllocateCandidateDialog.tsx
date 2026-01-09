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
	Checkbox,
	Paper,
	CircularProgress,
	Alert,
	Chip
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchEligibleCandidates, allocateCandidate, fetchAllocations } from '../../../store/slices/trainingSlice';
import { useSnackbar } from 'notistack';

interface AllocateCandidateDialogProps {
	open: boolean;
	onClose: () => void;
	batchId: number;
	batchPublicId: string;
	batchName: string;
}

const AllocateCandidateDialog: React.FC<AllocateCandidateDialogProps> = ({
	open,
	onClose,
	batchId,
	batchPublicId,
	batchName
}) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { eligibleCandidates, loading } = useAppSelector((state) => state.training);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			dispatch(fetchEligibleCandidates(batchPublicId));
			setSelectedCandidates([]);
		}
	}, [open, batchPublicId, dispatch]);

	const filteredCandidates = eligibleCandidates.filter(c =>
		c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		c.phone.includes(searchTerm)
	);

	const handleToggleSelect = (publicId: string) => {
		setSelectedCandidates(prev =>
			prev.includes(publicId)
				? prev.filter(id => id !== publicId)
				: [...prev, publicId]
		);
	};

	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			setSelectedCandidates(filteredCandidates.map(c => c.public_id));
		} else {
			setSelectedCandidates([]);
		}
	};

	const handleSubmit = async () => {
		if (selectedCandidates.length === 0) return;

		setSubmitting(true);
		try {
			for (const candidatePublicId of selectedCandidates) {
				await dispatch(allocateCandidate({
					batchId: batchId,
					candidateId: 0, // Not used when public IDs are provided
					candidatePublicId,
					batchPublicId
				})).unwrap();
			}

			enqueueSnackbar(`Successfully allocated ${selectedCandidates.length} candidate(s)`, { variant: 'success' });

			// Explicitly refresh the allocations list
			if (batchPublicId) {
				await dispatch(fetchAllocations({ batchPublicId })).unwrap();
			}

			// Also refresh eligible candidates
			dispatch(fetchEligibleCandidates());

			// Reset selection and close
			setSelectedCandidates([]);
			onClose();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to allocate candidates', { variant: 'error' });
		} finally {
			setSubmitting(false);
		}
	};

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
					Allocate Candidates to {batchName}
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 3 }}>
				<Box sx={{ mb: 3, mt: 1 }}>
					<TextField
						fullWidth
						size="small"
						placeholder="Search candidates by name, email or phone..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						sx={{ bgcolor: 'white' }}
					/>
				</Box>

				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress size={32} />
					</Box>
				) : filteredCandidates.length === 0 ? (
					<Alert severity="info" sx={{ borderRadius: '2px' }}>
						No eligible candidates found. Candidates must be "Selected" in counseling and not already in an active training batch.
					</Alert>
				) : (
					<TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', maxHeight: 400 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									<TableCell padding="checkbox" sx={{ bgcolor: '#f8f9fa' }}>
										<Checkbox
											indeterminate={selectedCandidates.length > 0 && selectedCandidates.length < filteredCandidates.length}
											checked={filteredCandidates.length > 0 && selectedCandidates.length === filteredCandidates.length}
											onChange={handleSelectAll}
											size="small"
										/>
									</TableCell>
									<TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Name</TableCell>
									<TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Disability</TableCell>
									<TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Contact Info</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredCandidates.map((candidate) => (
									<TableRow
										key={candidate.public_id}
										hover
										selected={selectedCandidates.includes(candidate.public_id)}
										onClick={() => handleToggleSelect(candidate.public_id)}
										sx={{ cursor: 'pointer' }}
									>
										<TableCell padding="checkbox">
											<Checkbox
												checked={selectedCandidates.includes(candidate.public_id)}
												size="small"
											/>
										</TableCell>
										<TableCell>{candidate.name}</TableCell>
										<TableCell>
											<Chip
												label={candidate.disability_type || 'N/A'}
												size="small"
												variant="outlined"
												sx={{ borderRadius: '2px', fontWeight: 500 }}
											/>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{candidate.email}</Typography>
											<Typography variant="caption" color="text.secondary">{candidate.phone}</Typography>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{selectedCandidates.length > 0 && (
					<Box sx={{ mt: 2 }}>
						<Typography variant="body2" color="text.secondary">
							{selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
						</Typography>
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
					disabled={selectedCandidates.length === 0 || submitting}
					sx={{
						bgcolor: '#ff9900',
						'&:hover': { bgcolor: '#ec7211' },
						textTransform: 'none',
						px: 3,
						boxShadow: 'none',
						borderRadius: '2px'
					}}
				>
					{submitting ? <CircularProgress size={20} color="inherit" /> : 'Add to Batch'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AllocateCandidateDialog;
