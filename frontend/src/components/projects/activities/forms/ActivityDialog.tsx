import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	MenuItem,
	CircularProgress,
	Typography,
	IconButton,
	Fade,
	useTheme
} from '@mui/material';
import {
	Close as CloseIcon,
	ListAlt as ActivityIcon
} from '@mui/icons-material';
import type { DSRActivity, DSRActivityStatus } from '../../../../models/dsr';
import { DSRActivityStatusValues } from '../../../../models/dsr';
import type { User } from '../../../../models/user';
import userService from '../../../../services/userService';
import { useAppDispatch } from '../../../../store/hooks';
import { createActivity, updateActivity } from '../../../../store/slices/dsrSlice';

interface ActivityDialogProps {
	open: boolean;
	activity: DSRActivity | null;
	projectId: string;
	onClose: () => void;
	onSuccess: () => void;
}

const ActivityDialog: React.FC<ActivityDialogProps> = ({
	open,
	activity,
	projectId,
	onClose,
	onSuccess
}) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [actualEndDate, setActualEndDate] = useState<string>('');
	const [status, setStatus] = useState<DSRActivityStatus>(DSRActivityStatusValues.PLANNED);
	const [assignedToPublicId, setAssignedToPublicId] = useState<string>('');
	const [users, setUsers] = useState<User[]>([]);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await userService.getAll(0, 500);
				setUsers(response.items);
			} catch (error) {
				console.error('Failed to fetch users:', error);
			}
		};
		fetchUsers();
	}, []);

	useEffect(() => {
		if (open) {
			if (activity) {
				setName(activity.name);
				setDescription(activity.description || '');
				setStartDate(activity.start_date.split('T')[0]);
				setEndDate(activity.end_date.split('T')[0]);
				setActualEndDate(activity.actual_end_date ? activity.actual_end_date.split('T')[0] : '');
				setStatus(activity.status);
				setAssignedToPublicId(activity.assigned_user?.public_id || '');
			} else {
				setName('');
				setDescription('');
				setStartDate(new Date().toISOString().split('T')[0]);
				setEndDate(new Date().toISOString().split('T')[0]);
				setActualEndDate('');
				setStatus(DSRActivityStatusValues.PLANNED);
				setAssignedToPublicId('');
			}
		}
	}, [activity, open]);

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			const payload = {
				project_public_id: projectId as any,
				name,
				description,
				start_date: startDate,
				end_date: endDate,
				actual_end_date: actualEndDate || null,
				status,
				assigned_to_public_id: assignedToPublicId || null
			};

			if (activity) {
				await dispatch(updateActivity({
					publicId: activity.public_id,
					data: payload as any
				})).unwrap();
			} else {
				await dispatch(createActivity(payload as any)).unwrap();
			}
			onSuccess();
		} catch (error) {
			console.error('Failed to save activity:', error);
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
			TransitionProps={{ timeout: 400 }}
			PaperProps={{
				sx: {
					borderRadius: '4px',
					boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
				}
			}}
		>
			<DialogTitle sx={{
				bgcolor: theme.palette.secondary.main,
				color: '#ffffff',
				py: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<ActivityIcon />
					<Box>
						<Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
							{activity ? 'Edit Activity' : 'Add New Activity'}
						</Typography>
						<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
							{activity ? `Activity ID: ${activity.public_id}` : 'Plan a new activity for this project'}
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={onClose} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
					<TextField
						label="Activity Name"
						fullWidth
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={submitting}
					/>
					<TextField
						label="Description"
						fullWidth
						multiline
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						disabled={submitting}
					/>
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
						<TextField
							label="Start Date"
							type="date"
							fullWidth
							required
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
							disabled={submitting}
						/>
						<TextField
							label="End Date"
							type="date"
							fullWidth
							required
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
							disabled={submitting}
						/>
					</Box>
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
						<TextField
							select
							label="Status"
							fullWidth
							value={status}
							onChange={(e) => {
								const newStatus = e.target.value as DSRActivityStatus;
								setStatus(newStatus);
								if (newStatus === DSRActivityStatusValues.COMPLETED) {
									if (!actualEndDate) {
										setActualEndDate(new Date().toISOString().split('T')[0]);
									}
								} else {
									setActualEndDate('');
								}
							}}
							disabled={submitting}
						>
							{Object.values(DSRActivityStatusValues).map(s => (
								<MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label="Assigned To"
							fullWidth
							value={assignedToPublicId}
							onChange={(e) => setAssignedToPublicId(e.target.value)}
							disabled={submitting}
						>
							<MenuItem value=""><em>Unassigned</em></MenuItem>
							{users.map(u => (
								<MenuItem key={u.public_id} value={u.public_id}>
									{u.full_name || u.username}
								</MenuItem>
							))}
						</TextField>
					</Box>

					{status === DSRActivityStatusValues.COMPLETED && actualEndDate && (
						<Box sx={{
							p: 1.5,
							bgcolor: 'rgba(3, 127, 12, 0.05)',
							border: '1px solid rgba(3, 127, 12, 0.2)',
							borderRadius: 1,
							display: 'flex',
							alignItems: 'center',
							gap: 1
						}}>
							<Typography variant="body2" sx={{ color: '#037f0c', fontWeight: 500 }}>
								Auto-recorded completion date: <strong>{new Date(actualEndDate).toLocaleDateString()}</strong>
							</Typography>
						</Box>
					)}
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
				<Button
					onClick={onClose}
					disabled={submitting}
					sx={{
						color: theme.palette.text.secondary,
						textTransform: 'none',
						fontWeight: 700,
						'&:hover': { bgcolor: '#eaeded' }
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={submitting}
					sx={{
						bgcolor: theme.palette.primary.main,
						color: '#ffffff',
						textTransform: 'none',
						fontWeight: 700,
						px: 4,
						py: 1,
						borderRadius: '2px',
						boxShadow: 'none',
						'&:hover': { bgcolor: '#eb5f07', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
						'&.Mui-disabled': { bgcolor: '#f2f3f3', color: '#959ba1' }
					}}
				>
					{submitting ? <CircularProgress size={24} /> : (activity ? 'Commit Changes' : 'Plan Activity')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ActivityDialog;
