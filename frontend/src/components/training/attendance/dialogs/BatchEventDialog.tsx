import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Stack,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	TextField,
	Button
} from '@mui/material';
import { format } from 'date-fns';

interface BatchEventDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (event: { title: string; event_type: 'holiday' | 'event'; description: string }) => void;
	selectedDate: Date;
}

const BatchEventDialog: React.FC<BatchEventDialogProps> = ({
	open,
	onClose,
	onConfirm,
	selectedDate
}) => {
	const [newEvent, setNewEvent] = useState({
		title: '',
		event_type: 'holiday' as 'holiday' | 'event',
		description: ''
	});

	const handleConfirm = () => {
		onConfirm(newEvent);
		setNewEvent({ title: '', event_type: 'holiday', description: '' });
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: 700 }}>Mark Date as Holiday/Event</DialogTitle>
			<DialogContent>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Enter details for {format(selectedDate, 'MMM dd, yyyy')}.
				</Typography>
				<Stack spacing={3}>
					<FormControl component="fieldset">
						<RadioGroup
							row
							value={newEvent.event_type}
							onChange={(e) => setNewEvent(prev => ({ ...prev, event_type: e.target.value as any }))}
						>
							<FormControlLabel value="holiday" control={<Radio />} label="Holiday" />
							<FormControlLabel value="event" control={<Radio />} label="Special Event" />
						</RadioGroup>
					</FormControl>
					<TextField
						fullWidth
						label="Event Title"
						placeholder="e.g., Independence Day, Pongal, Workshop"
						value={newEvent.title}
						onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
						size="small"
					/>
					<TextField
						fullWidth
						multiline
						rows={3}
						label="Description (Optional)"
						value={newEvent.description}
						onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
						size="small"
					/>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 1 }}>
				<Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
				<Button
					variant="contained"
					onClick={handleConfirm}
					disabled={!newEvent.title}
					sx={{ bgcolor: '#232f3e', '&:hover': { bgcolor: '#1a242e' }, textTransform: 'none', px: 3 }}
				>
					Save Event
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BatchEventDialog;
