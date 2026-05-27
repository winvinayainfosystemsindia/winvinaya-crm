import React from 'react';
import {
	Box,
	Typography,
	Stack,
	Chip,
	Paper
} from '@mui/material';
import {
	Build as BuildIcon,
	EmojiEvents as SoftSkillIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import SkillDropdown from '../../../common/SkillDropdown';

interface SkillsTabProps {
	formData: any;
	onUpdateField: (section: string, field: string, value: any) => void;
}

const SkillsTab: React.FC<SkillsTabProps> = ({
	formData,
	onUpdateField
}) => {
	const { awsPanel } = awsStyles;

	return (
		<Stack spacing={4}>
			{/* Technical Skills Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<BuildIcon sx={{ color: 'common.white', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Technical Skills</Typography>
				</Stack>
				
				<Box>
					<SkillDropdown
						multiple
						value={formData.skills?.technical_skills || []}
						onChange={(newValue) => onUpdateField('skills', 'technical_skills', newValue)}
						label="Core Proficiencies"
						placeholder="Select or type technical skills..."
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ 
										borderRadius: '2px',
										bgcolor: 'rgba(0, 126, 185, 0.06)',
										border: '1px solid',
										borderColor: 'info.main',
										color: 'info.main',
										fontWeight: 600,
										px: 0.5
									}}
								/>
							))
						}
					/>
					<Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
						Add primary technical capabilities relevant for role mapping.
					</Typography>
				</Box>
			</Paper>

			{/* Soft Skills Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<SoftSkillIcon sx={{ color: 'common.white', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Additional & Soft Skills</Typography>
				</Stack>

				<Box>
					<SkillDropdown
						multiple
						value={formData.skills?.soft_skills || []}
						onChange={(newValue) => onUpdateField('skills', 'soft_skills', newValue)}
						label="Professional Attributes"
						placeholder="Select or type professional attributes..."
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ 
										borderRadius: '2px',
										bgcolor: 'rgba(16, 185, 129, 0.06)',
										border: '1px solid',
										borderColor: 'success.main',
										color: 'success.main',
										fontWeight: 600,
										px: 0.5
									}}
								/>
							))
						}
					/>
					<Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
						Document behavioral strengths and workplace-ready attributes.
					</Typography>
				</Box>
			</Paper>
		</Stack>
	);
};

export default SkillsTab;
