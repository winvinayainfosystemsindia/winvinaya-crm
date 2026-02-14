import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	Typography,
	IconButton,
	Chip
} from '@mui/material';
import { Close as CloseIcon, Notes as NotesIcon } from '@mui/icons-material';

interface TrainerNotesDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (notes: string) => void;
	candidateName: string;
	periodName: string;
	periodTime: string;
	currentNotes: string;
}

const TrainerNotesDialog: React.FC<TrainerNotesDialogProps> = ({
	open,
	onClose,
	onSave,
	candidateName,
	periodName,
	periodTime,
	currentNotes
}) => {
	const [notes, setNotes] = useState(currentNotes);

	// Update notes when dialog opens with new data
	useEffect(() => {
		if (open) {
			setNotes(currentNotes);
		}
	}, [open, currentNotes]);

	const handleSave = () => {
		onSave(notes);
		onClose();
	};

	const handleCancel = () => {
		setNotes(currentNotes); // Reset to original
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleCancel}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '4px',
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
				}
			}}
		>
			<DialogTitle sx={{
				bgcolor: '#f8f9fa',
				borderBottom: '1px solid #eaeded',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				py: 2
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<NotesIcon sx={{ color: '#007eb9' }} />
					<Typography variant="h6" sx={{ fontWeight: 600, color: '#232f3e' }}>
						Trainer Notes
					</Typography>
				</Box>
				<IconButton
					onClick={handleCancel}
					size="small"
					sx={{ color: '#545b64' }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ pt: 3, pb: 2 }}>
				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
						<strong>Student:</strong> {candidateName}
					</Typography>
					<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
						<Chip
							label={periodName}
							size="small"
							sx={{
								bgcolor: '#e3f2fd',
								color: '#007eb9',
								fontWeight: 600
							}}
						/>
						<Typography variant="caption" color="text.secondary">
							{periodTime}
						</Typography>
					</Box>
				</Box>

				<TextField
					fullWidth
					multiline
					rows={6}
					label="Notes"
					placeholder="Add observations, performance notes, or any relevant comments about this student's attendance for this period..."
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					variant="outlined"
					autoFocus
					sx={{
						'& .MuiOutlinedInput-root': {
							fontSize: '0.875rem',
							'& fieldset': {
								borderColor: '#d5dbdb'
							},
							'&:hover fieldset': {
								borderColor: '#007eb9'
							},
							'&.Mui-focused fieldset': {
								borderColor: '#007eb9'
							}
						}
					}}
					helperText={`${notes.length} characters`}
				/>
			</DialogContent>

			<DialogActions sx={{
				px: 3,
				py: 2,
				bgcolor: '#f8f9fa',
				borderTop: '1px solid #eaeded'
			}}>
				<Button
					onClick={handleCancel}
					sx={{
						textTransform: 'none',
						color: '#545b64',
						fontWeight: 600
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					sx={{
						bgcolor: '#007eb9',
						'&:hover': { bgcolor: '#005a8c' },
						textTransform: 'none',
						fontWeight: 600,
						boxShadow: 'none',
						px: 3
					}}
				>
					Save Notes
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TrainerNotesDialog;
