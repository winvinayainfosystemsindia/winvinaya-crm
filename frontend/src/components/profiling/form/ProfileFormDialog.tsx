import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControlLabel,
	Checkbox,
	Typography,
	Box,
	Stack
} from '@mui/material';
import type { CandidateProfileCreate } from '../../../models/candidate';

interface ProfileFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (profile: CandidateProfileCreate) => void;
	initialData?: CandidateProfileCreate;
	candidateName?: string;
}

const ProfileFormDialog: React.FC<ProfileFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	candidateName
}) => {
	const [formData, setFormData] = useState<CandidateProfileCreate>(
		initialData || {
			trained_by_winvinaya: false,
			willing_for_training: false,
			ready_to_relocate: false
		}
	);

	useEffect(() => {
		if (open) {
			setFormData(
				initialData || {
					trained_by_winvinaya: false,
					willing_for_training: false,
					ready_to_relocate: false
				}
			);
		}
	}, [initialData, open]);

	const handleChange = (field: keyof CandidateProfileCreate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = () => {
		// Clean up form data: convert empty strings to undefined/null to match backend schema
		const cleanedData: any = { ...formData };

		// List of optional fields that might be empty strings
		const optionalFields = [
			'dob',
			'training_domain',
			'batch_number',
			'training_from',
			'training_to',
			'interested_training'
		];


		optionalFields.forEach(field => {
			if (cleanedData[field] === '') {
				cleanedData[field] = null;
			}
		});

		// Append time to date fields to match backend datetime schema
		const dateFields = ['dob', 'training_from', 'training_to'];
		dateFields.forEach(field => {
			if (cleanedData[field] && !cleanedData[field].includes('T')) {
				cleanedData[field] = `${cleanedData[field]}T00:00:00`;
			}
		});

		onSubmit(cleanedData);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
				}
			}}
		>
			<DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
				<Typography variant="h6" component="div">
					{initialData ? 'Edit Profile' : 'Create Profile'}
				</Typography>
				{candidateName && (
					<Typography variant="body2" color="text.secondary">
						Candidate: {candidateName}
					</Typography>
				)}
			</DialogTitle>

			<DialogContent sx={{ pt: 3 }}>
				<Stack spacing={3}>
					{/* Date of Birth and Training Domain */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
						<TextField
							fullWidth
							label="Date of Birth"
							type="date"
							value={formData.dob || ''}
							onChange={(e) => handleChange('dob', e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
						<TextField
							fullWidth
							label="Training Domain"
							value={formData.training_domain || ''}
							onChange={(e) => handleChange('training_domain', e.target.value)}
						/>
					</Box>

					{/* Batch Number and Training From */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
						<TextField
							fullWidth
							label="Batch Number"
							value={formData.batch_number || ''}
							onChange={(e) => handleChange('batch_number', e.target.value)}
						/>
						<TextField
							fullWidth
							label="Training From"
							type="date"
							value={formData.training_from || ''}
							onChange={(e) => handleChange('training_from', e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</Box>

					{/* Training To */}
					<TextField
						fullWidth
						label="Training To"
						type="date"
						value={formData.training_to || ''}
						onChange={(e) => handleChange('training_to', e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>

					{/* Interested Training */}
					<TextField
						fullWidth
						label="Interested Training"
						multiline
						rows={2}
						value={formData.interested_training || ''}
						onChange={(e) => handleChange('interested_training', e.target.value)}
					/>

					{/* Checkboxes */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<FormControlLabel
							control={
								<Checkbox
									checked={formData.trained_by_winvinaya || false}
									onChange={(e) => handleChange('trained_by_winvinaya', e.target.checked)}
								/>
							}
							label="Trained by WinVinaya"
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={formData.willing_for_training || false}
									onChange={(e) => handleChange('willing_for_training', e.target.checked)}
								/>
							}
							label="Willing for Training"
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={formData.ready_to_relocate || false}
									onChange={(e) => handleChange('ready_to_relocate', e.target.checked)}
								/>
							}
							label="Ready to Relocate"
						/>
					</Box>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
				<Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} variant="contained" sx={{ textTransform: 'none' }}>
					{initialData ? 'Update' : 'Create'} Profile
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ProfileFormDialog;
