import React from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	Grid,
	FormControl,
	Select,
	MenuItem,
	IconButton,
	Paper,
	useTheme,
	alpha,
	Chip,
	LinearProgress
} from '@mui/material';
import { 
	Add as AddIcon, 
	DeleteOutline as DeleteIcon, 
	Psychology as SkillIcon,
	EmojiEvents as ProficiencyIcon,
	CheckCircleOutline as VerifiedIcon,
	AutoAwesome as AIIcon
} from '@mui/icons-material';
import type { CandidateCounselingCreate, CounselingSkill } from '../../../../models/candidate';
import SkillDropdown from '../../../common/SkillDropdown';
import aiService from '../../../../services/aiService';
import useToast from '../../../../hooks/useToast';

interface SkillAssessmentTabProps {
	formData: CandidateCounselingCreate;
	onAddSkill: () => void;
	onRemoveSkill: (index: number) => void;
	onSkillChange: (index: number, field: string, value: string) => void;
	onSkillsAutoPopulate: (skills: any[]) => void;
}

const SkillAssessmentTab: React.FC<SkillAssessmentTabProps> = ({
	formData,
	onAddSkill,
	onRemoveSkill,
	onSkillChange,
	onSkillsAutoPopulate
}) => {
	const theme = useTheme();
	const toast = useToast();
	const [analyzing, setAnalyzing] = React.useState(false);

	const handleAnalyzeQA = async () => {
		const validQA = (formData.questions || []).filter(
			q => q.question && q.question.trim() !== '' && q.answer && q.answer.trim() !== ''
		);
		if (validQA.length === 0) {
			toast.info('Please enter interview questions and responses in the "Interview & Feedback" tab first.');
			return;
		}

		setAnalyzing(true);
		try {
			const result = await aiService.analyzeCounselingQA(
				validQA.map(q => ({ question: q.question || '', answer: q.answer || '' }))
			);
			
			if (result.skills && result.skills.length > 0) {
				const mappedSkills = result.skills.map(s => ({
					name: s.name,
					level: s.level as 'Beginner' | 'Intermediate' | 'Advanced'
				}));
				onSkillsAutoPopulate(mappedSkills);
				toast.success(`AI evaluated responses and mapped ${result.skills.length} skills/competencies!`);
			} else {
				toast.warning('AI did not identify specific skills from the Q&A text. Please ensure candidate responses contain specific skill details.');
			}
		} catch (error: any) {
			toast.error(error?.response?.data?.detail || error?.message || 'Q&A analysis failed.');
		} finally {
			setAnalyzing(false);
		}
	};

	const getProficiencyColor = (level: CounselingSkill['level']) => {
		switch (level) {
			case 'Advanced': return 'success.main';
			case 'Intermediate': return 'info.main';
			default: return 'warning.main';
		}
	};

	const getProficiencyValue = (level: CounselingSkill['level']) => {
		switch (level) {
			case 'Advanced': return 100;
			case 'Intermediate': return 65;
			default: return 35;
		}
	};

	return (
		<Stack spacing={4}>
			{/* Outcome Header & Summary Card */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
							<SkillIcon sx={{ color: 'common.white', fontSize: 20 }} />
						</Box>
						<Typography variant="awsSectionTitle">Competency Outcome Matrix</Typography>
					</Stack>
					<Stack direction="row" spacing={1.5}>
						<Button
							variant="outlined"
							color="secondary"
							size="small"
							startIcon={<AIIcon sx={{ fontSize: 14 }} />}
							onClick={handleAnalyzeQA}
							disabled={analyzing}
							sx={{
								borderRadius: 0.5,
								textTransform: 'none',
								fontWeight: 700,
								'&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) }
							}}
						>
							{analyzing ? 'Analyzing Answers...' : 'AI Analyze Answers'}
						</Button>
						<Button
							variant="contained"
							size="small"
							startIcon={<AddIcon />}
							onClick={onAddSkill}
							sx={{
								borderRadius: 0.5,
								textTransform: 'none',
								boxShadow: 'none',
								'&:hover': { boxShadow: 'none', bgcolor: 'primary.dark' }
							}}
						>
							Record Competency
						</Button>
					</Stack>
				</Box>

				<Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04), p: 2, borderRadius: 0.5, mb: 3 }}>
					<Stack direction="row" spacing={2} alignItems="center">
						<VerifiedIcon sx={{ color: 'primary.main' }} />
						<Box>
							<Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700 }}>Outcome Goal</Typography>
							<Typography variant="caption" color="text.secondary">
								Assess at least 3 core competencies to determine placement readiness and training gaps.
							</Typography>
						</Box>
					</Stack>
				</Box>

				<Divider sx={{ mb: 4 }} />

				{formData.skills && formData.skills.length > 0 ? (
					<Stack spacing={4}>
						{formData.skills.map((skill, index: number) => (
							<Paper 
								key={index} 
								elevation={0} 
								variant="outlined"
								sx={{ 
									p: 3, 
									borderRadius: 0.5, 
									position: 'relative',
									'&:hover': { borderColor: 'primary.main' }
								}}
							>
								<IconButton 
									size="small"
									onClick={() => onRemoveSkill(index)}
									sx={{ 
										position: 'absolute', 
										top: 8, 
										right: 8,
										color: 'error.main',
										'&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
									}}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>

								<Grid container spacing={4}>
									<Grid size={{ xs: 12, md: 6 }}>
										<Box>
											<Typography variant="awsFieldLabel">Competency / Skill</Typography>
											<SkillDropdown
												value={skill.name}
												onChange={(newValue) => onSkillChange(index, 'name', newValue)}
												placeholder="e.g. Technical Support, Data Entry"
												label=""
												size="small"
											/>
										</Box>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<Box>
											<Typography variant="awsFieldLabel">Proficiency Outcome</Typography>
											<FormControl fullWidth size="small">
												<Select
													value={skill.level || 'Beginner'}
													onChange={(e) => onSkillChange(index, 'level', e.target.value as any)}
													sx={{
														borderRadius: 0.5,
														bgcolor: 'background.paper',
														'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
														'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
														'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
													}}
													renderValue={(selected) => {
														const level = selected || 'Beginner';
														return (
															<Stack direction="row" spacing={1} alignItems="center">
																<Chip 
																	label={level} 
																	size="small" 
																	sx={{ 
																		bgcolor: alpha(theme.palette[getProficiencyColor(level) === 'success.main' ? 'success' : getProficiencyColor(level) === 'info.main' ? 'info' : 'warning'].main, 0.1),
																		color: getProficiencyColor(level),
																		fontWeight: 700,
																		borderRadius: 0.5
																	}} 
																/>
															</Stack>
														);
													}}
												>
													<MenuItem value="Beginner">
														<Stack sx={{ py: 0.5 }}>
															<Typography variant="body2" sx={{ fontWeight: 600 }}>Beginner</Typography>
															<Typography variant="caption" color="text.secondary">Fundamental understanding; needs guidance.</Typography>
														</Stack>
													</MenuItem>
													<MenuItem value="Intermediate">
														<Stack sx={{ py: 0.5 }}>
															<Typography variant="body2" sx={{ fontWeight: 600 }}>Intermediate</Typography>
															<Typography variant="caption" color="text.secondary">Practical application; independent for common tasks.</Typography>
														</Stack>
													</MenuItem>
													<MenuItem value="Advanced">
														<Stack sx={{ py: 0.5 }}>
															<Typography variant="body2" sx={{ fontWeight: 600 }}>Advanced</Typography>
															<Typography variant="caption" color="text.secondary">In-depth expertise; can mentor others.</Typography>
														</Stack>
													</MenuItem>
												</Select>
											</FormControl>
										</Box>
										
										{/* Proficiency Indicator */}
										<Box sx={{ mt: 2 }}>
											{(() => {
												const level = skill.level || 'Beginner';
												return (
													<>
														<Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
															<Typography variant="caption" color="text.secondary">Outcome Rating</Typography>
															<Typography variant="caption" sx={{ fontWeight: 700, color: getProficiencyColor(level) }}>
																{getProficiencyValue(level)}%
															</Typography>
														</Stack>
														<LinearProgress 
															variant="determinate" 
															value={getProficiencyValue(level)} 
															sx={{ 
																height: 4, 
																borderRadius: 2,
																bgcolor: alpha(theme.palette.divider, 0.5),
																'& .MuiLinearProgress-bar': {
																	bgcolor: getProficiencyColor(level),
																	borderRadius: 2
																}
															}}
														/>
													</>
												);
											})()}
										</Box>
									</Grid>
								</Grid>
							</Paper>
						))}
					</Stack>
				) : (
					<Box sx={{ 
						py: 8, 
						textAlign: 'center', 
						border: '1px dashed', 
						borderColor: 'divider', 
						borderRadius: 0.5, 
						bgcolor: 'background.default' 
					}}>
						<ProficiencyIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
						<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
							No competencies recorded.
						</Typography>
						<Typography variant="caption" color="text.disabled">
							Outcome based assessments require documenting core skills and proficiency levels.
						</Typography>
					</Box>
				)}
			</Paper>
		</Stack>
	);
};

export default SkillAssessmentTab;
