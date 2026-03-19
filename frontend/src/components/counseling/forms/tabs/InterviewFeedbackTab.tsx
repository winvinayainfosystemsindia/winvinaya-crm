import React from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	TextField,
	IconButton,
	Paper
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
	const { sectionTitle, awsPanel, fieldLabel, helperBox } = awsStyles;

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '2px',
			bgcolor: '#fcfcfc',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' },
			'&.Mui-focused fieldset': { borderColor: '#ec7211' },
			'& textarea': { resize: 'vertical' }
		}
	};

	return (
		<Stack spacing={4}>
			{/* Interview Questions Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
							<InterviewIcon sx={{ color: '#ffffff', fontSize: 20 }} />
						</Box>
						<Typography sx={sectionTitle}>Interview Assessment Questions</Typography>
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
							borderColor: '#d5dbdb',
							color: '#545b64',
							'&:hover': { bgcolor: '#f2f3f3', borderColor: '#879596' }
						}}
					>
						Add Custom Question
					</Button>
				</Box>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
						Guidance: Ask domain-specific questions or assign technical tasks to gauge the skill levels mentioned by the candidate.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				<Stack spacing={4}>
					{formData.questions?.map((q, index: number) => (
						<Box
							key={index}
							sx={{
								p: 3,
								border: '1px solid #eaeded',
								borderRadius: '2px',
								bgcolor: '#fcfcfc',
								'&:hover': { borderColor: '#d5dbdb', bgcolor: '#ffffff' }
							}}
						>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start' }}>
								<Box sx={{ width: '100%', mr: 2 }}>
									<Typography sx={{ ...fieldLabel, color: '#ec7211', mb: 0.5 }}>Question #{index + 1}</Typography>
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
												bgcolor: '#ffffff',
												border: '1px solid #d5dbdb',
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
											color: '#d91d11',
											'&:hover': { bgcolor: '#fdf3f2' }
										}}
									>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
							</Box>
							<Box>
								<Typography sx={fieldLabel}>Candidate Response</Typography>
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
						<Box sx={{ py: 6, textAlign: 'center', border: '1px dashed #d5dbdb', borderRadius: '2px' }}>
							<Typography variant="body2" sx={{ color: '#545b64', fontStyle: 'italic' }}>
								No custom interview questions added yet.
							</Typography>
						</Box>
					)}
				</Stack>
			</Paper>

			{/* Performance Feedback Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<FeedbackIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Training & Placement Recommendations</Typography>
				</Stack>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 400 }}>
						Final Remarks: Synthesize observations on domain expertise, communication skills, and work culture fit to recommend suitable training paths.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				<Stack spacing={4}>
					{/* Integrated Job Search Component */}
					<JobRoleSearch
						value={formData.suitable_job_roles || []}
						onChange={onJobRolesChange}
					/>

					<Box>
						<Typography sx={fieldLabel}>Overall Feedback & Recommended Next Steps</Typography>
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

// Tooltip import was missing from MUI material in previous edits
import { Tooltip } from '@mui/material';

export default InterviewFeedbackTab;
