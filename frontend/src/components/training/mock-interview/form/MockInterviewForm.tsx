import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Dialog,
	Box,
	Typography,
	alpha,
	useTheme,
	IconButton,
	Tooltip
} from '@mui/material';
import { 
	PlayArrow as StartIcon, 
	Pause as PauseIcon 
} from '@mui/icons-material';
import { type AppDispatch, type RootState } from '../../../../store/store';
import { useMockInterviewForm } from '../hooks/useMockInterviewForm';
import { fetchAggregatedSkills } from '../../../../store/slices/skillSlice';
import BasicDetailsTab from './tabs/BasicDetailsTab';
import TechnicalEvaluationTab from './tabs/TechnicalEvaluationTab';
import CompetencyMatrixTab from './tabs/CompetencyMatrixTab';
import FinalRemarksTab from './tabs/FinalRemarksTab';
import EnterpriseForm, { type FormStep } from '../../../common/form/EnterpriseForm';

interface MockInterviewFormProps {
	open: boolean;
	onClose: () => void;
	batchId: number;
	viewMode?: boolean;
}

const MockInterviewForm: React.FC<MockInterviewFormProps> = ({ open, onClose, batchId, viewMode = false }) => {
	const theme = useTheme();
	const dispatch = useDispatch<AppDispatch>();
	const { currentMockInterview } = useSelector((state: RootState) => state.mockInterviews);
	const { allocations } = useSelector((state: RootState) => state.training);
	const { aggregatedSkills: masterSkills } = useSelector((state: RootState) => state.skills);

	useEffect(() => {
		dispatch(fetchAggregatedSkills());
	}, [dispatch]);

	const {
		formData,
		questions,
		skills,
		errors,
		saveLoading,
		elapsedSeconds,
		isPaused,
		toggleTimer,
		handleChange,
		handleQuestionChange,
		addQuestion,
		removeQuestion,
		handleSkillChange,
		addSkill,
		removeSkill,
		handleSubmit
	} = useMockInterviewForm(batchId, onClose);

	const steps: FormStep[] = useMemo(() => [
		{
			label: 'Basic Details',
			description: 'Metadata & context',
			content: (
				<BasicDetailsTab
					formData={formData}
					errors={errors}
					viewMode={viewMode}
					isEdit={!!currentMockInterview}
					allocations={allocations}
					onChange={handleChange}
				/>
			)
		},
		{
			label: 'Technical Evaluation',
			description: 'Q&A discussion',
			content: (
				<TechnicalEvaluationTab
					questions={questions}
					viewMode={viewMode}
					onQuestionChange={handleQuestionChange}
					onAddQuestion={addQuestion}
					onRemoveQuestion={removeQuestion}
				/>
			)
		},
		{
			label: 'Competency Matrix',
			description: 'Skill proficiency',
			content: (
				<CompetencyMatrixTab
					skills={skills}
					masterSkills={masterSkills}
					viewMode={viewMode}
					onSkillChange={handleSkillChange}
					onAddSkill={addSkill}
					onRemoveSkill={removeSkill}
				/>
			)
		},
		{
			label: 'Final Remarks',
			description: 'Summative feedback',
			content: (
				<FinalRemarksTab
					formData={formData}
					viewMode={viewMode}
					onChange={handleChange}
				/>
			)
		}
	], [formData, questions, skills, errors, viewMode, currentMockInterview, allocations, handleChange, handleQuestionChange, addQuestion, removeQuestion, handleSkillChange, addSkill, removeSkill]);

	const formatElapsed = (seconds: number) => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	};

	return (
		<Dialog
			open={open}
			onClose={(_, reason) => {
				if (reason === 'backdropClick') return;
				onClose();
			}}
			maxWidth="lg"
			fullWidth
			disableEscapeKeyDown
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					bgcolor: 'transparent'
				}
			}}
		>
			<EnterpriseForm
				title={`${viewMode ? 'Review' : currentMockInterview ? 'Edit' : 'Record'} Mock Interview`}
				subtitle="Enterprise-grade technical proficiency assessment console"
				mode={viewMode ? 'view' : currentMockInterview ? 'edit' : 'create'}
				steps={steps}
				onSave={handleSubmit}
				onCancel={onClose}
				isSubmitting={saveLoading}
				saveButtonText={viewMode ? 'Close' : currentMockInterview ? 'Update Session' : 'Finalize Session'}
				headerActions={
					!viewMode && !currentMockInterview && (
						<Box 
							sx={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: 1, 
								px: 1.5, 
								py: 0.5, 
								borderRadius: 2, 
								bgcolor: alpha(isPaused ? theme.palette.warning.main : theme.palette.error.main, 0.08),
								border: '1px solid',
								borderColor: alpha(isPaused ? theme.palette.warning.main : theme.palette.error.main, 0.2),
								mr: 2
							}}
						>
							<Box 
								sx={{ 
									width: 8, 
									height: 8, 
									borderRadius: '50%', 
									bgcolor: isPaused ? 'warning.main' : 'error.main',
									animation: isPaused ? 'none' : 'pulse 2s infinite'
								}} 
							/>
							<Typography 
								variant="subtitle2" 
								sx={{ 
									fontWeight: 800, 
									fontFamily: 'monospace', 
									color: isPaused ? 'warning.main' : 'error.main',
									fontSize: '0.9rem',
									minWidth: '65px',
									textAlign: 'center'
								}}
							>
								{formatElapsed(elapsedSeconds)}
							</Typography>
							<Tooltip title={elapsedSeconds === 0 && isPaused ? "Start Interview" : isPaused ? "Resume Interview" : "Pause Interview"}>
								<IconButton 
									size="small" 
									onClick={toggleTimer}
									sx={{ 
										color: isPaused ? 'warning.main' : 'error.main',
										p: 0.5,
										'&:hover': {
											bgcolor: alpha(isPaused ? theme.palette.warning.main : theme.palette.error.main, 0.1)
										}
									}}
								>
									{isPaused ? <StartIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
								</IconButton>
							</Tooltip>
							<style>
								{`
									@keyframes pulse {
										0% { opacity: 1; transform: scale(1); }
										50% { opacity: 0.5; transform: scale(1.2); }
										100% { opacity: 1; transform: scale(1); }
									}
								`}
							</style>
						</Box>
					)
				}
			/>
		</Dialog>
	);
};

export default MockInterviewForm;

