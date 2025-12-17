import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Box,
	Stack,
	MenuItem,
	Autocomplete,
	Chip
} from '@mui/material';
import type { CandidateCounselingCreate } from '../../../models/candidate';

const COMMON_SKILLS = [
	'Communication',
	'Computer Basics',
	'Typing',
	'English',
	'MS Excel',
	'MS Word',
	'MS PowerPoint',
	'Data Entry',
	'Accounting',
	'Tally'
];

interface CounselingFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: CandidateCounselingCreate) => void;
	initialData?: CandidateCounselingCreate;
	candidateName?: string;
}

const CounselingFormDialog: React.FC<CounselingFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	candidateName
}) => {
	const [formData, setFormData] = useState<CandidateCounselingCreate>(
		initialData || {
			skills_observed: [],
			suitable_training: '',
			counselor_comments: '',
			status: 'pending',
			counseling_date: new Date().toISOString().split('T')[0]
		}
	);

	useEffect(() => {
		if (open) {
			const data = initialData || {
				skills_observed: [],
				suitable_training: '',
				counselor_comments: '',
				status: 'pending',
				counseling_date: new Date().toISOString().split('T')[0]
			};
			setFormData(data);
		}
	}, [initialData, open]);

	const handleChange = (field: keyof CandidateCounselingCreate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = () => {
		const cleanedData = { ...formData };

		// Append time to date fields to match backend datetime schema
		if (cleanedData.counseling_date && !cleanedData.counseling_date.includes('T')) {
			cleanedData.counseling_date = `${cleanedData.counseling_date}T00:00:00`;
		}

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
					{initialData ? 'Edit Counseling' : 'Add Counseling Details'}
				</Typography>
				{candidateName && (
					<Typography variant="body2" color="text.secondary">
						Candidate: {candidateName}
					</Typography>
				)}
			</DialogTitle>
			<DialogContent sx={{ pt: 3 }}>
				<Stack spacing={3}>
					{/* Assessment Section */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
						<Autocomplete
							multiple
							freeSolo
							options={COMMON_SKILLS}
							value={formData.skills_observed || []}
							onChange={(_event, newValue) => {
								handleChange('skills_observed', newValue);
							}}
							renderTags={(value: readonly string[], getTagProps) =>
								value.map((option: string, index: number) => (
									<Chip variant="outlined" label={option} {...getTagProps({ index })} />
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Skills Observed"
									placeholder="Select or type to add..."
									helperText="Select from list or type and press Enter to add new skills"
								/>
							)}
							fullWidth
						/>
						<TextField
							label="Suitable Training"
							placeholder="e.g. BPO Training, Data Entry"
							fullWidth
							value={formData.suitable_training || ''}
							onChange={(e) => handleChange('suitable_training', e.target.value)}
						/>
					</Box>

					{/* Decision Section */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
						<TextField
							label="Counseling Status"
							select
							fullWidth
							value={formData.status || 'pending'}
							onChange={(e) => handleChange('status', e.target.value)}
						>
							<MenuItem value="pending">Pending</MenuItem>
							<MenuItem value="selected">Selected</MenuItem>
							<MenuItem value="rejected">Rejected</MenuItem>
						</TextField>

						<TextField
							label="Date"
							type="date"
							fullWidth
							InputLabelProps={{ shrink: true }}
							value={formData.counseling_date ? formData.counseling_date.split('T')[0] : ''}
							onChange={(e) => handleChange('counseling_date', e.target.value)}
						/>
					</Box>

					<TextField
						label="Counselor Comments"
						multiline
						rows={4}
						fullWidth
						value={formData.counselor_comments || ''}
						onChange={(e) => handleChange('counselor_comments', e.target.value)}
						placeholder="Enter any additional remarks or observations..."
					/>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
				<Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					sx={{ textTransform: 'none' }}
				>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CounselingFormDialog;
