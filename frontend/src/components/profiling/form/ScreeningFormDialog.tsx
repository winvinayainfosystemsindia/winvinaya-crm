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
	Stack,
	Tabs,
	Tab,
	Divider
} from '@mui/material';
import type { CandidateScreeningCreate } from '../../../models/candidate';

interface ScreeningFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (screening: CandidateScreeningCreate) => void;
	initialData?: any; // Can be CandidateScreening or CandidateScreeningCreate
	candidateName?: string;
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`screening-form-tabpanel-${index}`}
			aria-labelledby={`screening-form-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
		</div>
	);
}

const ScreeningFormDialog: React.FC<ScreeningFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	candidateName
}) => {
	const [tabValue, setTabValue] = useState(0);
	const [formData, setFormData] = useState<CandidateScreeningCreate>({
		previous_training: {},
		skills: {},
		others: {},
		documents_upload: {}
	});

	useEffect(() => {
		if (open) {
			setTabValue(0);
			if (initialData) {
				setFormData({
					previous_training: initialData.previous_training || {},
					skills: initialData.skills || {},
					others: initialData.others || {},
					documents_upload: initialData.documents_upload || {}
				});
			} else {
				setFormData({
					previous_training: {},
					skills: {},
					others: {},
					documents_upload: {}
				});
			}
		}
	}, [initialData, open]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleUpdateField = (section: keyof CandidateScreeningCreate, field: string, value: any) => {
		setFormData((prev: any) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value
			}
		}));
	};

	const handleSubmit = () => {
		// Clean up data if needed
		onSubmit(formData);
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
					boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
				}
			}}
		>
			<DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
				<Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
					{initialData ? 'Edit Screening' : 'Candidate Screening'}
				</Typography>
				{candidateName && (
					<Typography variant="body2" color="text.secondary">
						Candidate: {candidateName}
					</Typography>
				)}
			</DialogTitle>

			<DialogContent sx={{ p: 0 }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
					<Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
						<Tab label="Previous Training" sx={{ textTransform: 'none' }} />
						<Tab label="Skills Assessment" sx={{ textTransform: 'none' }} />
						<Tab label="Other Details" sx={{ textTransform: 'none' }} />
					</Tabs>
				</Box>

				<Box sx={{ px: 3, pb: 2, minHeight: '350px' }}>
					{/* Previous Training Tab */}
					<TabPanel value={tabValue} index={0}>
						<Stack spacing={3}>
							<FormControlLabel
								control={
									<Checkbox
										checked={formData.previous_training?.trained_by_winvinaya || false}
										onChange={(e) => handleUpdateField('previous_training', 'trained_by_winvinaya', e.target.checked)}
									/>
								}
								label="Trained by WinVinaya"
							/>

							<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
								<TextField
									fullWidth
									label="Training Domain"
									value={formData.previous_training?.training_domain || ''}
									onChange={(e) => handleUpdateField('previous_training', 'training_domain', e.target.value)}
									size="small"
								/>
								<TextField
									fullWidth
									label="Batch Number"
									value={formData.previous_training?.batch_number || ''}
									onChange={(e) => handleUpdateField('previous_training', 'batch_number', e.target.value)}
									size="small"
								/>
							</Box>

							<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
								<TextField
									fullWidth
									label="Training From"
									type="date"
									value={formData.previous_training?.training_from || ''}
									onChange={(e) => handleUpdateField('previous_training', 'training_from', e.target.value)}
									InputLabelProps={{ shrink: true }}
									size="small"
								/>
								<TextField
									fullWidth
									label="Training To"
									type="date"
									value={formData.previous_training?.training_to || ''}
									onChange={(e) => handleUpdateField('previous_training', 'training_to', e.target.value)}
									InputLabelProps={{ shrink: true }}
									size="small"
								/>
							</Box>
						</Stack>
					</TabPanel>

					{/* Skills Assessment Tab */}
					<TabPanel value={tabValue} index={1}>
						<Stack spacing={3}>
							<Typography variant="subtitle2" color="text.secondary">
								Assess candidate skills observed during screening
							</Typography>
							<TextField
								fullWidth
								label="Technical Skills"
								multiline
								rows={3}
								value={formData.skills?.technical || ''}
								onChange={(e) => handleUpdateField('skills', 'technical', e.target.value)}
								placeholder="Enter observed technical skills..."
							/>
							<TextField
								fullWidth
								label="Soft Skills"
								multiline
								rows={3}
								value={formData.skills?.soft_skills || ''}
								onChange={(e) => handleUpdateField('skills', 'soft_skills', e.target.value)}
								placeholder="Enter observed communication and soft skills..."
							/>
						</Stack>
					</TabPanel>

					{/* Other Details Tab */}
					<TabPanel value={tabValue} index={2}>
						<Stack spacing={3}>
							<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
								<TextField
									fullWidth
									label="Date of Birth"
									type="date"
									value={formData.others?.dob || ''}
									onChange={(e) => handleUpdateField('others', 'dob', e.target.value)}
									InputLabelProps={{ shrink: true }}
									size="small"
								/>
								<TextField
									fullWidth
									label="Interested Training"
									value={formData.others?.interested_training || ''}
									onChange={(e) => handleUpdateField('others', 'interested_training', e.target.value)}
									size="small"
								/>
							</Box>

							<Divider />

							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<FormControlLabel
									control={
										<Checkbox
											checked={formData.others?.willing_for_training || false}
											onChange={(e) => handleUpdateField('others', 'willing_for_training', e.target.checked)}
										/>
									}
									label="Willing for Training"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={formData.others?.ready_to_relocate || false}
											onChange={(e) => handleUpdateField('others', 'ready_to_relocate', e.target.checked)}
										/>
									}
									label="Ready to Relocate"
								/>
							</Box>

							<TextField
								fullWidth
								label="Additional Comments"
								multiline
								rows={3}
								value={formData.others?.comments || ''}
								onChange={(e) => handleUpdateField('others', 'comments', e.target.value)}
							/>
						</Stack>
					</TabPanel>
				</Box>
			</DialogContent>

			<Divider />
			<DialogActions sx={{ p: 2.5 }}>
				<Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none', px: 3 }}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} variant="contained" sx={{ textTransform: 'none', px: 3 }}>
					{initialData ? 'Update' : 'Complete'} Screening
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ScreeningFormDialog;
