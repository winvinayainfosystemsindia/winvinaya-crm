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
	Divider,
	useTheme,
	alpha
} from '@mui/material';
import {
	Work as WorkIcon,
	InfoOutlined as InfoIcon,
	Add as AddIcon,
	DeleteOutline as DeleteIcon
} from '@mui/icons-material';
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
	const theme = useTheme();

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: 0.5,
			bgcolor: 'background.paper',
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.secondary' },
			'&.Mui-focused fieldset': { borderColor: 'primary.main' }
		}
	};

	const workexperienceList = formData.workexperience || [];

	return (
		<Stack spacing={4}>
			{/* Candidate's Profile Work Experience (Reference) */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
						<InfoIcon sx={{ color: 'common.white', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Candidate Profile Overview</Typography>
				</Stack>

				<Box sx={{ 
					bgcolor: alpha(theme.palette.primary.main, 0.04), 
					p: 3, 
					borderRadius: 0.5, 
					border: '1px solid', 
					borderColor: 'primary.main' 
				}}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant="awsFieldLabel" sx={{ color: 'primary.main', mb: 0.5 }}>Is Experienced</Typography>
							<Typography variant="subtitle2">
								{candidateWorkExperience?.is_experienced ? 'Yes' : 'No'}
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant="awsFieldLabel" sx={{ color: 'primary.main', mb: 0.5 }}>Currently Employed</Typography>
							<Typography variant="subtitle2">
								{candidateWorkExperience?.currently_employed ? 'Yes' : 'No'}
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant="awsFieldLabel" sx={{ color: 'primary.main', mb: 0.5 }}>Years of Experience</Typography>
							<Typography variant="subtitle2">
								{candidateWorkExperience?.year_of_experience || 'Not Specified'}
							</Typography>
						</Grid>
					</Grid>
				</Box>
			</Paper>

			{/* Counseling Work Experience Details */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
							<WorkIcon sx={{ color: 'common.white', fontSize: 20 }} />
						</Box>
						<Typography variant="awsSectionTitle">Professional History Details</Typography>
					</Stack>
					<Button
						variant="contained"
						size="small"
						startIcon={<AddIcon />}
						onClick={onAddWorkExp}
						sx={{
							borderRadius: 0.5,
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { boxShadow: 'none', bgcolor: 'primary.dark' }
						}}
					>
						Add Work History
					</Button>
				</Stack>

				<Divider sx={{ mb: 4 }} />

				{workexperienceList.length === 0 ? (
					<Box sx={{ 
						textAlign: 'center', 
						py: 6, 
						border: '1px dashed', 
						borderColor: 'divider', 
						borderRadius: 0.5, 
						bgcolor: 'background.default' 
					}}>
						<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
							No work experience entries have been added to this counseling record yet.
						</Typography>
					</Box>
				) : (
					<Stack spacing={4}>
						{workexperienceList.map((exp, index) => (
							<Paper
								key={index}
								elevation={0}
								variant="outlined"
								sx={{
									borderRadius: 0.5,
									bgcolor: 'background.paper',
									overflow: 'hidden'
								}}
							>
								<Box sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									px: 3,
									py: 1.5,
									bgcolor: 'action.hover',
									borderBottom: '1px solid',
									borderColor: 'divider'
								}}>
									<Typography variant="subtitle2" color="primary.main" sx={{ textTransform: 'uppercase' }}>
										Record #{index + 1}
									</Typography>
									<IconButton
										size="small"
										onClick={() => onRemoveWorkExp(index)}
										sx={{ 
											color: 'error.main',
											'&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
										}}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Box>
 
								<Box sx={{ p: 3 }}>
									<Grid container spacing={4}>
										<Grid size={{ xs: 12, md: 6 }}>
											<Box>
												<Typography variant="awsFieldLabel">Job Title</Typography>
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
												<Typography variant="awsFieldLabel">Company Name</Typography>
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
												<Typography variant="awsFieldLabel">Duration / Years of Experience</Typography>
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
														size="small"
														checked={exp.currently_working || false}
														onChange={(e) => onWorkExpChange(index, 'currently_working', e.target.checked)}
														sx={{ 
															color: 'divider', 
															'&.Mui-checked': { color: 'primary.main' } 
														}}
													/>
												}
												label={<Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>Is Currently Working Here?</Typography>}
												sx={{ ml: 0 }}
											/>
										</Grid>
									</Grid>
								</Box>
							</Paper>
						))}
					</Stack>
				)}
			</Paper>
		</Stack>
	);
};

export default WorkExperienceTab;
