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
	candidates: CandidateListItem[];
}

const AssignCandidateDialog: React.FC<AssignCandidateDialogProps> = ({ open, onClose, onSuccess, candidates }) => {
	const dispatch = useAppDispatch();
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			fetchEligibleUsers();
			// For bulk, we don't pre-select an assigned user unless it's a single candidate
			if (candidates.length === 1 && candidates[0]?.assigned_to_id) {
				setSelectedUserId(candidates[0].assigned_to_id);
			} else {
				setSelectedUserId('');
			}
			setError(null);
		}
	}, [open, candidates]);

	const fetchEligibleUsers = async () => {
		setLoading(true);
		try {
			// Fetch users with 'sourcing' and 'manager' roles in parallel
			const [sourcingResp, managerResp] = await Promise.all([
				userService.getAll(0, 50, 'sourcing'),
				userService.getAll(0, 50, 'manager')
			]);
			
			// Merge and sort by name
			const mergedUsers = [...sourcingResp.items, ...managerResp.items].sort((a, b) => 
				a.full_name.localeCompare(b.full_name)
			);
			
			setUsers(mergedUsers);
		} catch (err: any) {
			setError('Failed to fetch eligible users for assignment');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (candidates.length === 0 || !selectedUserId) return;

		setSubmitting(true);
		setError(null);
		try {
			// Perform bulk assignment
			await Promise.all(candidates.map(candidate => 
				dispatch(assignCandidate({ 
					publicId: candidate.public_id, 
					userId: Number(selectedUserId) 
				})).unwrap()
			));
			
			onSuccess?.();
			onClose();
		} catch (err: any) {
			setError(err || 'Failed to assign candidates');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Assign {candidates.length > 1 ? 'Candidates' : 'Candidate'}</DialogTitle>
			<DialogContent>
				<Box sx={{ mt: 1 }}>
					{candidates.length > 0 && (
						<Typography variant="body1" gutterBottom>
							{candidates.length === 1 ? (
								<>Assign <strong>{candidates[0].name}</strong> to a team member.</>
							) : (
								<>Assign <strong>{candidates.length} candidates</strong> to a team member.</>
							)}
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
							<InputLabel id="assign-user-label">Select Team Member</InputLabel>
							<Select
								labelId="assign-user-label"
								value={selectedUserId}
								label="Select Team Member"
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
