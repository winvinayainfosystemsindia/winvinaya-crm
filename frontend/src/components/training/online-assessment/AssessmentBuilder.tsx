import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Stack,
	Box,
	IconButton,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Paper,
	FormControlLabel,
	Radio,
	RadioGroup,
	Switch
} from '@mui/material';
import {
	Delete as DeleteIcon,
	Add as AddIcon,
	Security as SecurityIcon,
	Lock as LockIcon
} from '@mui/icons-material';
import type { AssessmentQuestion, TrainingBatch } from '../../../models/training';
import assessmentService from '../../../services/assessmentService';

interface AssessmentBuilderProps {
	batch: TrainingBatch;
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({ batch, open, onClose, onSuccess }) => {
	const [submitting, setSubmitting] = useState(false);
	const [generalInfo, setGeneralInfo] = useState({
		title: '',
		description: '',
		duration_minutes: 30,
		security_key: Math.random().toString(36).substring(7).toUpperCase(),
		pass_percentage: 40,
		include_seb: false,
		seb_config_key: ''
	});

	const [questions, setQuestions] = useState<Partial<AssessmentQuestion>[]>([
		{
			text: '',
			type: 'MCQ',
			options: ['', '', '', ''],
			correct_answer: '',
			marks: 1
		}
	]);

	const addQuestion = () => {
		setQuestions([
			...questions,
			{
				text: '',
				type: 'MCQ',
				options: ['', '', '', ''],
				correct_answer: '',
				marks: 1
			}
		]);
	};

	const removeQuestion = (index: number) => {
		setQuestions(questions.filter((_, i) => i !== index));
	};

	const handleQuestionChange = (index: number, field: keyof AssessmentQuestion, value: any) => {
		const newQuestions = [...questions];
		newQuestions[index] = { ...newQuestions[index], [field]: value };
		setQuestions(newQuestions);
	};

	const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
		const newQuestions = [...questions];
		const options = [...(newQuestions[qIndex].options as string[])];
		options[oIndex] = value;
		newQuestions[qIndex] = { ...newQuestions[qIndex], options };
		setQuestions(newQuestions);
	};

	const handleSubmit = async () => {
		if (!generalInfo.title.trim()) return;

		try {
			setSubmitting(true);
			await assessmentService.createAssessment(batch.id, {
				...generalInfo,
				questions: questions
			});
			onSuccess();
		} catch (error) {
			console.error('Failed to save assessment:', error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: 'white', p: 2 }}>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>Create Online Assessment</Typography>
			</DialogTitle>
			<DialogContent sx={{ p: 4, bgcolor: '#f2f3f3' }}>
				<Stack spacing={4}>
					{/* General Info Section */}
					<Paper sx={{ p: 3, border: '1px solid #d5dbdb' }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#232f3e' }}>General Details</Typography>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12 }}>
								<TextField
									fullWidth
									label="Assessment Title"
									variant="outlined"
									size="small"
									value={generalInfo.title}
									onChange={(e) => setGeneralInfo({ ...generalInfo, title: e.target.value })}
									placeholder="e.g. Python Fundamentals Final"
								/>
							</Grid>
							<Grid size={{ xs: 12 }}>
								<TextField
									fullWidth
									label="Instructions / Description"
									multiline
									rows={2}
									size="small"
									value={generalInfo.description}
									onChange={(e) => setGeneralInfo({ ...generalInfo, description: e.target.value })}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									fullWidth
									label="Duration (Minutes)"
									type="number"
									size="small"
									value={generalInfo.duration_minutes}
									onChange={(e) => setGeneralInfo({ ...generalInfo, duration_minutes: parseInt(e.target.value) })}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									fullWidth
									label="Security Key"
									size="small"
									value={generalInfo.security_key}
									onChange={(e) => setGeneralInfo({ ...generalInfo, security_key: e.target.value })}
									helperText="Used by candidates to access the exam"
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									fullWidth
									label="Passing Percentage"
									type="number"
									size="small"
									value={generalInfo.pass_percentage}
									onChange={(e) => setGeneralInfo({ ...generalInfo, pass_percentage: parseInt(e.target.value) })}
								/>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<Box sx={{ p: 2, bgcolor: '#fdf3e7', border: '1px border #f5d7ba', borderRadius: 1 }}>
									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Stack direction="row" spacing={1} alignItems="center">
											<SecurityIcon sx={{ color: '#ec7211' }} />
											<Box>
												<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Safe Exam Browser (SEB) Mode</Typography>
												<Typography variant="caption" color="text.secondary">Enforce secure testing by requiring candidates to use SEB</Typography>
											</Box>
										</Stack>
										<FormControlLabel
											control={
												<Switch
													checked={generalInfo.include_seb}
													onChange={(e) => setGeneralInfo({ ...generalInfo, include_seb: e.target.checked })}
													color="warning"
												/>
											}
											label={generalInfo.include_seb ? "Required" : "Not Required"}
										/>
									</Stack>
									{generalInfo.include_seb && (
										<Box sx={{ mt: 2 }}>
											<TextField
												fullWidth
												label="SEB Config Key Hash"
												size="small"
												value={generalInfo.seb_config_key}
												onChange={(e) => setGeneralInfo({ ...generalInfo, seb_config_key: e.target.value })}
												placeholder="Enter Hash from SEB Config Tool"
												InputProps={{
													startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
												}}
												helperText="If provided, only SEB with this exact configuration can start the exam"
											/>
										</Box>
									)}
								</Box>
							</Grid>
						</Grid>
					</Paper>

					{/* Questions Section */}
					<Box>
						<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#232f3e' }}>Questions Bank</Typography>
							<Typography variant="caption" color="text.secondary">Total: {questions.length} | Marks: {questions.reduce((sum, q) => sum + (q.marks || 0), 0)}</Typography>
						</Stack>

						<Stack spacing={3}>
							{questions.map((q, qIndex) => (
								<Paper key={qIndex} sx={{ p: 3, border: '1px solid #d5dbdb' }}>
									<Stack direction="row" spacing={2} sx={{ mb: 2 }}>
										<Box sx={{
											bgcolor: '#007eb9',
											color: 'white',
											width: 32,
											height: 32,
											borderRadius: '50%',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											flexShrink: 0
										}}>
											{qIndex + 1}
										</Box>
										<TextField
											fullWidth
											label="Question Text"
											multiline
											rows={2}
											size="small"
											value={q.text}
											onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
										/>
										<IconButton color="error" onClick={() => removeQuestion(qIndex)} size="small">
											<DeleteIcon />
										</IconButton>
									</Stack>

									<Grid container spacing={3}>
										<Grid size={{ xs: 12, md: 6 }}>
											<FormControl fullWidth size="small">
												<InputLabel>Question Type</InputLabel>
												<Select
													value={q.type}
													label="Question Type"
													onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
												>
													<MenuItem value="MCQ">Multiple Choice (MCQ)</MenuItem>
													<MenuItem value="TF">True / False</MenuItem>
												</Select>
											</FormControl>
										</Grid>
										<Grid size={{ xs: 12, md: 6 }}>
											<TextField
												fullWidth
												label="Marks Weightage"
												type="number"
												size="small"
												value={q.marks}
												onChange={(e) => handleQuestionChange(qIndex, 'marks', parseFloat(e.target.value))}
											/>
										</Grid>

										{q.type === 'MCQ' && (
											<Grid size={{ xs: 12 }}>
												<Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>Options & Correct Answer</Typography>
												<Grid container spacing={2}>
													{(q.options as string[]).map((opt, oIndex) => (
														<Grid size={{ xs: 12, md: 6 }} key={oIndex}>
															<Stack direction="row" spacing={1} alignItems="center">
																<FormControlLabel
																	control={
																		<Radio
																			checked={q.correct_answer === opt && opt !== ''}
																			onChange={() => handleQuestionChange(qIndex, 'correct_answer', opt)}
																			size="small"
																		/>
																	}
																	label=""
																	sx={{ mr: 0 }}
																/>
																<TextField
																	fullWidth
																	placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
																	size="small"
																	value={opt}
																	onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
																/>
															</Stack>
														</Grid>
													))}
												</Grid>
											</Grid>
										)}

										{q.type === 'TF' && (
											<Grid size={{ xs: 12 }}>
												<Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>Correct Answer</Typography>
												<RadioGroup
													row
													value={q.correct_answer}
													onChange={(e) => handleQuestionChange(qIndex, 'correct_answer', e.target.value)}
												>
													<FormControlLabel value="True" control={<Radio />} label="True" />
													<FormControlLabel value="False" control={<Radio />} label="False" />
												</RadioGroup>
											</Grid>
										)}
									</Grid>
								</Paper>
							))}
						</Stack>

						<Button
							startIcon={<AddIcon />}
							onClick={addQuestion}
							sx={{ mt: 3, color: '#007eb9', fontWeight: 700 }}
						>
							Add Question
						</Button>
					</Box>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2, bgcolor: '#f2f3f3', borderTop: '1px solid #eaeded' }}>
				<Button onClick={onClose} sx={{ color: '#545b64', fontWeight: 700 }}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={submitting || !generalInfo.title.trim()}
					sx={{
						bgcolor: '#ff9900',
						color: '#232f3e',
						'&:hover': { bgcolor: '#ec7211' },
						fontWeight: 800,
						px: 4
					}}
				>
					{submitting ? 'Creating...' : 'Create Assessment'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AssessmentBuilder;
