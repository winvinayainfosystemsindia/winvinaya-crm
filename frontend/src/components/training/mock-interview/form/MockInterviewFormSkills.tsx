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
	Slider,
	useTheme,
	alpha
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Psychology as SkillIcon
} from '@mui/icons-material';
import { type Skill } from '../../../../models/MockInterview';

interface MockInterviewFormSkillsProps {
	skills: Skill[];
	viewMode: boolean;
	onSkillChange: (index: number, field: keyof Skill, value: any) => void;
	onAddSkill: () => void;
	onRemoveSkill: (index: number) => void;
}

const MockInterviewFormSkills: React.FC<MockInterviewFormSkillsProps> = memo(({
	skills,
	viewMode,
	onSkillChange,
	onAddSkill,
	onRemoveSkill
}) => {
	const theme = useTheme();

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Box 
						sx={{ 
							p: 1.25, 
							bgcolor: alpha(theme.palette.success.main, 0.08), 
							borderRadius: 2, 
							display: 'flex',
							color: 'success.main'
						}}
					>
						<SkillIcon />
					</Box>
					<Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
						Competency Proficiency Matrix
					</Typography>
				</Stack>
				{!viewMode && (
					<Button
						startIcon={<AddIcon />}
						onClick={onAddSkill}
						sx={{ 
							textTransform: 'none', 
							fontWeight: 700, 
							color: 'success.main',
							borderRadius: 1.5,
							'&:hover': { bgcolor: alpha(theme.palette.success.main, 0.05) }
						}}
					>
						Add Competency
					</Button>
				)}
			</Box>
			<Grid container spacing={3}>
				{skills.map((s, idx) => (
					<Grid size={{ xs: 12, sm: 6 }} key={idx}>
						<Paper 
							elevation={0}
							sx={{ 
								p: 3, 
								borderRadius: 2, 
								bgcolor: 'background.paper', 
								position: 'relative',
								border: '1px solid',
								borderColor: 'divider',
								'&:hover': {
									borderColor: alpha(theme.palette.success.main, 0.2),
									boxShadow: theme.shadows[2]
								}
							}}
						>
							{!viewMode && (
								<IconButton
									size="small"
									onClick={() => onRemoveSkill(idx)}
									sx={{ 
										position: 'absolute', 
										right: 12, 
										top: 12, 
										opacity: 0.4,
										'&:hover': { opacity: 1, color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05) } 
									}}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							)}
							<Stack spacing={2.5}>
								<TextField
									label="Competency / Skill Area"
									value={s.skill}
									onChange={(e) => onSkillChange(idx, 'skill', e.target.value)}
									fullWidth
									size="small"
									disabled={viewMode}
									placeholder="e.g. System Design, React, Python"
									InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
								/>
								<Stack direction="row" spacing={2} alignItems="center">
									<TextField
										select
										label="Proficiency Level"
										value={s.level}
										onChange={(e) => onSkillChange(idx, 'level', e.target.value)}
										fullWidth
										size="small"
										disabled={viewMode}
										InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
									>
										<MenuItem value="Beginner">Beginner</MenuItem>
										<MenuItem value="Intermediate">Intermediate</MenuItem>
										<MenuItem value="Expert">Expert</MenuItem>
									</TextField>
									<Box sx={{ minWidth: 70, textAlign: 'right' }}>
										<Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main', lineHeight: 1 }}>
											{s.rating}
											<Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 700, opacity: 0.5 }}>/10</Typography>
										</Typography>
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
									sx={{ 
										color: 'success.main',
										'& .MuiSlider-thumb': {
											'&:hover, &.Mui-focusVisible': {
												boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.success.main, 0.16)}`,
											},
										},
									}}
								/>
							</Stack>
						</Paper>
					</Grid>
				))}
				{skills.length === 0 && (
					<Grid size={{ xs: 12 }}>
						<Box 
							sx={{ 
								py: 4, 
								textAlign: 'center', 
								borderRadius: 2, 
								border: '2px dashed',
								borderColor: 'divider',
								bgcolor: alpha(theme.palette.action.disabledBackground, 0.02)
							}}
						>
							<Typography variant="body2" color="text.disabled" sx={{ fontWeight: 500 }}>
								No competencies assessed yet.
							</Typography>
						</Box>
					</Grid>
				)}
			</Grid>
		</Box>
	);
});

MockInterviewFormSkills.displayName = 'MockInterviewFormSkills';

export default MockInterviewFormSkills;

