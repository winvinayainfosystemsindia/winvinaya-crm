import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Stack,
	MenuItem,
	IconButton,
	Paper,
	Divider,
	Grid,
	Select,
	FormControl,
	InputLabel,
	Autocomplete,
	Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { TrainingBatch } from '../../../models/training';

interface TrainingBatchFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<TrainingBatch>) => void;
	initialData?: TrainingBatch;
}

const COURSES = [
	'Basic Computer Skills',
	'Advanced Excel',
	'Data Entry & Office Management',
	'Customer Service Excellence',
	'Introduction to Banking',
	'Retail Management Basics',
	'Tally & Basic Accounting',
	'Soft Skills & Communication',
	'English Proficiency'
];

const TrainingBatchFormDialog: React.FC<TrainingBatchFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData
}) => {
	const [formData, setFormData] = useState<Partial<TrainingBatch>>({
		batch_name: '',
		courses: [],
		duration: {
			start_date: new Date().toISOString().split('T')[0],
			end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			weeks: 4
		},
		status: 'planned',
		other: {}
	});

	useEffect(() => {
		if (open) {
			if (initialData) {
				setFormData({
					...initialData,
					duration: initialData.duration ? {
						...initialData.duration,
						start_date: initialData.duration.start_date.split('T')[0],
						end_date: initialData.duration.end_date.split('T')[0]
					} : {
						start_date: new Date().toISOString().split('T')[0],
						end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
						weeks: 4
					}
				});
			} else {
				setFormData({
					batch_name: '',
					courses: [],
					duration: {
						start_date: new Date().toISOString().split('T')[0],
						end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
						weeks: 4
					},
					status: 'planned',
					other: {}
				});
			}
		}
	}, [initialData, open]);

	const handleChange = (field: keyof TrainingBatch, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const calculateWeeks = (start: string, end: string): number => {
		if (!start || !end) return 0;
		const s = new Date(start);
		const e = new Date(end);
		const diffMs = e.getTime() - s.getTime();
		if (diffMs <= 0) return 0;
		return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
	};

	const handleDurationChange = (field: string, value: any) => {
		setFormData((prev) => {
			const newDuration = {
				...(prev.duration || { start_date: '', end_date: '', weeks: 0 }),
				[field]: value
			};

			if (field === 'start_date' || field === 'end_date') {
				newDuration.weeks = calculateWeeks(newDuration.start_date, newDuration.end_date);
			}

			return { ...prev, duration: newDuration };
		});
	};

	const handleSubmit = () => {
		onSubmit(formData);
		onClose();
	};

	// Professional AWS-like styles
	const sectionTitleStyle = {
		fontWeight: 700,
		fontSize: '0.875rem',
		color: '#545b64',
		mb: 2,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.025em'
	};

	const awsPanelStyle = {
		border: '1px solid #d5dbdb',
		borderRadius: '2px',
		p: 3,
		bgcolor: '#ffffff'
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					border: '1px solid #d5dbdb'
				}
			}}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Typography variant="h6" sx={{ fontSize: '1.25rem' }}>
						{initialData ? 'Edit Training Batch' : 'Create New Training Batch'}
					</Typography>
					<IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ p: 4, bgcolor: '#f2f3f3', mt: 2 }}>
				<Stack spacing={3}>
					<Paper elevation={0} sx={awsPanelStyle}>
						<Typography sx={sectionTitleStyle}>General Configuration</Typography>
						<Stack spacing={3}>
							<TextField
								label="Batch Name"
								fullWidth
								size="small"
								variant="outlined"
								value={formData.batch_name}
								onChange={(e) => handleChange('batch_name', e.target.value)}
								placeholder="e.g. CSR Training Batch - Jan 2024"
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
							/>

							<Autocomplete
								multiple
								freeSolo
								options={COURSES}
								value={formData.courses || []}
								onChange={(_e, val) => handleChange('courses', val)}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Select or Enter Courses"
										size="small"
										placeholder="Type and press Enter..."
										variant="outlined"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								)}
								renderTags={(tagValue, getTagProps) =>
									tagValue.map((option, index) => (
										<Chip
											label={option}
											{...getTagProps({ index })}
											size="small"
											sx={{ borderRadius: '2px', bgcolor: '#e1f5fe' }}
										/>
									))
								}
							/>

							<FormControl fullWidth size="small">
								<InputLabel>Status</InputLabel>
								<Select
									value={formData.status}
									label="Status"
									onChange={(e) => handleChange('status', e.target.value)}
									sx={{ borderRadius: '2px' }}
								>
									<MenuItem value="planned">Planned</MenuItem>
									<MenuItem value="running">Running</MenuItem>
									<MenuItem value="closed">Closed</MenuItem>
								</Select>
							</FormControl>
						</Stack>
					</Paper>

					<Paper elevation={0} sx={awsPanelStyle}>
						<Typography sx={sectionTitleStyle}>Schedule & Duration</Typography>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField
									label="Start Date"
									type="date"
									size="small"
									fullWidth
									variant="outlined"
									InputLabelProps={{ shrink: true }}
									value={formData.duration?.start_date}
									onChange={(e) => handleDurationChange('start_date', e.target.value)}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField
									label="End Date"
									type="date"
									size="small"
									fullWidth
									variant="outlined"
									InputLabelProps={{ shrink: true }}
									value={formData.duration?.end_date}
									onChange={(e) => handleDurationChange('end_date', e.target.value)}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								/>
							</Grid>
							<Grid size={{ xs: 12 }}>
								<TextField
									label="Number of Weeks"
									type="number"
									size="small"
									fullWidth
									variant="outlined"
									value={formData.duration?.weeks}
									InputProps={{
										readOnly: true,
										sx: { bgcolor: '#f5f5f5' }
									}}
									helperText="Automatically calculated from dates"
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								/>
							</Grid>
						</Grid>
					</Paper>
				</Stack>
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />
			<DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ color: '#16191f', fontWeight: 700, px: 3, textTransform: 'none' }}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					sx={{
						bgcolor: '#ec7211',
						color: '#ffffff',
						px: 4,
						py: 1,
						fontWeight: 700,
						borderRadius: '2px',
						textTransform: 'none',
						border: '1px solid #ec7211',
						'&:hover': { bgcolor: '#eb5f07', borderColor: '#eb5f07' },
						boxShadow: 'none'
					}}
				>
					{initialData ? 'Update Batch' : 'Create Batch'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TrainingBatchFormDialog;
