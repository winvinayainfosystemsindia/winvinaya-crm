import React, { memo } from 'react';
import {
	Stack,
	Box,
	Typography,
	Grid,
	Paper,
	Button,
	IconButton,
	Rating,
	TextField,
	MenuItem
} from '@mui/material';
import { 
	Add as AddIcon,
	DeleteOutline as DeleteIcon,
	Psychology as SkillIcon
} from '@mui/icons-material';
import SkillDropdown from '../../../../common/SkillDropdown';
import { type AnalysisSkill } from '../../../../../models/CandidateAnalysis';

interface CompetencyMappingTabProps {
	skills: AnalysisSkill[];
	handleAddSkill: () => void;
	handleRemoveSkill: (idx: number) => void;
	handleSkillChange: (idx: number, field: keyof AnalysisSkill, val: any) => void;
	viewMode: boolean;
}

const CompetencyMappingTab: React.FC<CompetencyMappingTabProps> = memo(({
	skills,
	handleAddSkill,
	handleRemoveSkill,
	handleSkillChange,
	viewMode
}) => {
	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: 1.5,
			bgcolor: 'background.paper',
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.secondary' }
		}
	};

	return (
		<Stack spacing={4} sx={{ maxWidth: 900, mx: 'auto' }}>
			<Box>
				<Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
						<Stack direction="row" alignItems="center" spacing={1.5}>
							<SkillIcon color="action" />
							<Typography variant="h6">
								Competency Proficiency Mapping
							</Typography>
						</Stack>
						{!viewMode && (
							<Button
								variant="outlined"
								size="small"
								startIcon={<AddIcon />}
								onClick={handleAddSkill}
								sx={{ borderRadius: 1.5 }}
							>
								Add Skill
							</Button>
						)}
					</Box>

					{skills.length > 0 ? (
						<Stack spacing={2.5}>
							{skills.map((s, idx) => (
								<Paper key={idx} elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 1.5, position: 'relative', bgcolor: 'background.paper' }}>
									{!viewMode && (
										<IconButton
											size="small"
											onClick={() => handleRemoveSkill(idx)}
											sx={{ position: 'absolute', top: 12, right: 12, color: 'error.main' }}
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									)}
									<Grid container spacing={3} alignItems="center">
										{/* Skill Drodown */}
										<Grid size={{ xs: 12, sm: 5 }}>
											<SkillDropdown
												value={s.skill}
												onChange={(v) => handleSkillChange(idx, 'skill', v)}
												disabled={viewMode}
												label="Competency / Skill Area"
												placeholder="Search or type..."
											/>
										</Grid>
										{/* Proficiency Select */}
										<Grid size={{ xs: 12, sm: 4 }}>
											<TextField
												select
												fullWidth
												size="small"
												label="Proficiency Level"
												value={s.level || 'Beginner'}
												onChange={(e) => handleSkillChange(idx, 'level', e.target.value)}
												disabled={viewMode}
												sx={inputSx}
											>
												<MenuItem value="Beginner">Beginner</MenuItem>
												<MenuItem value="Intermediate">Intermediate</MenuItem>
												<MenuItem value="Expert">Expert</MenuItem>
											</TextField>
										</Grid>
										{/* Skill Rating */}
										<Grid size={{ xs: 12, sm: 3 }}>
											<Box sx={{ textAlign: 'center' }}>
												<Typography variant="subtitle2" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
													Skill Score ({s.rating}/10)
												</Typography>
												<Rating
													max={10}
													value={s.rating}
													onChange={(_, v) => !viewMode && handleSkillChange(idx, 'rating', v || 0)}
													disabled={viewMode}
													size="small"
													sx={{ color: 'primary.main' }}
												/>
											</Box>
										</Grid>
									</Grid>
								</Paper>
							))}
						</Stack>
					) : (
						<Box sx={{ py: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
							<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
								No skills evaluated yet for this analysis session.
							</Typography>
						</Box>
					)}
				</Paper>
			</Box>
		</Stack>
	);
});

CompetencyMappingTab.displayName = 'CompetencyMappingTab';

export default memo(CompetencyMappingTab);
