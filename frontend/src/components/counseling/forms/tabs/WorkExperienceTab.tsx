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
	Divider
} from '@mui/material';
import {
	Work as WorkIcon,
	InfoOutlined as InfoIcon,
	Add as AddIcon,
	DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import type { CandidateCounselingCreate, WorkExperience } from '../../../../models/candidate';

interface WorkExperienceTabProps {
	formData: CandidateCounselingCreate;
	onAddWorkExp: () => void;
	onRemoveWorkExp: (index: number) => void;
	onWorkExpChange: (index: number, field: string, value: unknown) => void;
	candidateWorkExperience?: WorkExperience;
}

const WorkExperienceTab: React.FC<WorkExperienceTabProps> = ({
	formData,
	onAddWorkExp,
	onRemoveWorkExp,
	onWorkExpChange,
	candidateWorkExperience
}) => {
	const { sectionTitle, awsPanel, fieldLabel, helperBox } = awsStyles;

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '2px',
			bgcolor: '#fcfcfc',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' },
			'&.Mui-focused fieldset': { borderColor: '#ec7211' }
		}
	};

	const workexperienceList = formData.workexperience || [];

	return (
		<Stack spacing={4}>
			{/* Candidate's Profile Work Experience (Reference) */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#007eb9', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<InfoIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Candidate Profile Overview</Typography>
				</Stack>

				<Box sx={{ bgcolor: '#f1faff', p: 3, borderRadius: '2px', border: '1px solid #007eb9' }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={{ ...fieldLabel, color: '#007eb9', mb: 0.5 }}>Is Experienced</Typography>
							<Typography variant="body2" sx={{ fontWeight: 700, color: '#16191f' }}>
								{candidateWorkExperience?.is_experienced ? 'Yes' : 'No'}
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={{ ...fieldLabel, color: '#007eb9', mb: 0.5 }}>Currently Employed</Typography>
							<Typography variant="body2" sx={{ fontWeight: 700, color: '#16191f' }}>
								{candidateWorkExperience?.currently_employed ? 'Yes' : 'No'}
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={{ ...fieldLabel, color: '#007eb9', mb: 0.5 }}>Years of Experience</Typography>
							<Typography variant="body2" sx={{ fontWeight: 700, color: '#16191f' }}>
								{candidateWorkExperience?.year_of_experience || 'Not Specified'}
							</Typography>
						</Grid>
					</Grid>
				</Box>
			</Paper>

			{/* Counseling Work Experience Details */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
							<WorkIcon sx={{ color: '#ffffff', fontSize: 20 }} />
						</Box>
						<Typography sx={sectionTitle}>Professional History Details</Typography>
					</Stack>
					<Button
						variant="outlined"
						size="small"
						startIcon={<AddIcon />}
						onClick={onAddWorkExp}
						sx={{
							borderRadius: '2px',
							textTransform: 'none',
							fontWeight: 700,
							borderColor: '#d5dbdb',
							color: '#545b64',
							'&:hover': { bgcolor: '#f2f3f3', borderColor: '#879596' }
						}}
					>
						Add Work History
					</Button>
				</Stack>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
						Discussion Context: Capture detailed work experience as discussed during counseling. Multiple entries can be added for comprehensive history.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				{workexperienceList.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 6, border: '1px dashed #d5dbdb', borderRadius: '2px' }}>
						<Typography variant="body2" sx={{ color: '#545b64', fontStyle: 'italic' }}>
							No work experience entries have been added to this counseling record yet.
						</Typography>
					</Box>
				) : (
					<Stack spacing={4}>
						{workexperienceList.map((exp, index) => (
							<Box
								key={index}
								sx={{
									p: 3,
									border: '1px solid #eaeded',
									borderRadius: '2px',
									bgcolor: '#fcfcfc',
									'&:hover': { borderColor: '#d5dbdb', bgcolor: '#ffffff' },
									transition: 'all 0.2s ease'
								}}
							>
								<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
									<Typography sx={{ fontWeight: 700, color: '#ec7211', fontSize: '0.9rem', textTransform: 'uppercase' }}>
										Record #{index + 1}
									</Typography>
									<IconButton
										size="small"
										onClick={() => onRemoveWorkExp(index)}
										sx={{ 
											color: '#d91d11',
											'&:hover': { bgcolor: '#fdf3f2' }
										}}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Stack>

								<Grid container spacing={4}>
									<Grid size={{ xs: 12, md: 6 }}>
										<Box>
											<Typography sx={fieldLabel}>Job Title</Typography>
											<TextField
												fullWidth
												size="small"
												value={exp.job_title || ''}
												onChange={(e) => onWorkExpChange(index, 'job_title', e.target.value)}
												placeholder="e.g. Sales Executive"
												sx={inputSx}
											/>
										</Box>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<Box>
											<Typography sx={fieldLabel}>Company Name</Typography>
											<TextField
												fullWidth
												size="small"
												value={exp.company || ''}
												onChange={(e) => onWorkExpChange(index, 'company', e.target.value)}
												placeholder="e.g. Acme Corp"
												sx={inputSx}
											/>
										</Box>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<Box>
											<Typography sx={fieldLabel}>Duration / Years of Experience</Typography>
											<TextField
												fullWidth
												size="small"
												value={exp.years_of_experience || ''}
												onChange={(e) => onWorkExpChange(index, 'years_of_experience', e.target.value)}
												placeholder="e.g. 2.5 years"
												sx={inputSx}
											/>
										</Box>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'flex-end', pb: 1 }}>
										<FormControlLabel
											control={
												<Checkbox
													checked={exp.currently_working || false}
													onChange={(e) => onWorkExpChange(index, 'currently_working', e.target.checked)}
													sx={{ 
														color: '#d5dbdb', 
														'&.Mui-checked': { color: '#ec7211' } 
													}}
												/>
											}
											label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e' }}>Is Currently Working Here?</Typography>}
											sx={{ ml: 0 }}
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
