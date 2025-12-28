import React from 'react';
import { Paper, Grid, Typography, Chip, Box, Stack } from '@mui/material';
import {
	Psychology as PsychologyIcon,
	Pending as PendingIcon,
	Feedback as FeedbackIcon,
	HistoryEdu as SkillsIcon,
	Event as EventIcon,
	RecordVoiceOver as CounselorIcon,
	AssignmentTurnedIn as StatusIcon,
	QuestionAnswer as QuestionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { InfoRow, SectionHeader } from './DetailedViewCommon';
import type { Candidate } from '../../../models/candidate';

interface CounselingTabProps {
	candidate: Candidate;
}

const CounselingTab: React.FC<CounselingTabProps> = ({ candidate }) => {
	const { counseling } = candidate;

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 3,
				borderRadius: 0,
				border: '1px solid #d5dbdb',
				boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
			}}
		>
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
								<FeedbackIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
									Counselor Feedback
								</Typography>
							</Box>
							<Paper
								elevation={0}
								sx={{
									p: 2.5,
									bgcolor: '#f8f9fa',
									border: '1px solid #eaeded',
									borderRadius: 1,
									position: 'relative',
									'&::before': {
										content: '""',
										position: 'absolute',
										left: 0,
										top: 0,
										bottom: 0,
										width: 4,
										bgcolor: '#ec7211',
										borderRadius: '4px 0 0 4px'
									}
								}}
							>
								<Typography variant="body2" sx={{ fontStyle: typeof counseling.feedback === 'string' && counseling.feedback ? 'normal' : 'italic', color: '#232f3e', lineHeight: 1.6 }}>
									{typeof counseling.feedback === 'string' ? (counseling.feedback || 'No detailed feedback provided.') : 'No detailed feedback provided.'}
								</Typography>
							</Paper>
						</Box>

						<Box sx={{ mb: 4 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<QuestionIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
									Assessment Questions
								</Typography>
							</Box>
							<Stack spacing={2.5}>
								{counseling.questions && counseling.questions.length > 0 ? (
									counseling.questions.map((q, idx) => (
										<Box key={idx} sx={{ pl: 2, borderLeft: '2px solid #eaeded' }}>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 700,
													color: '#545b64',
													mb: 0.75,
													fontSize: '0.85rem',
													textTransform: 'uppercase',
													letterSpacing: '0.025em'
												}}
											>
												Q: {q.question}
											</Typography>
											<Typography variant="body2" sx={{ color: '#232f3e', lineHeight: 1.5 }}>
												{q.answer || 'No answer provided.'}
											</Typography>
										</Box>
									))
								) : (
									<Typography variant="body2" sx={{ fontStyle: 'italic', color: '#545b64' }}>
										No assessment questions recorded.
									</Typography>
								)}
							</Stack>
						</Box>

						<Box sx={{ mb: 4 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<SkillsIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
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
										sx={{ bgcolor: 'white', borderColor: '#d5dbdb', fontWeight: 500 }}
									/>
								)) || <Typography variant="caption" sx={{ color: 'text.secondary' }}>None listed</Typography>}
							</Stack>
						</Box>
					</Grid>

					<Grid size={{ xs: 12, md: 5 }}>
						<Box sx={{ bgcolor: '#f2f3f3', p: 3, borderRadius: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
								<StatusIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
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
						</Box>
					</Grid>
				</Grid>
			) : (
				<Box sx={{ textAlign: 'center', py: 8 }}>
					<PsychologyIcon sx={{ fontSize: 80, color: '#eaeded', mb: 2 }} />
					<Typography variant="h6" color="#545b64" sx={{ mb: 1 }}>No Counseling Profiled</Typography>
					<Typography variant="body2" color="text.secondary">
						A career counseling session has not been conducted for this candidate yet.
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default CounselingTab;
