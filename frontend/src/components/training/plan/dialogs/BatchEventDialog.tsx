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
	Button,
	Alert,
	Box,
	IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
		<Dialog 
			open={open} 
			onClose={onClose} 
			maxWidth="xs" 
			fullWidth
			PaperProps={{
				sx: { borderRadius: 1 }
			}}
		>
			<DialogTitle 
				sx={{ 
					bgcolor: '#232f3e', 
					color: 'white', 
					py: 1.5, 
					px: 3,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					fontWeight: 700,
					fontSize: '1.1rem'
				}}
			>
				Mark Date as Holiday/Event
				<IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ mt: 2 }}>
				<Box sx={{ mb: 3 }}>
					<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
						Target Date:
					</Typography>
					<Typography variant="body1" fontWeight="700" color="primary.main">
						{format(selectedDate, 'EEEE, MMM dd, yyyy')}
					</Typography>
				</Box>

				<Stack spacing={3}>
					<FormControl component="fieldset">
						<RadioGroup
							row
							value={newEvent.event_type}
							onChange={(e) => setNewEvent(prev => ({ ...prev, event_type: e.target.value as any }))}
						>
							<FormControlLabel 
								value="holiday" 
								control={<Radio size="small" />} 
								label={<Typography variant="body2" fontWeight="600">Holiday</Typography>} 
							/>
							<FormControlLabel 
								value="event" 
								control={<Radio size="small" />} 
								label={<Typography variant="body2" fontWeight="600">Special Event</Typography>} 
							/>
						</RadioGroup>
					</FormControl>

					{newEvent.event_type === 'holiday' && (
						<Alert severity="warning" variant="filled" sx={{ borderRadius: 1 }}>
							<Typography variant="caption" sx={{ fontWeight: 600 }}>
								Marking this day as a holiday will <strong>permanently delete</strong> all existing training plans and attendance for this date.
							</Typography>
						</Alert>
					)}

					<TextField
						fullWidth
						label="Event Title"
						placeholder="e.g., Independence Day, Pongal, Workshop"
						value={newEvent.title}
						onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
						size="small"
						InputLabelProps={{ shrink: true }}
					/>
					
					<TextField
						fullWidth
						multiline
						rows={3}
						label="Description (Optional)"
						value={newEvent.description}
						onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
						size="small"
						InputLabelProps={{ shrink: true }}
					/>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
				<Button 
					onClick={onClose} 
					sx={{ 
						textTransform: 'none', 
						fontWeight: 600,
						color: '#545b64'
					}}
				>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleConfirm}
					disabled={!newEvent.title}
					sx={{ 
						bgcolor: '#ec7211', 
						'&:hover': { bgcolor: '#eb5f07' }, 
						textTransform: 'none', 
						px: 3,
						fontWeight: 700,
						boxShadow: 'none',
						'&.Mui-disabled': {
							bgcolor: '#f2f3f3',
							color: '#95a5a6'
						}
					}}
				>
					Save Event
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BatchEventDialog;
