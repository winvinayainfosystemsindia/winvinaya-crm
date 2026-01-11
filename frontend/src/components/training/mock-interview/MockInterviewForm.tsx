import React from 'react';
import { useSelector } from 'react-redux';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Grid,
	Typography,
	IconButton,
	Box,
	TextField,
	CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { type RootState } from '../../../store/store';
import { useMockInterviewForm } from './useMockInterviewForm';
import MockInterviewFormMetadata from './MockInterviewFormMetadata';
import MockInterviewFormQuestions from './MockInterviewFormQuestions';
import MockInterviewFormSkills from './MockInterviewFormSkills';

interface MockInterviewFormProps {
	open: boolean;
	onClose: () => void;
	batchId: number;
	viewMode?: boolean;
}

const SECTION_BG = '#f8f9fa';
const PRIMARY_BLUE = '#007eb9';
const BORDER_COLOR = '#d5dbdb';

const MockInterviewForm: React.FC<MockInterviewFormProps> = ({ open, onClose, batchId, viewMode = false }) => {
	const { currentMockInterview } = useSelector((state: RootState) => state.mockInterviews);
	const { allocations } = useSelector((state: RootState) => state.training);

	const {
		formData,
		questions,
		skills,
		errors,
		saveLoading,
		handleChange,
		handleQuestionChange,
		addQuestion,
		removeQuestion,
		handleSkillChange,
		addSkill,
		removeSkill,
		handleSubmit
	} = useMockInterviewForm(batchId, onClose);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			fullWidth
			PaperProps={{
				sx: { borderRadius: '4px', border: `1px solid ${BORDER_COLOR}`, boxShadow: 3 }
			}}
		>
			<DialogTitle sx={{
				p: 3,
				bgcolor: SECTION_BG,
				borderBottom: `1px solid ${BORDER_COLOR}`,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }}>
						{viewMode ? 'Review' : currentMockInterview ? 'Edit' : 'Record'} Mock Interview
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Comprehensive technical assessment and proficiency tracking
					</Typography>
				</Box>
				<IconButton onClick={onClose} size="small" sx={{ color: '#545b64' }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 4 }}>
				<Grid container spacing={5}>
					{/* Sidebar: Metadata & Overall */}
					<Grid size={{ xs: 12, md: 4 }}>
						<MockInterviewFormMetadata
							formData={formData}
							errors={errors}
							viewMode={viewMode}
							isEdit={!!currentMockInterview}
							allocations={allocations}
							onChange={handleChange}
							PRIMARY_BLUE={PRIMARY_BLUE}
						/>
					</Grid>

					{/* Main: Q&A and Skills */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
							<MockInterviewFormQuestions
								questions={questions}
								viewMode={viewMode}
								onQuestionChange={handleQuestionChange}
								onAddQuestion={addQuestion}
								onRemoveQuestion={removeQuestion}
								PRIMARY_BLUE={PRIMARY_BLUE}
							/>

							<MockInterviewFormSkills
								skills={skills}
								viewMode={viewMode}
								onSkillChange={handleSkillChange}
								onAddSkill={addSkill}
								onRemoveSkill={removeSkill}
								PRIMARY_BLUE={PRIMARY_BLUE}
							/>

							{/* Feedback */}
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Summative Remarks</Typography>
								<TextField
									multiline
									rows={4}
									placeholder="Provide detailed observations on the candidate's performance, strengths, and areas for improvement..."
									value={formData.feedback}
									onChange={(e) => handleChange('feedback', e.target.value)}
									fullWidth
									disabled={viewMode}
									sx={{ bgcolor: 'white' }}
								/>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</DialogContent>

			<DialogActions sx={{ p: 3, bgcolor: SECTION_BG, borderTop: `1px solid ${BORDER_COLOR}` }}>
				<Button onClick={onClose} variant="text" sx={{ color: '#545b64', textTransform: 'none', fontWeight: 600 }}>
					{viewMode ? 'Close' : 'Discard Changes'}
				</Button>
				{!viewMode && (
					<Button
						onClick={handleSubmit}
						variant="contained"
						disabled={saveLoading}
						sx={{
							bgcolor: PRIMARY_BLUE,
							'&:hover': { bgcolor: '#006799' },
							textTransform: 'none',
							fontWeight: 600,
							px: 4,
							boxShadow: 'none'
						}}
					>
						{saveLoading ? <CircularProgress size={20} color="inherit" /> : 'Finalize Assessment'}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default MockInterviewForm;

