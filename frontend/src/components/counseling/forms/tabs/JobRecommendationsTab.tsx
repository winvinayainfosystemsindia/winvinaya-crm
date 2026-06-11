import React from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	Tooltip,
	useTheme,
	alpha,
	CircularProgress,
	Paper
} from '@mui/material';
import { 
	StarOutline as FeedbackIcon,
	GpsFixed as GoalIcon,
	AutoAwesome as AIIcon,
	AutoFixHigh as PolishIcon
} from '@mui/icons-material';
import JobRoleSearch from '../../../common/JobRoleSearch';
import type { CandidateCounselingCreate } from '../../../../models/candidate';
import aiService from '../../../../services/aiService';
import useToast from '../../../../hooks/useToast';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { fetchJobRoles } from '../../../../store/slices/jobRoleSlice';
import RichTextEditor from '../../../common/RichTextEditor';

interface JobRecommendationsTabProps {
	formData: CandidateCounselingCreate;
	onFeedbackChange: (value: string) => void;
	onJobRolesChange: (roles: string[]) => void;
}

const JobRecommendationsTab: React.FC<JobRecommendationsTabProps> = ({
	formData,
	onFeedbackChange,
	onJobRolesChange
}) => {
	const theme = useTheme();
	const toast = useToast();
	const dispatch = useAppDispatch();
	const [loadingAI, setLoadingAI] = React.useState(false);
	const [recommendingRoles, setRecommendingRoles] = React.useState(false);

	const { list: jobRoles } = useAppSelector((state) => state.jobRoles);

	React.useEffect(() => {
		if (jobRoles.length === 0) {
			dispatch(fetchJobRoles({ status: 'active', limit: 200, skip: 0 }));
		}
	}, [dispatch, jobRoles.length]);

	const handleAIAssistFeedback = async (action: 'enhance' | 'generate') => {
		if (action === 'enhance') {
			const cleanText = (formData.feedback || '').replace(/<[^>]*>/g, '').trim();
			if (!cleanText) {
				toast.error('Please enter some draft summary details first so AI can polish it.');
				return;
			}
		}

		setLoadingAI(true);
		try {
			const formattedSkills = (formData.skills || []).map(s => ({
				skill: s.name,
				level: s.level
			}));

			const result = await aiService.enhanceFeedback({
				feedback_type: 'counseling summary',
				current_text: formData.feedback || '',
				skills: formattedSkills,
				questions: formData.questions || [],
				action
			});

			if (result?.enhanced_text) {
				onFeedbackChange(result.enhanced_text);
				toast.success(`Clinical summary successfully ${action === 'enhance' ? 'polished' : 'generated'} by AI!`);
			} else {
				toast.error('Failed to get enhanced feedback from AI.');
			}
		} catch (err: any) {
			toast.error(err?.response?.data?.detail || err?.message || 'AI assistant failed.');
		} finally {
			setLoadingAI(false);
		}
	};

	const handleRecommendJobRoles = () => {
		if (!formData.skills || formData.skills.length === 0) {
			toast.info('Please assess the candidate skills in the "Skills Assessment" tab first to get job recommendations.');
			return;
		}

		setRecommendingRoles(true);
		try {
			const candidateSkillNames = formData.skills.map(s => s.name?.toLowerCase().trim()).filter(Boolean);
			
			if (candidateSkillNames.length === 0) {
				toast.info('Please assess the candidate skills in the "Skills Assessment" tab first.');
				return;
			}

			// Map match scores for each active job role
			const scoredJobs = jobRoles
				.map((job: any) => {
					const jobSkills = (job.requirements?.skills || []).map((s: string) => s.toLowerCase().trim());
					const matchingSkillsCount = jobSkills.filter((s: string) => candidateSkillNames.includes(s)).length;
					
					// Calculate a matching ratio/percentage
					const score = jobSkills.length > 0 ? (matchingSkillsCount / jobSkills.length) : 0;
					
					return {
						jobTitle: job.title,
						matchingSkillsCount,
						score
					};
				})
				// Only recommend jobs with at least one matching skill
				.filter(item => item.matchingSkillsCount > 0)
				// Sort by score first, then number of matching skills
				.sort((a, b) => b.score - a.score || b.matchingSkillsCount - a.matchingSkillsCount);

			if (scoredJobs.length === 0) {
				toast.warning('No active job roles match the candidate assessed skills.');
				return;
			}

			// Extract top job titles
			const topJobs = scoredJobs.slice(0, 3).map(item => item.jobTitle);
			
			// Merge with existing job roles
			const existingRoles = formData.suitable_job_roles || [];
			const mergedRoles = Array.from(new Set([...existingRoles, ...topJobs]));

			const addedCount = mergedRoles.length - existingRoles.length;
			if (addedCount > 0) {
				onJobRolesChange(mergedRoles);
				toast.success(`AI suggested and added ${addedCount} matching job role(s): ${topJobs.join(', ')}`);
			} else {
				toast.info(`AI suggestions matched existing selections: ${topJobs.join(', ')}`);
			}
		} catch (error: any) {
			toast.error('Failed to generate job suggestions.');
		} finally {
			setRecommendingRoles(false);
		}
	};

	return (
		<Stack spacing={4}>
			{/* Placement Strategy Section */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
						<FeedbackIcon sx={{ color: 'common.white', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Placement Strategy & Recommendations</Typography>
				</Stack>

				<Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.04), p: 2, borderRadius: 0.5, mb: 4, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1) }}>
					<Stack direction="row" spacing={2} alignItems="center">
						<GoalIcon sx={{ color: 'success.main' }} />
						<Box>
							<Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 700 }}>Outcome Strategy</Typography>
							<Typography variant="caption" color="text.secondary">
								Identify suitable job roles and provide actionable feedback to ensure successful candidate placement.
							</Typography>
						</Box>
					</Stack>
				</Box>

				<Stack spacing={4}>
					{/* Integrated Job Search Component */}
					<Box>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
							<Button
								variant="outlined"
								color="secondary"
								size="small"
								startIcon={<AIIcon sx={{ fontSize: 13 }} />}
								onClick={handleRecommendJobRoles}
								disabled={recommendingRoles}
								sx={{
									borderRadius: 0.5,
									textTransform: 'none',
									fontWeight: 700,
									py: 0.5,
									px: 1.5,
									fontSize: '0.72rem',
									'&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) }
								}}
							>
								{recommendingRoles ? 'AI Finding Roles...' : 'AI Recommend Roles'}
							</Button>
						</Box>
						<JobRoleSearch
							value={formData.suitable_job_roles || []}
							onChange={onJobRolesChange}
						/>
					</Box>

					<Divider />

					<Box>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
							<Typography variant="awsFieldLabel" sx={{ mb: 0 }}>Clinical Summary & Recommended Next Steps</Typography>
							<Stack direction="row" spacing={1} alignItems="center">
								{loadingAI ? (
									<Stack direction="row" spacing={0.5} alignItems="center">
										<CircularProgress size={12} sx={{ color: 'secondary.main' }} />
										<Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'secondary.main', fontWeight: 700 }}>
											AI Working...
										</Typography>
									</Stack>
								) : (
									<>
										<Tooltip title="Generate suggested clinical summary using AI" arrow>
											<Button
												size="small"
												variant="text"
												onClick={() => handleAIAssistFeedback('generate')}
												startIcon={<AIIcon sx={{ fontSize: '13px !important' }} />}
												sx={{
													fontSize: '0.7rem',
													textTransform: 'none',
													py: 0.2,
													px: 1,
													borderRadius: 1.5,
													fontWeight: 700,
													color: 'primary.main',
													'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
												}}
											>
												AI Suggest
											</Button>
										</Tooltip>
										<Tooltip title="Enhance and polish spelling/grammar using AI" arrow>
											<Button
												size="small"
												variant="text"
												onClick={() => handleAIAssistFeedback('enhance')}
												startIcon={<PolishIcon sx={{ fontSize: '13px !important' }} />}
												sx={{
													fontSize: '0.7rem',
													textTransform: 'none',
													py: 0.2,
													px: 1,
													borderRadius: 1.5,
													fontWeight: 700,
													color: 'secondary.main',
													'&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) }
												}}
											>
												AI Polish
											</Button>
										</Tooltip>
									</>
								)}
							</Stack>
						</Box>
						<RichTextEditor
							placeholder="Write a comprehensive clinical summary including training recommendations and placement pipeline alignment..."
							value={formData.feedback || ''}
							onChange={onFeedbackChange}
							themeColor={theme.palette.primary.main}
						/>
					</Box>
				</Stack>
			</Paper>
		</Stack>
	);
};

export default JobRecommendationsTab;
