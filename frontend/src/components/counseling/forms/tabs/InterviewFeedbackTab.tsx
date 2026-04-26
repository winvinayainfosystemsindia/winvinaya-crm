import React from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	TextField,
	IconButton,
	Paper,
	Tooltip
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, InfoOutlined as InfoIcon, AssignmentOutlined as InterviewIcon, StarOutline as FeedbackIcon } from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import JobRoleSearch from '../../../common/JobRoleSearch';
import type { CandidateCounselingCreate } from '../../../../models/candidate';

interface InterviewFeedbackTabProps {
	formData: CandidateCounselingCreate;
	onAddQuestion: () => void;
	onRemoveQuestion: (index: number) => void;
	onQuestionChange: (index: number, field: string, value: string) => void;
	onFeedbackChange: (value: string) => void;
	onJobRolesChange: (roles: string[]) => void;
}

const InterviewFeedbackTab: React.FC<InterviewFeedbackTabProps> = ({
	formData,
	onAddQuestion,
	onRemoveQuestion,
	onQuestionChange,
	onFeedbackChange,
	onJobRolesChange
}) => {
	const { awsPanel, helperBox } = awsStyles;

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '2px',
			bgcolor: 'action.hover',
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.secondary' },
			'&.Mui-focused fieldset': { borderColor: 'accent.main' },
			'& textarea': { resize: 'vertical' }
		}
	};

	return (
		<Stack spacing={4}>
			{/* Interview Questions Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Box sx={{ bgcolor: 'accent.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
							<InterviewIcon sx={{ color: '#ffffff', fontSize: 20 }} />
						</Box>
						<Typography variant="awsSectionTitle">Interview Assessment Questions</Typography>
					</Stack>
					<Button
						variant="outlined"
						size="small"
						startIcon={<AddIcon />}
						onClick={onAddQuestion}
						sx={{
							borderRadius: '2px',
							textTransform: 'none',
							fontWeight: 700,
							borderColor: 'divider',
							color: 'text.secondary',
							'&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' }
						}}
					>
						Add Custom Question
					</Button>
				</Box>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: 'info.main', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: 'info.main', fontWeight: 500 }}>
						Guidance: Ask domain-specific questions or assign technical tasks to gauge the skill levels mentioned by the candidate.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: 'divider' }} />

				<Stack spacing={4}>
					{formData.questions?.map((q, index: number) => (
						<Box
							key={index}
							sx={{
								p: 3,
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: '2px',
								bgcolor: 'action.hover',
								'&:hover': { borderColor: 'text.secondary', bgcolor: 'background.paper' }
							}}
						>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start' }}>
								<Box sx={{ width: '100%', mr: 2 }}>
									<Typography variant="awsFieldLabel" sx={{ color: 'accent.main', mb: 0.5 }}>Question #{index + 1}</Typography>
									<TextField
										variant="standard"
										fullWidth
										placeholder="Type your question here..."
										value={q.question}
										onChange={(e) => onQuestionChange(index, 'question', e.target.value)}
										InputProps={{
											disableUnderline: true,
											sx: {
												fontSize: '0.9rem',
												p: 1,
												bgcolor: 'background.paper',
												border: '1px solid',
												borderColor: 'divider',
												borderRadius: '2px'
											}
										}}
									/>
								</Box>
								<Tooltip title="Remove Question">
									<IconButton
										size="small"
										onClick={() => onRemoveQuestion(index)}
										sx={{
											color: 'error.main',
											'&:hover': { bgcolor: 'error.light', opacity: 0.1 }
										}}
									>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
							</Box>
							<Box>
								<Typography variant="awsFieldLabel">Candidate Response</Typography>
								<TextField
									multiline
									rows={2}
									fullWidth
									size="small"
									variant="outlined"
									value={q.answer}
									onChange={(e) => onQuestionChange(index, 'answer', e.target.value)}
									placeholder="Document the candidate's answer and your observations..."
									sx={inputSx}
								/>
							</Box>
						</Box>
					))}
					{(!formData.questions || formData.questions.length === 0) && (
						<Box sx={{ py: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '2px' }}>
							<Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
								No custom interview questions added yet.
							</Typography>
						</Box>
					)}
				</Stack>
			</Paper>

			{/* Performance Feedback Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'accent.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<FeedbackIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Training & Placement Recommendations</Typography>
				</Stack>

				<Divider sx={{ mb: 4, borderColor: 'divider' }} />

				<Stack spacing={4}>
					{/* Integrated Job Search Component */}
					<JobRoleSearch
						value={formData.suitable_job_roles || []}
						onChange={onJobRolesChange}
					/>

					<Divider sx={{ mb: 4, borderColor: 'divider' }} />

					<Box>
						<Typography variant="awsFieldLabel">Overall Feedback & Recommended Next Steps</Typography>
						<Box sx={helperBox}>
							<InfoIcon sx={{ color: 'info.main', mt: 0.25, fontSize: 20 }} />
							<Typography variant="body2" sx={{ color: 'info.main', fontWeight: 400, fontSize: '0.8125rem' }}>
								<Typography component="span" variant="inherit" sx={{ fontWeight: 700 }}>Evaluation Guidance:</Typography> Provide a consolidated summary of the candidate's domain expertise, communication abilities, and cultural fit. Use these insights to justify the recommended training path or highlight specific placement opportunities.
							</Typography>
						</Box>
						<TextField
							multiline
							rows={4}
							fullWidth
							variant="outlined"
							value={formData.feedback || ''}
							onChange={(e) => onFeedbackChange(e.target.value)}
							placeholder="Write a summary of clinical observations and the recommended training or placement pipeline for this candidate..."
							sx={inputSx}
						/>
					</Box>
				</Stack>
			</Paper>
		</Stack>
	);
};

export default InterviewFeedbackTab;
