import React from 'react';
import { Paper, Grid, Typography, Chip, Box, Stack, Divider, useTheme, alpha } from '@mui/material';
import {
	Psychology as PsychologyIcon,
	Pending as PendingIcon,
	Feedback as FeedbackIcon,
	HistoryEdu as SkillsIcon,
	Event as EventIcon,
	RecordVoiceOver as CounselorIcon,
	AssignmentTurnedIn as StatusIcon,
	QuestionAnswer as QuestionIcon,
	Work as WorkIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { InfoRow, SectionHeader, SectionCard } from '../DetailedViewCommon';
import type { Candidate } from '../../../../models/candidate';

interface CounselingTabProps {
	candidate: Candidate;
}

const CounselingTab: React.FC<CounselingTabProps> = ({ candidate }) => {
	const theme = useTheme();
	const { counseling } = candidate;

	return (
		<SectionCard>
			<SectionHeader title="Career Counseling Details" icon={<PsychologyIcon />}>
				{counseling ? (
					<Chip
						label={counseling.status.toUpperCase()}
						color={counseling.status === 'selected' ? 'success' : counseling.status === 'rejected' ? 'error' : 'warning'}
						size="small"
						sx={{ fontWeight: 700, borderRadius: 1 }}
					/>
				) : (
					<Chip icon={<PendingIcon />} label="No Record" variant="outlined" size="small" />
				)}
			</SectionHeader>

			{counseling ? (
				<Grid container spacing={4}>
					<Grid size={{ xs: 12, md: 7 }}>
						<Box sx={{ mb: 4 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<FeedbackIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Counselor Feedback
								</Typography>
							</Box>
							<Paper
								elevation={0}
								sx={{
									p: 2.5,
									bgcolor: alpha(theme.palette.background.default, 0.5),
									border: '1px solid',
									borderColor: 'divider',
									borderRadius: 1,
									position: 'relative',
									'&::before': {
										content: '""',
										position: 'absolute',
										left: 0,
										top: 0,
										bottom: 0,
										width: 4,
										bgcolor: 'primary.main',
										borderRadius: '4px 0 0 4px'
									}
								}}
							>
								<Typography variant="body2" sx={{ fontStyle: typeof counseling.feedback === 'string' && counseling.feedback ? 'normal' : 'italic', color: 'text.primary', lineHeight: 1.6 }}>
									{typeof counseling.feedback === 'string' ? (counseling.feedback || 'No detailed feedback provided.') : 'No detailed feedback provided.'}
								</Typography>
							</Paper>
						</Box>

						<Box sx={{ mb: 4 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<QuestionIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Assessment Questions
								</Typography>
							</Box>
							<Stack spacing={2.5}>
								{counseling.questions && counseling.questions.length > 0 ? (
									counseling.questions.map((q, idx) => (
										<Box key={idx} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 700,
													color: 'text.secondary',
													mb: 0.75,
													fontSize: '0.85rem',
													textTransform: 'uppercase',
													letterSpacing: '0.025em'
												}}
											>
												Q: {q.question}
											</Typography>
											<Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
												{q.answer || 'No answer provided.'}
											</Typography>
										</Box>
									))
								) : (
									<Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
										No assessment questions recorded.
									</Typography>
								)}
							</Stack>
						</Box>

						<Box sx={{ mb: 4 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<SkillsIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Identified Skills
								</Typography>
							</Box>
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
								{counseling.skills?.map((skill, idx) => (
									<Chip
										key={idx}
										label={`${skill.name} • ${skill.level}`}
										size="small"
										variant="outlined"
										sx={{ bgcolor: 'background.paper', borderColor: 'divider', fontWeight: 500 }}
									/>
								)) || <Typography variant="caption" sx={{ color: 'text.secondary' }}>None listed</Typography>}
							</Stack>
						</Box>

						{counseling.workexperience && counseling.workexperience.length > 0 && (
							<Box sx={{ mb: 4 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
									<WorkIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
										Counseling Work Experience
									</Typography>
								</Box>
								<Stack spacing={2}>
									{counseling.workexperience.map((exp, idx) => (
										<Box
											key={idx}
											sx={{
												p: 2,
												bgcolor: 'background.paper',
												border: '1px solid',
												borderColor: 'divider',
												borderRadius: 1,
												boxShadow: theme.shadows[1]
											}}
										>
											<Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
												{exp.job_title || 'Role not specified'}
											</Typography>
											<Grid container spacing={2}>
												<Grid size={{ xs: 12, sm: 4 }}>
													<Typography variant="caption" color="text.secondary" display="block">Company</Typography>
													<Typography variant="body2">{exp.company || '-'}</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 4 }}>
													<Typography variant="caption" color="text.secondary" display="block">Experience</Typography>
													<Typography variant="body2">{exp.years_of_experience || '-'}</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 4 }}>
													<Typography variant="caption" color="text.secondary" display="block">Currently Working</Typography>
													<Typography variant="body2">{exp.currently_working ? 'Yes' : 'No'}</Typography>
												</Grid>
											</Grid>
										</Box>
									))}
								</Stack>
							</Box>
						)}
					</Grid>

					<Grid size={{ xs: 12, md: 5 }}>
						<Box sx={{ bgcolor: alpha(theme.palette.background.default, 0.7), p: 3, borderRadius: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
								<StatusIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Session Metadata
								</Typography>
							</Box>
							<InfoRow
								label="Counselor"
								value={counseling.counselor_name}
								icon={<CounselorIcon sx={{ fontSize: 16 }} />}
							/>
							<InfoRow
								label="Counseling Date"
								value={counseling.counseling_date ? format(new Date(counseling.counseling_date), 'MMMM dd, yyyy') : '-'}
								icon={<EventIcon sx={{ fontSize: 16 }} />}
							/>

							{counseling.others && Object.keys(counseling.others).length > 0 && (
								<>
									<Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }} />
									<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
										Additional Details
									</Typography>
									{Object.entries(counseling.others).map(([key, value]) => (
										<InfoRow
											key={key}
											label={key.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
											value={Array.isArray(value) ? value.join(', ') : (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))}
										/>
									))}
								</>
							)}
						</Box>
					</Grid>
				</Grid>
			) : (
				<Box sx={{ textAlign: 'center', py: 8 }}>
					<PsychologyIcon sx={{ fontSize: 80, color: 'divider', mb: 2, opacity: 0.5 }} />
					<Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>No Counseling Profiled</Typography>
					<Typography variant="body2" color="text.secondary">
						A career counseling session has not been conducted for this candidate yet.
					</Typography>
				</Box>
			)}
		</SectionCard>
	);
};

export default CounselingTab;
