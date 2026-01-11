import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Grid,
	MenuItem,
	Typography,
	IconButton,
	Box,
	Slider,
	Stack,
	Paper,
	FormControl,
	InputLabel,
	Select,
	FormHelperText,
	CircularProgress,
	Tooltip,
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Close as CloseIcon,
	QuestionAnswer as QIcon,
	Psychology as SkillIcon,
	HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { type AppDispatch, type RootState } from '../../../store/store';
import { createMockInterview, updateMockInterview } from '../../../store/slices/mockInterviewSlice';
import { type Question, type Skill, type MockInterviewCreate } from '../../../models/MockInterview';

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
	const dispatch = useDispatch<AppDispatch>();
	const { currentMockInterview, loading: saveLoading } = useSelector((state: RootState) => state.mockInterviews);
	const { allocations } = useSelector((state: RootState) => state.training);

	const [formData, setFormData] = useState<Partial<MockInterviewCreate>>({
		candidate_id: undefined,
		interviewer_name: '',
		interview_date: new Date().toISOString().slice(0, 16),
		status: 'pending',
		overall_rating: 0,
		feedback: '',
	});

	const [questions, setQuestions] = useState<Question[]>([]);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (open) {
			if (currentMockInterview) {
				setFormData({
					candidate_id: currentMockInterview.candidate_id,
					interviewer_name: currentMockInterview.interviewer_name || '',
					interview_date: new Date(currentMockInterview.interview_date).toISOString().slice(0, 16),
					status: currentMockInterview.status,
					overall_rating: currentMockInterview.overall_rating || 0,
					feedback: currentMockInterview.feedback || '',
				});
				setQuestions(currentMockInterview.questions || []);
				setSkills(currentMockInterview.skills || []);
			} else {
				setFormData({
					candidate_id: undefined,
					interviewer_name: '',
					interview_date: new Date().toISOString().slice(0, 16),
					status: 'pending',
					overall_rating: 0,
					feedback: '',
				});
				setQuestions([{ question: '', answer: '' }]);
				setSkills([{ skill: '', level: 'Beginner', rating: 5 }]);
			}
			setErrors({});
		}
	}, [open, currentMockInterview]);

	const handleChange = (field: keyof MockInterviewCreate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			const newErrors = { ...errors };
			delete newErrors[field];
			setErrors(newErrors);
		}
	};

	const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
		const newQuestions = [...questions];
		newQuestions[index] = { ...newQuestions[index], [field]: value };
		setQuestions(newQuestions);
	};

	const addQuestion = () => setQuestions([...questions, { question: '', answer: '' }]);
	const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

	const handleSkillChange = (index: number, field: keyof Skill, value: any) => {
		const newSkills = [...skills];
		newSkills[index] = { ...newSkills[index], [field]: value };
		setSkills(newSkills);
	};

	const addSkill = () => setSkills([...skills, { skill: '', level: 'Beginner', rating: 5 }]);
	const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.candidate_id) newErrors.candidate_id = 'Candidate selection is required';
		if (!formData.interviewer_name) newErrors.interviewer_name = "Interviewer name is required";
		if (!formData.interview_date) newErrors.interview_date = "Interview date is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		const payload: MockInterviewCreate = {
			batch_id: batchId,
			candidate_id: formData.candidate_id!,
			interviewer_name: formData.interviewer_name,
			status: formData.status,
			overall_rating: formData.overall_rating,
			feedback: formData.feedback,
			questions: questions.filter(q => q.question.trim()),
			skills: skills.filter(s => s.skill.trim()),
			interview_date: new Date(formData.interview_date!).toISOString()
		};

		try {
			if (currentMockInterview) {
				await dispatch(updateMockInterview({ id: currentMockInterview.id, data: payload })).unwrap();
			} else {
				await dispatch(createMockInterview(payload)).unwrap();
			}
			onClose();
		} catch (error) {
			console.error("Failed to save mock interview:", error);
		}
	};

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
						<Stack spacing={4}>
							<Box>
								<Typography variant="overline" sx={{ fontWeight: 700, color: '#545b64', letterSpacing: 1.2 }}>
									Metadata
								</Typography>
								<Stack spacing={3} sx={{ mt: 2 }}>
									<FormControl fullWidth error={!!errors.candidate_id} size="small">
										<InputLabel shrink>Target Candidate</InputLabel>
										<Select
											value={formData.candidate_id || ''}
											onChange={(e) => handleChange('candidate_id', e.target.value)}
											label="Target Candidate"
											disabled={viewMode || !!currentMockInterview}
											displayEmpty
											sx={{ bgcolor: 'white' }}
										>
											<MenuItem value="" disabled>Select candidate...</MenuItem>
											{allocations.map((a) => (
												<MenuItem key={a.candidate_id} value={a.candidate_id}>
													{a.candidate?.name}
												</MenuItem>
											))}
										</Select>
										{errors.candidate_id && <FormHelperText>{errors.candidate_id}</FormHelperText>}
									</FormControl>

									<TextField
										label="Evaluation Conducted By"
										value={formData.interviewer_name}
										onChange={(e) => handleChange('interviewer_name', e.target.value)}
										fullWidth
										size="small"
										disabled={viewMode}
										error={!!errors.interviewer_name}
										helperText={errors.interviewer_name}
										InputLabelProps={{ shrink: true }}
										sx={{ bgcolor: 'white' }}
									/>

									<TextField
										label="Assessment Timestamp"
										type="datetime-local"
										value={formData.interview_date}
										onChange={(e) => handleChange('interview_date', e.target.value)}
										fullWidth
										size="small"
										disabled={viewMode}
										error={!!errors.interview_date}
										helperText={errors.interview_date}
										InputLabelProps={{ shrink: true }}
										sx={{ bgcolor: 'white' }}
									/>

									<TextField
										select
										label="Outcome Status"
										value={formData.status}
										onChange={(e) => handleChange('status', e.target.value)}
										fullWidth
										size="small"
										disabled={viewMode}
										InputLabelProps={{ shrink: true }}
										sx={{ bgcolor: 'white' }}
									>
										<MenuItem value="pending">Pending Review</MenuItem>
										<MenuItem value="cleared">Cleared / Recommended</MenuItem>
										<MenuItem value="re-test">Require Re-assessment</MenuItem>
										<MenuItem value="rejected">Not Recommended</MenuItem>
									</TextField>
								</Stack>
							</Box>

							<Paper variant="outlined" sx={{ p: 3, borderRadius: '4px', bgcolor: '#f1faff', border: '1px solid #d1e9ff' }}>
								<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
									<Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY_BLUE }}>
										OVERALL SCORE
									</Typography>
									<Tooltip title="Aggregated proficiency score across all assessed areas">
										<HelpIcon sx={{ fontSize: 16, color: PRIMARY_BLUE, opacity: 0.7 }} />
									</Tooltip>
								</Stack>
								<Box sx={{ textAlign: 'center' }}>
									<Typography variant="h2" sx={{ fontWeight: 800, color: PRIMARY_BLUE }}>
										{formData.overall_rating}
										<Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>/ 10</Typography>
									</Typography>
									<Slider
										value={formData.overall_rating}
										min={0}
										max={10}
										step={0.5}
										onChange={(_, v) => handleChange('overall_rating', v)}
										disabled={viewMode}
										sx={{
											mt: 2,
											width: '90%',
											color: PRIMARY_BLUE,
											'& .MuiSlider-thumb': {
												'&:hover, &.Mui-focusVisible': {
													boxShadow: `0px 0px 0px 8px rgba(0, 126, 185, 0.16)`,
												},
											}
										}}
									/>
									<Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: 1 }}>
										<Typography variant="caption" color="text.secondary">Entry</Typography>
										<Typography variant="caption" color="text.secondary">Expert</Typography>
									</Stack>
								</Box>
							</Paper>
						</Stack>
					</Grid>

					{/* Main: Q&A and Skills */}
					<Grid size={{ xs: 12, md: 8 }}>
						<Stack spacing={5}>
							{/* Questions */}
							<Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
									<Stack direction="row" alignItems="center" spacing={1.5}>
										<Box sx={{ p: 1, bgcolor: '#ecf3f3', borderRadius: '4px', display: 'flex' }}>
											<QIcon sx={{ color: '#007eb9' }} />
										</Box>
										<Typography variant="h6" sx={{ fontWeight: 600 }}>Technical Questions</Typography>
									</Stack>
									{!viewMode && (
										<Button
											startIcon={<AddIcon />}
											onClick={addQuestion}
											sx={{ textTransform: 'none', fontWeight: 600, color: PRIMARY_BLUE }}
										>
											Add Question
										</Button>
									)}
								</Box>
								<Stack spacing={2.5}>
									{questions.map((q, idx) => (
										<Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: '4px', position: 'relative', bgcolor: 'white' }}>
											{!viewMode && (
												<IconButton
													size="small"
													onClick={() => removeQuestion(idx)}
													sx={{ position: 'absolute', right: 8, top: 8, opacity: 0.6, '&:hover': { opacity: 1, color: '#d32f2f' } }}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											)}
											<TextField
												label={`Topic/Question ${idx + 1}`}
												value={q.question}
												onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
												fullWidth
												size="small"
												sx={{ mb: 2, mt: 1 }}
												disabled={viewMode}
												InputLabelProps={{ shrink: true }}
											/>
											<TextField
												label="Evaluation Details"
												value={q.answer}
												onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
												fullWidth
												multiline
												rows={2}
												size="small"
												disabled={viewMode}
												InputLabelProps={{ shrink: true }}
											/>
										</Paper>
									))}
								</Stack>
							</Box>

							{/* Skills Assessment */}
							<Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
									<Stack direction="row" alignItems="center" spacing={1.5}>
										<Box sx={{ p: 1, bgcolor: '#ecf3f3', borderRadius: '4px', display: 'flex' }}>
											<SkillIcon sx={{ color: '#007eb9' }} />
										</Box>
										<Typography variant="h6" sx={{ fontWeight: 600 }}>Skills Proficiency Matrix</Typography>
									</Stack>
									{!viewMode && (
										<Button
											startIcon={<AddIcon />}
											onClick={addSkill}
											sx={{ textTransform: 'none', fontWeight: 600, color: PRIMARY_BLUE }}
										>
											Add Skill
										</Button>
									)}
								</Box>
								<Grid container spacing={3}>
									{skills.map((s, idx) => (
										<Grid size={{ xs: 12, sm: 6 }} key={idx}>
											<Paper variant="outlined" sx={{ p: 2.5, borderRadius: '4px', bgcolor: 'white', position: 'relative' }}>
												{!viewMode && (
													<IconButton
														size="small"
														onClick={() => removeSkill(idx)}
														sx={{ position: 'absolute', right: 8, top: 8, opacity: 0.4 }}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												)}
												<Stack spacing={2}>
													<TextField
														label="Competency / Skill"
														value={s.skill}
														onChange={(e) => handleSkillChange(idx, 'skill', e.target.value)}
														fullWidth
														size="small"
														disabled={viewMode}
														placeholder="e.g. React, Python, Data Struct"
														InputLabelProps={{ shrink: true }}
													/>
													<Stack direction="row" spacing={2} alignItems="flex-end">
														<TextField
															select
															label="Level"
															value={s.level}
															onChange={(e) => handleSkillChange(idx, 'level', e.target.value)}
															fullWidth
															size="small"
															disabled={viewMode}
															InputLabelProps={{ shrink: true }}
														>
															<MenuItem value="Beginner">Beginner</MenuItem>
															<MenuItem value="Intermediate">Intermediate</MenuItem>
															<MenuItem value="Expert">Expert</MenuItem>
														</TextField>
														<Box sx={{ minWidth: 80, textAlign: 'right' }}>
															<Typography variant="overline" color="text.secondary">Score</Typography>
															<Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY_BLUE }}>{s.rating}/10</Typography>
														</Box>
													</Stack>
													<Slider
														value={s.rating}
														min={0}
														max={10}
														step={1}
														size="small"
														onChange={(_, v) => handleSkillChange(idx, 'rating', v)}
														disabled={viewMode}
														sx={{ color: PRIMARY_BLUE }}
													/>
												</Stack>
											</Paper>
										</Grid>
									))}
								</Grid>
							</Box>

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
						</Stack>
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
