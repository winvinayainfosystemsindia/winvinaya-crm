import React from 'react';
import { useSelector } from 'react-redux';
import {
	Button,
	Grid,
	Typography,
	Box,
	TextField,
	CircularProgress,
	useTheme,
	alpha
} from '@mui/material';
import { type RootState } from '../../../../store/store';
import { useMockInterviewForm } from '../hooks/useMockInterviewForm';
import MockInterviewFormMetadata from './MockInterviewFormMetadata';
import MockInterviewFormQuestions from './MockInterviewFormQuestions';
import MockInterviewFormSkills from './MockInterviewFormSkills';
import BaseDialog from '../../../common/dialogbox/BaseDialog';

interface MockInterviewFormProps {
	open: boolean;
	onClose: () => void;
	batchId: number;
	viewMode?: boolean;
}

const MockInterviewForm: React.FC<MockInterviewFormProps> = ({ open, onClose, batchId, viewMode = false }) => {
	const theme = useTheme();
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
		<BaseDialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			title={`${viewMode ? 'Review' : currentMockInterview ? 'Edit' : 'Record'} Mock Interview`}
			subtitle="Comprehensive technical interview and proficiency tracking"
			actions={
				<>
					<Button 
						onClick={onClose} 
						variant="text" 
						sx={{ 
							color: 'text.secondary', 
							textTransform: 'none', 
							fontWeight: 600,
							'&:hover': { bgcolor: alpha(theme.palette.action.active, 0.05) }
						}}
					>
						{viewMode ? 'Close' : 'Discard Changes'}
					</Button>
					{!viewMode && (
						<Button
							onClick={handleSubmit}
							variant="contained"
							disabled={saveLoading}
							sx={{
								bgcolor: 'primary.main',
								'&:hover': { bgcolor: 'primary.dark' },
								textTransform: 'none',
								fontWeight: 700,
								px: 4,
								borderRadius: 1.5,
								boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`
							}}
						>
							{saveLoading ? <CircularProgress size={20} color="inherit" /> : 'Finalize Interview'}
						</Button>
					)}
				</>
			}
		>
			<Grid container spacing={4}>
				{/* Sidebar: Metadata & Overall */}
				<Grid size={{ xs: 12, md: 4 }}>
					<Box 
						sx={{ 
							p: 3, 
							borderRadius: 2, 
							bgcolor: alpha(theme.palette.background.default, 0.5),
							border: '1px solid',
							borderColor: 'divider',
							height: '100%'
						}}
					>
						<MockInterviewFormMetadata
							formData={formData}
							errors={errors}
							viewMode={viewMode}
							isEdit={!!currentMockInterview}
							allocations={allocations}
							onChange={handleChange}
						/>
					</Box>
				</Grid>

				{/* Main: Q&A and Skills */}
				<Grid size={{ xs: 12, md: 8 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
						<MockInterviewFormQuestions
							questions={questions}
							viewMode={viewMode}
							onQuestionChange={handleQuestionChange}
							onAddQuestion={addQuestion}
							onRemoveQuestion={removeQuestion}
						/>

						<MockInterviewFormSkills
							skills={skills}
							viewMode={viewMode}
							onSkillChange={handleSkillChange}
							onAddSkill={addSkill}
							onRemoveSkill={removeSkill}
						/>

						{/* Feedback */}
						<Box 
							sx={{ 
								p: 3, 
								borderRadius: 2, 
								bgcolor: alpha(theme.palette.info.main, 0.02),
								border: '1px solid',
								borderColor: alpha(theme.palette.info.main, 0.1)
							}}
						>
							<Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'info.main' }}>
								Summative Remarks
							</Typography>
							<TextField
								multiline
								rows={4}
								placeholder="Provide detailed observations on the candidate's performance, strengths, and areas for improvement..."
								value={formData.feedback}
								onChange={(e) => handleChange('feedback', e.target.value)}
								fullWidth
								disabled={viewMode}
								sx={{ 
									bgcolor: 'background.paper',
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>
						</Box>
					</Box>
				</Grid>
			</Grid>
		</BaseDialog>
	);
};

export default MockInterviewForm;

