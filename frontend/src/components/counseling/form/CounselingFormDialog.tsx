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
import { Delete, Add, Close as CloseIcon } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hooks';
import type { CandidateCounselingCreate, CounselingSkill, CounselingQuestion } from '../../../models/candidate';
import { Tabs, Tab } from '@mui/material';

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

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`counseling-form-tabpanel-${index}`}
			aria-labelledby={`counseling-form-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3, pb: 2 }}>{children}</Box>}
		</div>
	);
}

const CounselingFormDialog: React.FC<CounselingFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	candidateName
}) => {
	const user = useAppSelector((state) => state.auth.user);
	const [tabValue, setTabValue] = useState(0);
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
			setTabValue(0);
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

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

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
	const sectionTitleStyle = {
		fontWeight: 700,
		fontSize: '0.875rem',
		color: '#545b64',
		mb: 2,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.025em'
	};

	const awsPanelStyle = {
		border: '1px solid #d5dbdb',
		borderRadius: '2px',
		p: 3,
		bgcolor: '#ffffff'
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
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
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" sx={{ fontSize: '1.25rem' }}>
							{initialData ? 'Edit Candidate Counseling' : 'New Candidate Counseling'}
						</Typography>
						{candidateName && (
							<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
								{candidateName}
							</Typography>
						)}
					</Box>
					<IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ p: 0, bgcolor: '#f2f3f3' }}>
				<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: '#ffffff' }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						variant="fullWidth"
						sx={{
							px: 2,
							'& .MuiTabs-indicator': { backgroundColor: '#ec7211', height: 3 },
							'& .MuiTab-root': {
								textTransform: 'none',
								fontWeight: 700,
								fontSize: '0.875rem',
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							}
						}}
					>
						<Tab label="1. Counseling Info" />
						<Tab label="2. Skills Assessment" />
						<Tab label="3. Interview & Feedback" />
					</Tabs>
				</Box>

				<Box sx={{ px: 4, py: 2 }}>
					<TabPanel value={tabValue} index={0}>
						<Paper elevation={0} sx={awsPanelStyle}>
							<Typography sx={sectionTitleStyle}>General Information</Typography>
							<Grid container spacing={4}>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										label="Counselor Name"
										fullWidth
										size="small"
										variant="outlined"
										value={formData.counselor_name || ''}
										onChange={(e) => handleChange('counselor_name', e.target.value)}
										placeholder="Enter your name"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										label="Date"
										type="date"
										size="small"
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										value={formData.counseling_date ? formData.counseling_date.split('T')[0] : ''}
										onChange={(e) => handleChange('counseling_date', e.target.value)}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<FormControl fullWidth size="small">
										<InputLabel>Status</InputLabel>
										<Select
											value={formData.status || 'pending'}
											label="Status"
											onChange={(e) => handleChange('status', e.target.value)}
											sx={{ borderRadius: '2px' }}
										>
											<MenuItem value="pending">Pending</MenuItem>
											<MenuItem value="selected">Selected</MenuItem>
											<MenuItem value="rejected">Rejected</MenuItem>
										</Select>
									</FormControl>
								</Grid>
							</Grid>
						</Paper>
					</TabPanel>

					<TabPanel value={tabValue} index={1}>
						<Paper elevation={0} sx={awsPanelStyle}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography sx={{ ...sectionTitleStyle, mb: 0 }}>Skills Assessment</Typography>
								<Button
									variant="outlined"
									size="small"
									startIcon={<Add />}
									onClick={handleAddSkill}
									sx={{
										borderRadius: '2px',
										textTransform: 'none',
										borderColor: '#d5dbdb',
										color: '#16191f',
										'&:hover': { bgcolor: '#f2f3f3', borderColor: '#545b64' }
									}}
								>
									Add Skill
								</Button>
							</Box>
							<Divider sx={{ mb: 3 }} />
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
														<TextField
															{...params}
															label="Skill Name"
															size="small"
															fullWidth
															sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
														/>
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
														sx={{ borderRadius: '2px' }}
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
					</TabPanel>

					<TabPanel value={tabValue} index={2}>
						<Stack spacing={3}>
							<Paper elevation={0} sx={awsPanelStyle}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
									<Typography sx={{ ...sectionTitleStyle, mb: 0 }}>Interview & Questions</Typography>
									<Button
										variant="outlined"
										size="small"
										startIcon={<Add />}
										onClick={handleAddQuestion}
										sx={{
											borderRadius: '2px',
											textTransform: 'none',
											borderColor: '#d5dbdb',
											color: '#16191f',
											'&:hover': { bgcolor: '#f2f3f3', borderColor: '#545b64' }
										}}
									>
										Add Custom Question
									</Button>
								</Box>
								<Divider sx={{ mb: 3 }} />
								<Stack spacing={3}>
									{formData.questions?.map((q, index) => (
										<Box key={index}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
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
														sx: { fontWeight: 600, fontSize: '0.875rem', color: '#16191f' }
													}}
												/>
												<IconButton size="small" onClick={() => handleRemoveQuestion(index)} sx={{ ml: 1 }}>
													<Delete fontSize="small" />
												</IconButton>
											</Box>
											<TextField
												multiline
												rows={2}
												fullWidth
												size="small"
												variant="outlined"
												value={q.answer}
												onChange={(e) => handleQuestionChange(index, e.target.value)}
												placeholder="Enter candidate's response..."
												sx={{
													'& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#fafafa' }
												}}
											/>
										</Box>
									))}
								</Stack>
							</Paper>

							<Paper elevation={0} sx={awsPanelStyle}>
								<Typography sx={sectionTitleStyle}>Training/Placement Recommendation</Typography>
								<TextField
									multiline
									rows={4}
									fullWidth
									variant="outlined"
									value={formData.feedback || ''}
									onChange={(e) => handleChange('feedback', e.target.value)}
									placeholder="Summarize your observations and recommended suitable training path..."
									sx={{
										'& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#fafafa' }
									}}
								/>
							</Paper>
						</Stack>
					</TabPanel>
				</Box>
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />
			<DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ color: '#16191f', fontWeight: 700, px: 3, textTransform: 'none' }}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					sx={{
						bgcolor: '#ec7211',
						color: '#ffffff',
						px: 4,
						py: 1,
						fontWeight: 700,
						borderRadius: '2px',
						textTransform: 'none',
						border: '1px solid #ec7211',
						'&:hover': { bgcolor: '#eb5f07', borderColor: '#eb5f07' },
						boxShadow: 'none'
					}}
				>
					{initialData ? 'Update Counseling' : 'Save Counseling'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CounselingFormDialog;
