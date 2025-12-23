import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Box,
	Stack,
	MenuItem,
	IconButton,
	Paper,
	Divider,
	Grid,
	Select,
	FormControl,
	InputLabel,
	Autocomplete
} from '@mui/material';
import { Delete, Add, Assignment, Psychology, VerifiedUser } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hooks';
import type { CandidateCounselingCreate, CounselingSkill, CounselingQuestion } from '../../../models/candidate';

const COMMON_SKILLS = [
	'Communication',
	'Computer Basics',
	'Typing',
	'English',
	'MS Excel',
	'MS Word',
	'MS PowerPoint',
	'Data Entry',
	'Accounting',
	'Tally'
];

const PREDEFINED_QUESTIONS = [
	'Tell us about yourself and your background?',
	'What are your career goals?',
	'What kind of job roles are you looking for?',
	'Are you available for immediate training/placement?',
	'Do you have any specific needs for workplace accessibility?'
];

interface CounselingFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: CandidateCounselingCreate) => void;
	initialData?: CandidateCounselingCreate;
	candidateName?: string;
}

const CounselingFormDialog: React.FC<CounselingFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	candidateName
}) => {
	const user = useAppSelector((state) => state.auth.user);
	const [formData, setFormData] = useState<CandidateCounselingCreate>({
		skills: [],
		feedback: '',
		questions: [],
		status: 'pending',
		counselor_name: '',
		counseling_date: new Date().toISOString().split('T')[0]
	});

	useEffect(() => {
		if (open) {
			if (initialData) {
				setFormData({
					...initialData,
					skills: initialData.skills || [],
					questions: initialData.questions || [],
					counseling_date: initialData.counseling_date ? initialData.counseling_date.split('T')[0] : new Date().toISOString().split('T')[0]
				});
			} else {
				// Initialize with empty questions
				const defaultQuestions: CounselingQuestion[] = PREDEFINED_QUESTIONS.map(q => ({
					question: q,
					answer: ''
				}));
				setFormData({
					skills: [],
					feedback: '',
					questions: defaultQuestions,
					status: 'pending',
					counselor_name: user ? (user.full_name || user.username) : '',
					counseling_date: new Date().toISOString().split('T')[0]
				});
			}
		}
	}, [initialData, open, user]);

	const handleChange = (field: keyof CandidateCounselingCreate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleAddSkill = () => {
		const newSkills = [...(formData.skills || []), { name: '', level: 'Beginner' as const }];
		handleChange('skills', newSkills);
	};

	const handleRemoveSkill = (index: number) => {
		const newSkills = [...(formData.skills || [])];
		newSkills.splice(index, 1);
		handleChange('skills', newSkills);
	};

	const handleSkillChange = (index: number, field: keyof CounselingSkill, value: string) => {
		const newSkills = [...(formData.skills || [])];
		newSkills[index] = { ...newSkills[index], [field]: value };
		handleChange('skills', newSkills);
	};

	const handleQuestionChange = (index: number, value: string) => {
		const newQuestions = [...(formData.questions || [])];
		newQuestions[index] = { ...newQuestions[index], answer: value };
		handleChange('questions', newQuestions);
	};

	const handleAddQuestion = () => {
		const newQuestions = [...(formData.questions || []), { question: '', answer: '' }];
		handleChange('questions', newQuestions);
	};

	const handleRemoveQuestion = (index: number) => {
		const newQuestions = [...(formData.questions || [])];
		newQuestions.splice(index, 1);
		handleChange('questions', newQuestions);
	};

	const handleSubmit = () => {
		const cleanedData = { ...formData };
		if (cleanedData.counseling_date && !cleanedData.counseling_date.includes('T')) {
			cleanedData.counseling_date = `${cleanedData.counseling_date}T00:00:00`;
		}
		onSubmit(cleanedData);
		onClose();
	};

	// Professional AWS-like styles
	const sectionStyle = {
		p: 3,
		border: '1px solid #d5dbdb',
		borderRadius: 0,
		bgcolor: '#ffffff',
		mb: 3
	};

	const headerStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		mb: 2,
		color: '#232f3e',
		fontWeight: 600
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			fullWidth
			scroll="paper"
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					border: '1px solid #d5dbdb'
				}
			}}
		>
			<DialogTitle sx={{ borderBottom: '1px solid #d5dbdb', bgcolor: '#fafafa', py: 2 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 300, color: '#232f3e' }}>
							{initialData ? 'Edit Counseling' : 'Candidate Counseling'}
						</Typography>
						{candidateName && (
							<Typography variant="body2" sx={{ fontWeight: 700, color: '#545b64', mt: 0.5 }}>
								Candidate: {candidateName}
							</Typography>
						)}
					</Box>
					<VerifiedUser color="primary" />
				</Box>
			</DialogTitle>

			<DialogContent sx={{ bgcolor: '#f2f3f3', pt: 3 }}>
				<Stack spacing={0}>
					{/* Counselor & Status Section */}
					<Paper elevation={0} sx={sectionStyle}>
						<Typography variant="subtitle1" sx={headerStyle}>
							<Assignment fontSize="small" /> Counseling Details
						</Typography>
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									label="Counselor Name"
									fullWidth
									size="small"
									value={formData.counselor_name || ''}
									onChange={(e) => handleChange('counselor_name', e.target.value)}
									placeholder="Enter your name"
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<TextField
									label="Date"
									type="date"
									size="small"
									fullWidth
									InputLabelProps={{ shrink: true }}
									value={formData.counseling_date ? formData.counseling_date.split('T')[0] : ''}
									onChange={(e) => handleChange('counseling_date', e.target.value)}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<FormControl fullWidth size="small">
									<InputLabel>Status</InputLabel>
									<Select
										value={formData.status || 'pending'}
										label="Status"
										onChange={(e) => handleChange('status', e.target.value)}
									>
										<MenuItem value="pending">Pending</MenuItem>
										<MenuItem value="selected">Selected</MenuItem>
										<MenuItem value="rejected">Rejected</MenuItem>
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Paper>

					{/* Skills Assessment Section */}
					<Paper elevation={0} sx={sectionStyle}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="subtitle1" sx={{ ...headerStyle, mb: 0 }}>
								<Psychology fontSize="small" /> Skills Assessment
							</Typography>
							<Button
								startIcon={<Add />}
								size="small"
								onClick={handleAddSkill}
								sx={{ textTransform: 'none', fontWeight: 600 }}
							>
								Add Skill
							</Button>
						</Box>
						<Divider sx={{ mb: 2 }} />
						{formData.skills && formData.skills.length > 0 ? (
							<Stack spacing={2}>
								{formData.skills.map((skill, index) => (
									<Grid container spacing={2} key={index} alignItems="center">
										<Grid size={{ xs: 12, md: 6 }}>
											<Autocomplete
												freeSolo
												options={COMMON_SKILLS}
												value={skill.name}
												onChange={(_e, val) => handleSkillChange(index, 'name', val || '')}
												onInputChange={(_e, val) => handleSkillChange(index, 'name', val)}
												renderInput={(params) => (
													<TextField {...params} label="Skill Name" size="small" fullWidth />
												)}
											/>
										</Grid>
										<Grid size={{ xs: 10, md: 5 }}>
											<FormControl fullWidth size="small">
												<InputLabel>Level</InputLabel>
												<Select
													value={skill.level}
													label="Level"
													onChange={(e) => handleSkillChange(index, 'level', e.target.value as any)}
												>
													<MenuItem value="Beginner">Beginner</MenuItem>
													<MenuItem value="Intermediate">Intermediate</MenuItem>
													<MenuItem value="Advanced">Advanced</MenuItem>
												</Select>
											</FormControl>
										</Grid>
										<Grid size={{ xs: 2, md: 1 }}>
											<IconButton color="error" size="small" onClick={() => handleRemoveSkill(index)}>
												<Delete fontSize="small" />
											</IconButton>
										</Grid>
									</Grid>
								))}
							</Stack>
						) : (
							<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
								No skills added yet. Click 'Add Skill' to start assessment.
							</Typography>
						)}
					</Paper>

					{/* Interview Questions Section */}
					<Paper elevation={0} sx={sectionStyle}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="subtitle1" sx={{ ...headerStyle, mb: 0 }}>
								<Psychology fontSize="small" /> Interview & Feedback
							</Typography>
							<Button
								startIcon={<Add />}
								size="small"
								onClick={handleAddQuestion}
								sx={{ textTransform: 'none', fontWeight: 600 }}
							>
								Add Custom Question
							</Button>
						</Box>
						<Divider sx={{ mb: 2 }} />
						<Stack spacing={3}>
							{formData.questions?.map((q, index) => (
								<Box key={index}>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
										<TextField
											variant="standard"
											fullWidth
											placeholder="Question"
											value={q.question}
											onChange={(e) => {
												const newQs = [...(formData.questions || [])];
												newQs[index].question = e.target.value;
												handleChange('questions', newQs);
											}}
											InputProps={{
												disableUnderline: q.question !== '',
												sx: { fontWeight: 600, fontSize: '0.9rem', color: '#545b64' }
											}}
										/>
										<IconButton size="small" onClick={() => handleRemoveQuestion(index)}>
											<Delete fontSize="small" />
										</IconButton>
									</Box>
									<TextField
										multiline
										rows={2}
										fullWidth
										size="small"
										value={q.answer}
										onChange={(e) => handleQuestionChange(index, e.target.value)}
										placeholder="Candidate's response..."
										sx={{ bgcolor: '#fafafa' }}
									/>
								</Box>
							))}
						</Stack>

						<Box sx={{ mt: 4 }}>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#545b64' }}>
								Overall Counselor Training/Placement Recommendation
							</Typography>
							<TextField
								multiline
								rows={4}
								fullWidth
								value={formData.feedback || ''}
								onChange={(e) => handleChange('feedback', e.target.value)}
								placeholder="Summarize your observations and recommended suitable training path..."
								sx={{ bgcolor: '#fafafa' }}
							/>
						</Box>
					</Paper>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ borderTop: '1px solid #d5dbdb', p: 2, bgcolor: '#fafafa' }}>
				<Button
					onClick={onClose}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						color: '#545b64',
						'&:hover': { bgcolor: 'transparent', color: '#232f3e' }
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' },
						boxShadow: 'none',
						borderRadius: 0,
						px: 3
					}}
				>
					Save Changes
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CounselingFormDialog;
