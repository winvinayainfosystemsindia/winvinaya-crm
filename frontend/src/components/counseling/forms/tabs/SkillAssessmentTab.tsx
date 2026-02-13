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
	InputLabel,
	Select,
	MenuItem,
	IconButton,
	Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';

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

	return (
		<Paper elevation={0} sx={awsPanelStyle}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
				<Typography sx={{ ...sectionTitleStyle, mb: 0 }}>Skills Assessment</Typography>
				<Button
					variant="outlined"
					size="small"
					startIcon={<Add />}
					onClick={onAddSkill}
					sx={{
						borderRadius: '2px',
						textTransform: 'none',
						borderColor: '#d5dbdb',
						color: '#16191f',
						'&:hover': { bgcolor: '#f2f3f3', borderColor: '#545b64' }
					}}
				>
					Add Skill
				</Button>
			</Box>
			<Box sx={infoBoxStyle}>
				<InfoIcon sx={{ color: '#007eb9', mt: 0.25 }} />
				<Typography variant="body2" color="#007eb9">
					Please mention at least three key skills you believe you have (you may list more than three if applicable).
				</Typography>
			</Box>
			<Divider sx={{ mb: 3 }} />
			{formData.skills && formData.skills.length > 0 ? (
				<Stack spacing={2}>
					{formData.skills.map((skill, index: number) => (
						<Grid container spacing={2} key={index} alignItems="center">
							<Grid size={{ xs: 12, md: 6 }}>
								<Autocomplete
									freeSolo
									options={commonSkills}
									value={skill.name}
									onChange={(_e, val) => onSkillChange(index, 'name', val || '')}
									onInputChange={(_e, val) => onSkillChange(index, 'name', val)}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Skill Name"
											size="small"
											fullWidth
											required
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
										/>
									)}
								/>
							</Grid>
							<Grid size={{ xs: 10, md: 5 }}>
								<FormControl fullWidth size="small">
									<InputLabel>Level</InputLabel>
									<Select
										value={skill.level}
										label="Level"
										onChange={(e) => onSkillChange(index, 'level', e.target.value as string)}
										sx={{ borderRadius: '2px' }}
									>
										<MenuItem value="Beginner">Beginner</MenuItem>
										<MenuItem value="Intermediate">Intermediate</MenuItem>
										<MenuItem value="Advanced">Advanced</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid size={{ xs: 2, md: 1 }}>
								<IconButton color="error" size="small" onClick={() => onRemoveSkill(index)}>
									<Delete fontSize="small" />
								</IconButton>
							</Grid>
						</Grid>
					))}
				</Stack>
			) : (
				<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
					No skills added yet. Click 'Add Skill' to start assessment.
				</Typography>
			)}
		</Paper>
	);
};

export default SkillAssessmentTab;
