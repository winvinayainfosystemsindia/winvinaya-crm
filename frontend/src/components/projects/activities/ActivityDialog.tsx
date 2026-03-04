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
	Divider
} from '@mui/material';
import type { DSRActivity, DSRActivityStatus } from '../../../models/dsr';
import { DSRActivityStatusValues } from '../../../models/dsr';
import { useAppDispatch } from '../../../store/hooks';
import { createActivity, updateActivity } from '../../../store/slices/dsrSlice';

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
	const dispatch = useAppDispatch();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [status, setStatus] = useState<DSRActivityStatus>(DSRActivityStatusValues.PLANNED);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			if (activity) {
				setName(activity.name);
				setDescription(activity.description || '');
				setStartDate(activity.start_date.split('T')[0]);
				setEndDate(activity.end_date.split('T')[0]);
				setStatus(activity.status);
			} else {
				setName('');
				setDescription('');
				setStartDate(new Date().toISOString().split('T')[0]);
				setEndDate(new Date().toISOString().split('T')[0]);
				setStatus(DSRActivityStatusValues.PLANNED);
			}
		}
	}, [activity, open]);

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			const payload = {
				project_public_id: projectId as any, // backend expects UUID
				name,
				description,
				start_date: startDate,
				end_date: endDate,
				status
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
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>{activity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
			<Divider />
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
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
					<TextField
						select
						label="Status"
						fullWidth
						value={status}
						onChange={(e) => setStatus(e.target.value as DSRActivityStatus)}
						disabled={submitting}
					>
						{Object.values(DSRActivityStatusValues).map(s => (
							<MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
						))}
					</TextField>
				</Box>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} disabled={submitting}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={submitting}
					sx={{ bgcolor: '#ec7211', '&:hover': { bgcolor: '#eb5f07' } }}
				>
					{submitting ? <CircularProgress size={24} /> : (activity ? 'Save Changes' : 'Create Activity')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ActivityDialog;
