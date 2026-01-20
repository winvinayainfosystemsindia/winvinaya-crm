import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Stack,
	IconButton,
	Tabs,
	Tab,
	CircularProgress,
	Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { fetchFields } from '../../../store/slices/settingsSlice';
import type { CandidateCounselingCreate } from '../../../models/candidate';

// Tabs
import SkillAssessmentTab from './tabs/SkillAssessmentTab';
import WorkExperienceTab from './tabs/WorkExperienceTab';
import InterviewFeedbackTab from './tabs/InterviewFeedbackTab';
import CounselingInfoTab from './tabs/CounselingInfoTab';

const COMMON_SKILLS = [
	'Communication', 'Computer Basics', 'Typing', 'English', 'MS Excel',
	'MS Word', 'MS PowerPoint', 'Data Entry', 'Accounting', 'Tally'
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
	candidateWorkExperience?: any;
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
	candidateName,
	candidateWorkExperience
}) => {
	const dispatch = useAppDispatch();
	const user = useAppSelector((state) => state.auth.user);
	const dynamicFields = useAppSelector(state => state.settings.fields.counseling || []);
	const loadingFields = useAppSelector(state => state.settings.loading);

	const [tabValue, setTabValue] = useState(0);

	const [formData, setFormData] = useState<CandidateCounselingCreate>({
		skills: [],
		feedback: '',
		questions: [],
		status: 'pending',
		counselor_name: '',
		counseling_date: new Date().toISOString().split('T')[0],
		others: {},
		workexperience: []
	});

	useEffect(() => {
		if (open) {
			setTabValue(0);
			dispatch(fetchFields('counseling'));

			if (initialData) {
				setFormData({
					...initialData,
					skills: initialData.skills || [],
					questions: initialData.questions || [],
					others: initialData.others || {},
					workexperience: initialData.workexperience || [],
					counseling_date: initialData.counseling_date ? initialData.counseling_date.split('T')[0] : new Date().toISOString().split('T')[0]
				});
			} else {
				const defaultQuestions = PREDEFINED_QUESTIONS.map(q => ({
					question: q,
					answer: ''
				}));
				setFormData({
					skills: [],
					feedback: '',
					questions: defaultQuestions,
					status: 'pending',
					counselor_name: user ? (user.full_name || user.username) : '',
					counseling_date: new Date().toISOString().split('T')[0],
					others: {},
					workexperience: []
				});
			}
		}
	}, [initialData, open, user, dispatch]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleUpdateOtherField = (name: string, value: any) => {
		setFormData((prev: any) => ({
			...prev,
			others: {
				...prev.others,
				[name]: value
			}
		}));
	};

	const handleUpdateWorkExpField = (index: number, name: string, value: any) => {
		const newWorkExp = [...(formData.workexperience || [])];
		newWorkExp[index] = { ...newWorkExp[index], [name]: value };
		handleChange('workexperience', newWorkExp);
	};

	const handleAddWorkExp = () => {
		const newWorkExp = [
			...(formData.workexperience || []),
			{ job_title: '', company: '', years_of_experience: '', currently_working: false }
		];
		handleChange('workexperience', newWorkExp);
	};

	const handleRemoveWorkExp = (index: number) => {
		const newWorkExp = [...(formData.workexperience || [])];
		newWorkExp.splice(index, 1);
		handleChange('workexperience', newWorkExp);
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

	const handleSkillChange = (index: number, field: string, value: any) => {
		const newSkills: any = [...(formData.skills || [])];
		newSkills[index] = { ...newSkills[index], [field]: value };
		handleChange('skills', newSkills);
	};

	const handleQuestionChange = (index: number, field: string, value: string) => {
		const newQuestions: any = [...(formData.questions || [])];
		newQuestions[index] = { ...newQuestions[index], [field]: value };
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
						<Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
							{initialData ? 'Edit Candidate Counseling' : 'New Candidate Counseling'}
						</Typography>
						{candidateName && (
							<Typography variant="caption" sx={{ fontSize: '1rem', color: '#aab7b8' }}>Name: {candidateName}</Typography>
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
						<Tab label="1. Skill Assessment" />
						<Tab label="2. Work Experience" />
						<Tab label="3. Interview & Feedback" />
						<Tab label="4. Counseling Info" />
					</Tabs>
				</Box>

				<Box sx={{ px: 4, py: 2 }}>
					{loadingFields && tabValue === 2 ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
							<CircularProgress size={24} sx={{ color: '#ec7211' }} />
						</Box>
					) : (
						<>
							<TabPanel value={tabValue} index={0}>
								<SkillAssessmentTab
									formData={formData}
									onAddSkill={handleAddSkill}
									onRemoveSkill={handleRemoveSkill}
									onSkillChange={handleSkillChange}
									commonSkills={COMMON_SKILLS}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={1}>
								<WorkExperienceTab
									formData={formData}
									onAddWorkExp={handleAddWorkExp}
									onRemoveWorkExp={handleRemoveWorkExp}
									onWorkExpChange={handleUpdateWorkExpField}
									candidateWorkExperience={candidateWorkExperience}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={2}>
								<InterviewFeedbackTab
									formData={formData}
									onAddQuestion={handleAddQuestion}
									onRemoveQuestion={handleRemoveQuestion}
									onQuestionChange={handleQuestionChange}
									onFeedbackChange={(val) => handleChange('feedback', val)}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={3}>
								<CounselingInfoTab
									formData={formData}
									onFieldChange={handleChange}
									onUpdateOtherField={handleUpdateOtherField}
									dynamicFields={dynamicFields}
								/>
							</TabPanel>
						</>
					)}
				</Box>
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />
			<DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ color: '#545b64', fontWeight: 700, px: 3, textTransform: 'none' }}
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
