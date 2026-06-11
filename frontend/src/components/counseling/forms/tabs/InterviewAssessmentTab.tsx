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
	alpha,
	Avatar
} from '@mui/material';
import { 
	Add as AddIcon, 
	DeleteOutline as DeleteIcon, 
	AssignmentOutlined as InterviewIcon, 
	QuestionAnswerOutlined as QAIcon
} from '@mui/icons-material';
import type { CandidateCounselingCreate } from '../../../../models/candidate';

interface InterviewAssessmentTabProps {
	formData: CandidateCounselingCreate;
	onAddQuestion: () => void;
	onRemoveQuestion: (index: number) => void;
	onQuestionChange: (index: number, field: string, value: string) => void;
}

const InterviewAssessmentTab: React.FC<InterviewAssessmentTabProps> = ({
	formData,
	onAddQuestion,
	onRemoveQuestion,
	onQuestionChange
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
						<Typography variant="awsSectionTitle">Clinical Interview Questions</Typography>
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

				<Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04), p: 2, borderRadius: 0.5, mb: 3 }}>
					<Stack direction="row" spacing={2} alignItems="center">
						<QAIcon sx={{ color: 'primary.main' }} />
						<Box>
							<Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700 }}>Assessment Quality</Typography>
							<Typography variant="caption" color="text.secondary">
								Document specific technical and behavioral questions to build a comprehensive candidate profile.
							</Typography>
						</Box>
					</Stack>
				</Box>

				<Divider sx={{ mb: 4 }} />

				<Stack spacing={4}>
					{formData.questions?.map((q, index: number) => (
						<Box key={index}>
							<Paper
								elevation={0}
								variant="outlined"
								sx={{
									borderRadius: 0.5,
									bgcolor: 'background.paper',
									overflow: 'hidden',
									'&:hover': { borderColor: 'primary.main' }
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
									<Stack direction="row" spacing={1.5} alignItems="center">
										<Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 800 }}>
											{index + 1}
										</Avatar>
										<Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
											Evaluation Block
										</Typography>
									</Stack>
									<Tooltip title="Remove Block">
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
											<Typography variant="awsFieldLabel">Structured Question</Typography>
											<TextField
												fullWidth
												placeholder="Enter the specific question asked..."
												size="small"
												value={q.question}
												onChange={(e) => onQuestionChange(index, 'question', e.target.value)}
												sx={inputSx}
											/>
										</Box>
										<Box>
											<Typography variant="awsFieldLabel">Detailed Outcome / Candidate Response</Typography>
											<TextField
												multiline
												rows={3}
												fullWidth
												size="small"
												variant="outlined"
												value={q.answer}
												onChange={(e) => onQuestionChange(index, 'answer', e.target.value)}
												placeholder="Document response nuances, technical accuracy, and soft skills observed..."
												sx={inputSx}
											/>
										</Box>
									</Stack>
								</Box>
							</Paper>
						</Box>
					))}
					{(!formData.questions || formData.questions.length === 0) && (
						<Box sx={{ 
							py: 8, 
							textAlign: 'center', 
							border: '1px dashed', 
							borderColor: 'divider', 
							borderRadius: 0.5, 
							bgcolor: 'background.default' 
						}}>
							<QAIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
							<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
								No custom interview blocks added yet.
							</Typography>
							<Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
								Add questions to evaluate specific candidate capabilities.
							</Typography>
						</Box>
					)}
				</Stack>
			</Paper>
		</Stack>
	);
};

export default InterviewAssessmentTab;
