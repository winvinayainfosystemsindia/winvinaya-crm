import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../store/store';
import { createMockInterview, updateMockInterview } from '../../../store/slices/mockInterviewSlice';
import { type Question, type Skill, type MockInterviewCreate } from '../../../models/MockInterview';

export const useMockInterviewForm = (batchId: number, onClose: () => void) => {
	const dispatch = useDispatch<AppDispatch>();
	const { currentMockInterview, loading: saveLoading } = useSelector((state: RootState) => state.mockInterviews);

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
	}, [currentMockInterview]);

	const handleChange = useCallback((field: keyof MockInterviewCreate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			if (prev[field]) {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			}
			return prev;
		});
	}, []);

	const handleQuestionChange = useCallback((index: number, field: keyof Question, value: string) => {
		setQuestions((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], [field]: value };
			return next;
		});
	}, []);

	const addQuestion = useCallback(() => setQuestions((prev) => [...prev, { question: '', answer: '' }]), []);
	const removeQuestion = useCallback((index: number) => setQuestions((prev) => prev.filter((_, i) => i !== index)), []);

	const handleSkillChange = useCallback((index: number, field: keyof Skill, value: any) => {
		setSkills((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], [field]: value };
			return next;
		});
	}, []);

	const addSkill = useCallback(() => setSkills((prev) => [...prev, { skill: '', level: 'Beginner', rating: 5 }]), []);
	const removeSkill = useCallback((index: number) => setSkills((prev) => prev.filter((_, i) => i !== index)), []);

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
			interviewer_name: formData.interviewer_name!,
			status: formData.status!,
			overall_rating: formData.overall_rating!,
			feedback: formData.feedback!,
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

	return {
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
	};
};

