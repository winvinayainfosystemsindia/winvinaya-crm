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
	CircularProgress,
	Typography,
	Box,
	Alert
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { assignCandidate } from '../../store/slices/candidateSlice';
import userService from '../../services/userService';
import type { User } from '../../models/user';
import type { CandidateListItem } from '../../models/candidate';

interface AssignCandidateDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	candidate: CandidateListItem | null;
}

const AssignCandidateDialog: React.FC<AssignCandidateDialogProps> = ({ open, onClose, onSuccess, candidate }) => {
	const dispatch = useAppDispatch();
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			fetchSourcingUsers();
			if (candidate?.assigned_to_id) {
				setSelectedUserId(candidate.assigned_to_id);
			} else {
				setSelectedUserId('');
			}
			setError(null);
		}
	}, [open, candidate]);

	const fetchSourcingUsers = async () => {
		setLoading(true);
		try {
			// Fetch users with 'sourcing' role
			const response = await userService.getAll(0, 100, 'sourcing');
			setUsers(response.items);
		} catch (err: any) {
			setError('Failed to fetch sourcing users');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!candidate || !selectedUserId) return;

		setSubmitting(true);
		setError(null);
		try {
			await dispatch(assignCandidate({ 
				publicId: candidate.public_id, 
				userId: Number(selectedUserId) 
			})).unwrap();
			onSuccess?.();
			onClose();
		} catch (err: any) {
			setError(err || 'Failed to assign candidate');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Assign Candidate</DialogTitle>
			<DialogContent>
				<Box sx={{ mt: 1 }}>
					{candidate && (
						<Typography variant="body1" gutterBottom>
							Assign <strong>{candidate.name}</strong> to a sourcing user.
						</Typography>
					)}

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
							<CircularProgress size={24} />
						</Box>
					) : (
						<FormControl fullWidth sx={{ mt: 2 }}>
							<InputLabel id="assign-user-label">Sourcing User</InputLabel>
							<Select
								labelId="assign-user-label"
								value={selectedUserId}
								label="Sourcing User"
								onChange={(e) => setSelectedUserId(e.target.value as number)}
								disabled={submitting}
							>
								<MenuItem value="">
									<em>None</em>
								</MenuItem>
								{users.map((user) => (
									<MenuItem key={user.id} value={user.id}>
										{user.full_name} ({user.email})
									</MenuItem>
								))}
							</Select>
						</FormControl>
					)}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={submitting}>
					Cancel
				</Button>
				<Button 
					onClick={handleSubmit} 
					variant="contained" 
					color="primary"
					disabled={!selectedUserId || submitting}
				>
					{submitting ? <CircularProgress size={24} /> : 'Assign'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AssignCandidateDialog;
