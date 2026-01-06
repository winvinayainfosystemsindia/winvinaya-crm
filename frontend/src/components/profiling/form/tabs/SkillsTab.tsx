import React from 'react';
import {
	Box,
	Typography,
	Stack,
	FormLabel,
	Autocomplete,
	TextField,
	Chip
} from '@mui/material';

interface SkillsTabProps {
	formData: any;
	onUpdateField: (section: string, field: string, value: any) => void;
	commonSkills: string[];
}

const SkillsTab: React.FC<SkillsTabProps> = ({
	formData,
	onUpdateField,
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

	return (
		<Box sx={awsPanelStyle}>
			<Typography sx={sectionTitleStyle}>Skill Assessment</Typography>
			<Stack spacing={4}>
				<Box>
					<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500, mb: 1, display: 'block' }}>
						Technical Skills
					</FormLabel>
					<Autocomplete
						multiple
						freeSolo
						options={commonSkills}
						value={formData.skills?.technical_skills || []}
						onChange={(_e, newValue) => onUpdateField('skills', 'technical_skills', newValue)}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									variant="outlined"
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ borderRadius: '2px' }}
								/>
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="Type a technical skill and press Enter"
								size="small"
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								inputProps={{
									...params.inputProps,
									'aria-label': 'Type a technical skill and press Enter to add'
								}}
							/>
						)}
					/>
				</Box>

				<Box>
					<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500, mb: 1, display: 'block' }}>
						Additional Skills/Soft Skills
					</FormLabel>
					<Autocomplete
						multiple
						freeSolo
						options={['Communication', 'Teamwork', 'Punctuality', 'Problem Solving']}
						value={formData.skills?.soft_skills || []}
						onChange={(_e, newValue) => onUpdateField('skills', 'soft_skills', newValue)}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									variant="outlined"
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ borderRadius: '2px' }}
								/>
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="Type a soft skill and press Enter"
								size="small"
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								inputProps={{
									...params.inputProps,
									'aria-label': 'Type a soft skill and press Enter to add'
								}}
							/>
						)}
					/>
				</Box>
			</Stack>
		</Box>
	);
};

export default SkillsTab;
