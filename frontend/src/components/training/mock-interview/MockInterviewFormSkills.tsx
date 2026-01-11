import React, { memo } from 'react';
import {
	Box,
	Stack,
	Paper,
	Typography,
	Button,
	IconButton,
	TextField,
	Grid,
	MenuItem,
	Slider
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Psychology as SkillIcon
} from '@mui/icons-material';
import { type Skill } from '../../../models/MockInterview';

interface MockInterviewFormSkillsProps {
	skills: Skill[];
	viewMode: boolean;
	onSkillChange: (index: number, field: keyof Skill, value: any) => void;
	onAddSkill: () => void;
	onRemoveSkill: (index: number) => void;
	PRIMARY_BLUE: string;
}

const MockInterviewFormSkills: React.FC<MockInterviewFormSkillsProps> = memo(({
	skills,
	viewMode,
	onSkillChange,
	onAddSkill,
	onRemoveSkill,
	PRIMARY_BLUE
}) => {
	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<Box sx={{ p: 1, bgcolor: '#ecf3f3', borderRadius: '4px', display: 'flex' }}>
						<SkillIcon sx={{ color: '#007eb9' }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>Skills Proficiency Matrix</Typography>
				</Stack>
				{!viewMode && (
					<Button
						startIcon={<AddIcon />}
						onClick={onAddSkill}
						sx={{ textTransform: 'none', fontWeight: 600, color: PRIMARY_BLUE }}
					>
						Add Skill
					</Button>
				)}
			</Box>
			<Grid container spacing={3}>
				{skills.map((s, idx) => (
					<Grid size={{ xs: 12, sm: 6 }} key={idx}>
						<Paper variant="outlined" sx={{ p: 2.5, borderRadius: '4px', bgcolor: 'white', position: 'relative' }}>
							{!viewMode && (
								<IconButton
									size="small"
									onClick={() => onRemoveSkill(idx)}
									sx={{ position: 'absolute', right: 8, top: 8, opacity: 0.4 }}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							)}
							<Stack spacing={2}>
								<TextField
									label="Competency / Skill"
									value={s.skill}
									onChange={(e) => onSkillChange(idx, 'skill', e.target.value)}
									fullWidth
									size="small"
									disabled={viewMode}
									placeholder="e.g. React, Python, Data Struct"
									InputLabelProps={{ shrink: true }}
								/>
								<Stack direction="row" spacing={2} alignItems="flex-end">
									<TextField
										select
										label="Level"
										value={s.level}
										onChange={(e) => onSkillChange(idx, 'level', e.target.value)}
										fullWidth
										size="small"
										disabled={viewMode}
										InputLabelProps={{ shrink: true }}
									>
										<MenuItem value="Beginner">Beginner</MenuItem>
										<MenuItem value="Intermediate">Intermediate</MenuItem>
										<MenuItem value="Expert">Expert</MenuItem>
									</TextField>
									<Box sx={{ minWidth: 80, textAlign: 'right' }}>
										<Typography variant="overline" color="text.secondary">Score</Typography>
										<Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY_BLUE }}>{s.rating}/10</Typography>
									</Box>
								</Stack>
								<Slider
									value={s.rating}
									min={0}
									max={10}
									step={1}
									size="small"
									onChange={(_, v) => onSkillChange(idx, 'rating', v)}
									disabled={viewMode}
									sx={{ color: PRIMARY_BLUE }}
								/>
							</Stack>
						</Paper>
					</Grid>
				))}
			</Grid>
		</Box>
	);
});

MockInterviewFormSkills.displayName = 'MockInterviewFormSkills';

export default MockInterviewFormSkills;

