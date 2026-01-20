import React from 'react';
import {
	Typography,
	Stack,
	Grid,
	TextField,
	FormControlLabel,
	Checkbox,
	Paper,
	Box,
	Button,
	IconButton,
	Tooltip
} from '@mui/material';
import {
	Work as WorkIcon,
	Info as InfoIcon,
	Add as AddIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import type { CandidateCounselingCreate, WorkExperience } from '../../../../models/candidate';

interface WorkExperienceTabProps {
	formData: CandidateCounselingCreate;
	onAddWorkExp: () => void;
	onRemoveWorkExp: (index: number) => void;
	onWorkExpChange: (index: number, field: string, value: any) => void;
	candidateWorkExperience?: WorkExperience;
}

const WorkExperienceTab: React.FC<WorkExperienceTabProps> = ({
	formData,
	onAddWorkExp,
	onRemoveWorkExp,
	onWorkExpChange,
	candidateWorkExperience
}) => {
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

	const infoBoxStyle = {
		bgcolor: '#f1faff',
		border: '1px solid #007eb9',
		borderRadius: '2px',
		p: 2,
		display: 'flex',
		alignItems: 'flex-start',
		gap: 1.5,
		mb: 3
	};

	const workexperienceList = formData.workexperience || [];

	return (
		<Stack spacing={3}>
			{/* Candidate's Profile Work Experience (Reference) */}
			<Paper elevation={0} sx={awsPanelStyle}>
				<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
					<InfoIcon sx={{ color: '#007eb9', fontSize: 20 }} />
					<Typography sx={sectionTitleStyle}>Candidate Profile Work Experience</Typography>
				</Stack>

				<Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: '2px', border: '1px dashed #d5dbdb' }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant="caption" color="text.secondary">Is Experienced</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								{candidateWorkExperience?.is_experienced ? 'Yes' : 'No'}
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant="caption" color="text.secondary">Currently Employed</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								{candidateWorkExperience?.currently_employed ? 'Yes' : 'No'}
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant="caption" color="text.secondary">Years of Experience</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								{candidateWorkExperience?.year_of_experience || 'N/A'}
							</Typography>
						</Grid>
					</Grid>
				</Box>
			</Paper>

			{/* Counseling Work Experience Details */}
			<Paper elevation={0} sx={awsPanelStyle}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
					<Stack direction="row" alignItems="center" spacing={1}>
						<WorkIcon sx={{ color: '#ec7211', fontSize: 20 }} />
						<Typography sx={sectionTitleStyle}>Counseling Work Experience Details</Typography>
					</Stack>
					<Button
						startIcon={<AddIcon />}
						onClick={onAddWorkExp}
						sx={{
							textTransform: 'none',
							color: '#ec7211',
							fontWeight: 700,
							'&:hover': { bgcolor: 'rgba(236, 114, 17, 0.04)' }
						}}
					>
						Add Experience
					</Button>
				</Stack>

				<Box sx={infoBoxStyle}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25 }} />
					<Typography variant="body2" color="#007eb9">
						Collect detailed work experience based on the counseling discussion. You can add multiple entries if the candidate has worked in multiple roles/companies.
					</Typography>
				</Box>

				{workexperienceList.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fbfbfb', border: '1px dashed #cecece' }}>
						<Typography variant="body2" color="text.secondary">No work experience entries added yet.</Typography>
					</Box>
				) : (
					<Stack spacing={3}>
						{workexperienceList.map((exp, index) => (
							<Box
								key={index}
								sx={{
									p: 2,
									border: '1px solid #eaeded',
									borderRadius: '2px',
									position: 'relative',
									'&:hover': { borderColor: '#d5dbdb' }
								}}
							>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ec7211' }}>
										Experience #{index + 1}
									</Typography>
									<Tooltip title="Remove Entry">
										<IconButton
											size="small"
											onClick={() => onRemoveWorkExp(index)}
											sx={{ color: '#d13212' }}
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								</Stack>

								<Grid container spacing={3}>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="Job Title"
											fullWidth
											size="small"
											variant="outlined"
											value={exp.job_title || ''}
											onChange={(e) => onWorkExpChange(index, 'job_title', e.target.value)}
											placeholder="Enter job title"
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="Company Name"
											fullWidth
											size="small"
											variant="outlined"
											value={exp.company || ''}
											onChange={(e) => onWorkExpChange(index, 'company', e.target.value)}
											placeholder="Enter company name"
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="Years of Experience"
											fullWidth
											size="small"
											variant="outlined"
											value={exp.years_of_experience || ''}
											onChange={(e) => onWorkExpChange(index, 'years_of_experience', e.target.value)}
											placeholder="e.g. 2 years, 6 months"
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<FormControlLabel
											control={
												<Checkbox
													checked={exp.currently_working || false}
													onChange={(e) => onWorkExpChange(index, 'currently_working', e.target.checked)}
													sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }}
												/>
											}
											label={<Typography variant="body2">Is Currently Working?</Typography>}
										/>
									</Grid>
								</Grid>
							</Box>
						))}
					</Stack>
				)}
			</Paper>
		</Stack>
	);
};

export default WorkExperienceTab;
