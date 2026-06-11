import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog,
	Box,
	CircularProgress,
	Button,
	Chip,
	alpha
} from '@mui/material';
import { Description as DescriptionIcon, AutoAwesome as AIIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { fetchFields, fetchSystemSettings } from '../../../store/slices/settingsSlice';
import type { CandidateCounselingCreate, WorkExperience, CandidateDocument } from '../../../models/candidate';
import useToast from '../../../hooks/useToast';
import { extractCandidateData } from '../../../store/slices/aiSlice';

import EnterpriseForm, { type FormStep } from '../../common/form/EnterpriseForm';

// Tabs
import SkillAssessmentTab from './tabs/SkillAssessmentTab';
import WorkExperienceTab from './tabs/WorkExperienceTab';
import InterviewAssessmentTab from './tabs/InterviewAssessmentTab';
import JobRecommendationsTab from './tabs/JobRecommendationsTab';
import CounselingInfoTab from './tabs/CounselingInfoTab';
import { useDateTime } from '../../../hooks/useDateTime';

const PREDEFINED_QUESTIONS = [
	'Tell us about yourself and your background?'
];

interface CounselingFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: CandidateCounselingCreate) => void;
	initialData?: CandidateCounselingCreate;
	candidateName?: string;
	candidateWorkExperience?: WorkExperience;
	candidateDocuments?: CandidateDocument[];
}

const CounselingFormDialog: React.FC<CounselingFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	candidateName,
	candidateWorkExperience,
	candidateDocuments = []
}) => {
	const dispatch = useAppDispatch();
	const user = useAppSelector((state) => state.auth.user);
	const loadingFields = useAppSelector(state => state.settings.loading);
	const toast = useToast();
	const [showErrors, setShowErrors] = useState(false);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [extracting, setExtracting] = useState(false);
	const { formatDate } = useDateTime();

	useEffect(() => {
		if (open) {
			setIsInitialLoading(true);
		}
	}, [open]);

	useEffect(() => {
		if (!loadingFields) {
			setIsInitialLoading(false);
		}
	}, [loadingFields]);

	const [formData, setFormData] = useState<CandidateCounselingCreate>({
		skills: [],
		feedback: '',
		questions: [],
		status: 'pending',
		counselor_name: '',
		counseling_date: new Date().toISOString().split('T')[0],
		others: {},
		workexperience: [],
		suitable_job_roles: [],
		assigned_to: [],
		remarks: ''
	});

	useEffect(() => {
		if (open) {
			dispatch(fetchFields('counseling'));
			dispatch(fetchSystemSettings());

			if (initialData) {
				const othersValues = initialData.others || {};
				setFormData({
					...initialData,
					skills: (initialData.skills || []).map(s => ({
						name: s.name || '',
						level: s.level || 'Beginner'
					})),
					questions: initialData.questions || [],
					others: initialData.others || {},
					workexperience: initialData.workexperience || [],
					counseling_date: initialData.counseling_date ? initialData.counseling_date.split('T')[0] : new Date().toISOString().split('T')[0],
					status: initialData.status || 'pending',
					suitable_job_roles: initialData.suitable_job_roles || [],
					assigned_to: Array.isArray(initialData.assigned_to) ? initialData.assigned_to : 
								(initialData.assigned_to ? [initialData.assigned_to] : 
								(Array.isArray(othersValues.assigned_to) ? othersValues.assigned_to : 
								(othersValues.assigned_to ? [othersValues.assigned_to] : []))),
					remarks: initialData.remarks || othersValues.remarks || ''
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
					workexperience: [],
					suitable_job_roles: [],
					assigned_to: [],
					remarks: ''
				});
			}
			setShowErrors(false);
		}
	}, [initialData, open, user, dispatch]);

	const handleChange = (field: string, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleUpdateOtherField = (name: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			others: {
				...prev.others,
				[name]: value
			}
		}));
	};

	const handleUpdateWorkExpField = (index: number, name: string, value: unknown) => {
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

	const handleSkillChange = (index: number, field: string, value: unknown) => {
		const newSkills = [...(formData.skills || [])];
		newSkills[index] = { ...newSkills[index], [field]: value } as { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' };
		handleChange('skills', newSkills);
	};

	const handleQuestionChange = (index: number, field: string, value: string) => {
		const newQuestions = [...(formData.questions || [])];
		newQuestions[index] = { ...newQuestions[index], [field]: value } as { question: string; answer: string };
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

	const handleMagicFill = async () => {
		if (!resumeDoc) {
			toast.info('Please upload a resume first to use Magic Fill.');
			return;
		}

		setExtracting(true);
		try {
			const result = await dispatch(extractCandidateData({ documentId: resumeDoc.id })).unwrap();
			const aiData = result.data;

			// Populate Work Experience
			const aiWorkExp = (aiData.experience_history || aiData.work_experience || []).map((exp: any) => ({
				job_title: exp.job_title || exp.role || '',
				company: exp.company || exp.employer || '',
				years_of_experience: exp.duration || exp.years || '',
				currently_working: exp.currently_working || false
			}));

			// If experience_history is empty, but we have years of experience
			const finalWorkExp = aiWorkExp.length > 0 ? aiWorkExp : (
				aiData.experience?.years ? [{
					job_title: 'Previous Role',
					company: 'Previous Company',
					years_of_experience: `${aiData.experience.years} years`,
					currently_working: false
				}] : []
			);

			// Populate Questions: Generate 3-4 custom questions based on candidate's skills/experience
			const aiQuestionsList = aiData.interview_questions || [];
			const mappedQuestions = aiQuestionsList.map((q: string) => ({
				question: q,
				answer: ''
			}));

			// Always prepend or append the default "Tell us about yourself..." question
			const hasBioQuestion = (formData.questions || []).some(q => q.question.toLowerCase().includes('about yourself'));
			const defaultQuestions = hasBioQuestion ? [] : [{
				question: 'Tell us about yourself and your background?',
				answer: ''
			}];

			setFormData(prev => ({
				...prev,
				workexperience: finalWorkExp,
				questions: [...defaultQuestions, ...mappedQuestions]
			}));

			toast.success('Magic Fill completed! AI extracted work experience and generated custom interview questions.');
		} catch (error: any) {
			toast.error(error || 'AI Extraction failed. Please try again or fill manually.');
		} finally {
			setExtracting(false);
		}
	};

	const handleSubmit = () => {
		const userRole = user?.role || '';
		const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'sourcing';
		
		// Validation for Assignment/Remarks (Manager/Admin Only)
		if (isManagerOrAdmin && (!formData.assigned_to || formData.assigned_to.length === 0) && !formData.remarks) {
			setShowErrors(true);
			return;
		}

		const cleanedData = { ...formData };
		if (cleanedData.counseling_date && !cleanedData.counseling_date.includes('T')) {
			cleanedData.counseling_date = `${cleanedData.counseling_date}T00:00:00`;
		}
		onSubmit(cleanedData);
		onClose();
	};

	const steps: FormStep[] = useMemo(() => [
		{
			label: 'Work Experience',
			content: (
				<WorkExperienceTab
					formData={formData}
					onAddWorkExp={handleAddWorkExp}
					onRemoveWorkExp={handleRemoveWorkExp}
					onWorkExpChange={handleUpdateWorkExpField}
					candidateWorkExperience={candidateWorkExperience}
				/>
			)
		},
		{
			label: 'Interview Assessment',
			content: (
				<InterviewAssessmentTab
					formData={formData}
					onAddQuestion={handleAddQuestion}
					onRemoveQuestion={handleRemoveQuestion}
					onQuestionChange={handleQuestionChange}
				/>
			)
		},
		{
			label: 'Skills',
			content: (
				<SkillAssessmentTab
					formData={formData}
					onAddSkill={handleAddSkill}
					onRemoveSkill={handleRemoveSkill}
					onSkillChange={handleSkillChange}
					onSkillsAutoPopulate={(skills) => handleChange('skills', skills)}
				/>
			)
		},
		{
			label: 'Job Recommendation & Remarks',
			content: (
				<JobRecommendationsTab
					formData={formData}
					onFeedbackChange={(val) => handleChange('feedback', val)}
					onJobRolesChange={(roles) => handleChange('suitable_job_roles', roles)}
				/>
			)
		},
		{
			label: 'Counseling Info',
			content: (
				<CounselingInfoTab
					formData={formData}
					onFieldChange={handleChange}
					onUpdateOtherField={handleUpdateOtherField}
					showErrors={showErrors}
				/>
			)
		}
	], [formData, user, showErrors]);

	const counselorName = initialData?.counselor_name || user?.full_name || user?.username || '—';
	const dateString = formatDate(formData.counseling_date || new Date());

	const subtitle = `${candidateName || 'New Candidate'} • Counselor: ${counselorName} • Date: ${dateString}`;

	// Find the best resume document to display
	const resumeDoc = useMemo(() => {
		if (!candidateDocuments || candidateDocuments.length === 0) return null;
		
		// Priority logic for resume selection (Active Trainer -> Any Trainer -> Active Candidate -> Any Candidate)
		return (
			candidateDocuments.find(d => 
				(d.document_type === 'resume' || d.document_type?.toLowerCase().includes('resume')) && 
				d.document_source === 'trainer' && 
				d.is_active
			) ||
			candidateDocuments.find(d => 
				(d.document_type === 'resume' || d.document_type?.toLowerCase().includes('resume')) && 
				d.document_source === 'trainer'
			) ||
			candidateDocuments.find(d => 
				(d.document_type === 'resume' || d.document_type?.toLowerCase().includes('resume')) && 
				d.is_active
			) ||
			candidateDocuments.find(d => 
				(d.document_type === 'resume' || d.document_type?.toLowerCase().includes('resume'))
			)
		);
	}, [candidateDocuments]);

	const handleViewResume = async () => {
		if (!resumeDoc) return;
		try {
			const { documentService } = await import('../../../services/candidateService');
			const blob = await documentService.download(resumeDoc.id);
			const url = window.URL.createObjectURL(blob);
			window.open(url, '_blank');
			setTimeout(() => window.URL.revokeObjectURL(url), 1000);
		} catch (error) {
			console.error('Failed to view document:', error);
		}
	};

	const headerActions = (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
			{resumeDoc ? (
				<>
					<Button
						size="small"
						variant="contained"
						color="secondary"
						startIcon={<AIIcon sx={{ fontSize: 14 }} />}
						onClick={handleMagicFill}
						disabled={extracting}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							fontSize: '0.72rem',
							borderRadius: '4px',
							py: 0.5,
							px: 1.5,
							boxShadow: 'none',
							'&:hover': {
								boxShadow: 'none'
							}
						}}
					>
						{extracting ? 'Extracting...' : 'Magic Fill'}
					</Button>
					<Button
						size="small"
						variant="outlined"
						color="primary"
						startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
						onClick={handleViewResume}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							fontSize: '0.72rem',
							borderRadius: '4px',
							py: 0.5,
							px: 1.5,
							bgcolor: alpha('#004de6', 0.05),
							'&:hover': {
								bgcolor: alpha('#004de6', 0.1)
							}
						}}
					>
						View Resume
					</Button>
				</>
			) : (
				<Chip
					label="No resume found for this candidate"
					size="small"
					variant="outlined"
					sx={{
						fontSize: '0.72rem',
						fontWeight: 600,
						color: 'text.secondary',
						borderColor: 'divider',
						borderRadius: '4px',
						bgcolor: '#f8fafc'
					}}
				/>
			)}
		</Box>
	);

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (reason === 'backdropClick') return;
				onClose();
			}}
			disableEscapeKeyDown
			maxWidth="lg"
			fullWidth
			PaperProps={{ sx: { borderRadius: '4px', bgcolor: 'transparent', boxShadow: 'none' } }}
		>
			{isInitialLoading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 8, bgcolor: 'white', borderRadius: '4px' }}>
					<CircularProgress />
				</Box>
			) : (
				<EnterpriseForm
					title="Candidate Counseling"
					subtitle={subtitle}
					mode={initialData ? 'edit' : 'create'}
					steps={steps}
					onSave={handleSubmit}
					onCancel={onClose}
					saveButtonText={initialData ? 'Update Counseling' : 'Save Counseling'}
					headerActions={headerActions}
				/>
			)}
		</Dialog>
	);
};

export default CounselingFormDialog;
