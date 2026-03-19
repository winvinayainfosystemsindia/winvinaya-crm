import React from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	Grid,
	Autocomplete,
	TextField,
	FormControl,
	Select,
	MenuItem,
	IconButton,
	Paper
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import type { CandidateCounselingCreate } from '../../../../models/candidate';

interface SkillAssessmentTabProps {
	formData: CandidateCounselingCreate;
	onAddSkill: () => void;
	onRemoveSkill: (index: number) => void;
	onSkillChange: (index: number, field: string, value: string) => void;
	commonSkills: string[];
}

const SkillAssessmentTab: React.FC<SkillAssessmentTabProps> = ({
	formData,
	onAddSkill,
	onRemoveSkill,
	onSkillChange,
	commonSkills
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

	return (
		<Paper elevation={0} sx={awsPanel}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography sx={sectionTitle}>Candidate Skills Assessment</Typography>
				<Button
					variant="outlined"
					size="small"
					startIcon={<AddIcon />}
					onClick={onAddSkill}
					sx={{
						borderRadius: '2px',
						textTransform: 'none',
						fontWeight: 700,
						borderColor: '#d5dbdb',
						color: '#545b64',
						'&:hover': { bgcolor: '#f2f3f3', borderColor: '#879596' }
					}}
				>
					Add Skill
				</Button>
			</Box>

			<Box sx={helperBox}>
				<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
				<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
					Assessment Tip: Please list at least three key skills to provide a comprehensive profile of the candidate's capabilities.
				</Typography>
			</Box>

			<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

			{formData.skills && formData.skills.length > 0 ? (
				<Stack spacing={3}>
					{formData.skills.map((skill, index: number) => (
						<Grid container spacing={2} key={index} alignItems="flex-end">
							<Grid size={{ xs: 12, md: 6 }}>
								<Box>
									<Typography sx={fieldLabel}>Skill Name</Typography>
									<Autocomplete
										freeSolo
										options={commonSkills}
										value={skill.name}
										onChange={(_e, val) => onSkillChange(index, 'name', val || '')}
										onInputChange={(_e, val) => onSkillChange(index, 'name', val)}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder="Enter or select a skill"
												size="small"
												fullWidth
												required
												sx={inputSx}
											/>
										)}
									/>
								</Box>
							</Grid>
							<Grid size={{ xs: 10, md: 5 }}>
								<Box>
									<Typography sx={fieldLabel}>Proficiency Level</Typography>
									<FormControl fullWidth size="small">
										<Select
											value={skill.level}
											onChange={(e) => onSkillChange(index, 'level', e.target.value as string)}
											sx={{
												borderRadius: '2px',
												bgcolor: '#fcfcfc',
												'& .MuiOutlinedInput-notchedOutline': { borderColor: '#d5dbdb' },
												'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#879596' },
												'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ec7211' }
											}}
										>
											<MenuItem value="Beginner">Beginner</MenuItem>
											<MenuItem value="Intermediate">Intermediate</MenuItem>
											<MenuItem value="Advanced">Advanced</MenuItem>
										</Select>
									</FormControl>
								</Box>
							</Grid>
							<Grid size={{ xs: 2, md: 1 }} sx={{ pb: 0.5 }}>
								<IconButton 
									onClick={() => onRemoveSkill(index)}
									sx={{ 
										color: '#d91d11',
										'&:hover': { bgcolor: '#fdf3f2' }
									}}
								>
									<DeleteIcon />
								</IconButton>
							</Grid>
						</Grid>
					))}
				</Stack>
			) : (
				<Box sx={{ py: 4, textAlign: 'center', border: '1px dashed #d5dbdb', borderRadius: '2px' }}>
					<Typography variant="body2" sx={{ color: '#545b64', fontStyle: 'italic' }}>
						No skills have been added yet. Click the "Add Skill" button to start the assessment.
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default SkillAssessmentTab;
