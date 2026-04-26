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
	Tooltip,
	useTheme,
	alpha
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, AssignmentOutlined as InterviewIcon, StarOutline as FeedbackIcon } from '@mui/icons-material';
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
	const theme = useTheme();

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: 0.5,
			bgcolor: 'background.paper',
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.secondary' },
			'&.Mui-focused fieldset': { borderColor: 'primary.main' },
			'& textarea': { resize: 'vertical' }
		}
	};

	return (
		<Stack spacing={4}>
			{/* Interview Questions Section */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
							<InterviewIcon sx={{ color: 'common.white', fontSize: 20 }} />
						</Box>
						<Typography variant="awsSectionTitle">Interview Assessment Questions</Typography>
					</Stack>
					<Button
						variant="contained"
						size="small"
						startIcon={<AddIcon />}
						onClick={onAddQuestion}
						sx={{
							borderRadius: 0.5,
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { boxShadow: 'none', bgcolor: 'primary.dark' }
						}}
					>
						Add Question
					</Button>
				</Box>

				<Divider sx={{ mb: 4 }} />

				<Stack spacing={4}>
					{formData.questions?.map((q, index: number) => (
						<Paper
							key={index}
							elevation={0}
							variant="outlined"
							sx={{
								borderRadius: 0.5,
								bgcolor: 'background.paper',
								overflow: 'hidden'
							}}
						>
							<Box sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								px: 3,
								py: 1.5,
								bgcolor: 'action.hover',
								borderBottom: '1px solid',
								borderColor: 'divider'
							}}>
								<Typography variant="subtitle2" color="primary.main" sx={{ textTransform: 'uppercase' }}>
									Question #{index + 1}
								</Typography>
								<Tooltip title="Remove Question">
									<IconButton
										size="small"
										onClick={() => onRemoveQuestion(index)}
										sx={{
											color: 'error.main',
											'&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
										}}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>
							<Box sx={{ p: 3 }}>
								<Stack spacing={3}>
									<Box>
										<Typography variant="awsFieldLabel">Question Description</Typography>
										<TextField
											fullWidth
											placeholder="Type your question here..."
											size="small"
											value={q.question}
											onChange={(e) => onQuestionChange(index, 'question', e.target.value)}
											sx={inputSx}
										/>
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
								</Stack>
							</Box>
						</Paper>
					))}
					{(!formData.questions || formData.questions.length === 0) && (
						<Box sx={{ 
							py: 6, 
							textAlign: 'center', 
							border: '1px dashed', 
							borderColor: 'divider', 
							borderRadius: 0.5, 
							bgcolor: 'background.default' 
						}}>
							<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
								No custom interview questions added yet.
							</Typography>
						</Box>
					)}
				</Stack>
			</Paper>

			{/* Performance Feedback Section */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
						<FeedbackIcon sx={{ color: 'common.white', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Training & Placement Recommendations</Typography>
				</Stack>

				<Divider sx={{ mb: 4 }} />

				<Stack spacing={4}>
					{/* Integrated Job Search Component */}
					<JobRoleSearch
						value={formData.suitable_job_roles || []}
						onChange={onJobRolesChange}
					/>

					<Divider sx={{ mb: 2 }} />

					<Box>
						<Typography variant="awsFieldLabel">Overall Feedback & Recommended Next Steps</Typography>
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
