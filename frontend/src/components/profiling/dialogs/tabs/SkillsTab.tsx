import React from 'react';
import {
	Box,
	Typography,
	Stack,
	Autocomplete,
	TextField,
	Chip,
	Paper
} from '@mui/material';
import {
	Build as BuildIcon,
	EmojiEvents as SoftSkillIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';

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
	const { sectionTitle, awsPanel, fieldLabel } = awsStyles;

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
		<Stack spacing={4}>
			{/* Technical Skills Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<BuildIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Technical Skills</Typography>
				</Stack>

				<Box sx={{ mb: 1 }}>
					<Typography sx={fieldLabel}>Core Proficiencies</Typography>
					<Autocomplete
						multiple
						freeSolo
						options={commonSkills}
						value={formData.skills?.technical_skills || []}
						onChange={(_e, newValue) => onUpdateField('skills', 'technical_skills', newValue)}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ 
										borderRadius: '2px',
										bgcolor: '#f1faff',
										border: '1px solid #007eb9',
										color: '#007eb9',
										fontWeight: 600
									}}
								/>
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="Type a skill (e.g. Python, SQL) and press Enter"
								size="small"
								sx={inputSx}
							/>
						)}
					/>
				</Box>
			</Paper>

			{/* Soft Skills Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<SoftSkillIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Additional & Soft Skills</Typography>
				</Stack>

				<Box sx={{ mb: 1 }}>
					<Typography sx={fieldLabel}>Professional Attributes</Typography>
					<Autocomplete
						multiple
						freeSolo
						options={['Communication', 'Teamwork', 'Punctuality', 'Problem Solving', 'Leadership']}
						value={formData.skills?.soft_skills || []}
						onChange={(_e, newValue) => onUpdateField('skills', 'soft_skills', newValue)}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ 
										borderRadius: '2px',
										bgcolor: '#fafffe',
										border: '1px solid #1d8102',
										color: '#1d8102',
										fontWeight: 600
									}}
								/>
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="Type a soft skill (e.g. Communication) and press Enter"
								size="small"
								sx={inputSx}
							/>
						)}
					/>
				</Box>
			</Paper>
		</Stack>
	);
};

export default SkillsTab;
