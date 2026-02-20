import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Box,
	Alert,
	CircularProgress,
	Avatar
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchEligibleScreeners, assignCandidates, clearError } from '../../../store/slices/screeningAssignmentSlice';

interface AssignCandidatesDialogProps {
	open: boolean;
	onClose: () => void;
	selectedCandidateIds: string[];
	onSuccess: () => void;
}

const AssignCandidatesDialog: React.FC<AssignCandidatesDialogProps> = ({
	open,
	onClose,
	selectedCandidateIds,
	onSuccess
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const { eligibleScreeners, loading, error, assignmentInProgress } = useSelector(
		(state: RootState) => state.screeningAssignments
	);
	const [selectedScreenerId, setSelectedScreenerId] = useState<number | ''>('');

	useEffect(() => {
		if (open) {
			dispatch(fetchEligibleScreeners());
			dispatch(clearError());
			setSelectedScreenerId('');
		}
	}, [open, dispatch]);

	const handleAssign = async () => {
		if (selectedScreenerId === '') return;

		const resultAction = await dispatch(
			assignCandidates({
				candidatePublicIds: selectedCandidateIds,
				assignedToUserId: selectedScreenerId
			})
		);

		if (assignCandidates.fulfilled.match(resultAction)) {
			onSuccess();
			onClose();
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ pb: 1 }}>Assign Candidates</DialogTitle>
			<DialogContent>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Assign {selectedCandidateIds.length} candidate(s) to a trainer or sourcing user for screening.
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
						<CircularProgress size={30} />
					</Box>
				) : (
					<FormControl fullWidth sx={{ mt: 1 }}>
						<InputLabel id="screener-select-label">Select Screener</InputLabel>
						<Select
							labelId="screener-select-label"
							value={selectedScreenerId}
							label="Select Screener"
							onChange={(e) => setSelectedScreenerId(e.target.value as number)}
						>
							{eligibleScreeners.length === 0 ? (
								<MenuItem disabled value="">
									No eligible screeners found
								</MenuItem>
							) : (
								eligibleScreeners.map((screener) => (
									<MenuItem key={screener.id} value={screener.id}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
											<Avatar
												sx={{
													width: 24,
													height: 24,
													fontSize: '0.75rem',
													bgcolor: 'primary.main'
												}}
											>
												{getInitials(screener.full_name || screener.username)}
											</Avatar>
											<Typography variant="body2">
												{screener.full_name || screener.username} ({screener.role})
											</Typography>
										</Box>
									</MenuItem>
								))
							)}
						</Select>
					</FormControl>
				)}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3 }}>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button
					onClick={handleAssign}
					variant="contained"
					disabled={selectedScreenerId === '' || assignmentInProgress || loading}
					startIcon={assignmentInProgress ? <CircularProgress size={16} color="inherit" /> : null}
				>
					{assignmentInProgress ? 'Assigning...' : 'Assign Candidates'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AssignCandidatesDialog;
