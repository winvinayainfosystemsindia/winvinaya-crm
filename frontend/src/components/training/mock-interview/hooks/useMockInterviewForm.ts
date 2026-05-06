import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../../store/store';
import { createMockInterview, updateMockInterview } from '../../../../store/slices/mockInterviewSlice';
import { createSkill } from '../../../../store/slices/skillSlice';
import { type Question, type Skill, type MockInterviewCreate } from '../../../../models/MockInterview';
import useToast from '../../../../hooks/useToast';

export const useMockInterviewForm = (batchId: number, onClose: () => void) => {
	const dispatch = useDispatch<AppDispatch>();
	const { user } = useSelector((state: RootState) => state.auth);
	const { currentMockInterview, loading: saveLoading } = useSelector((state: RootState) => state.mockInterviews);

	const defaultInterviewer = user?.full_name || user?.username || '';
	
	const [formData, setFormData] = useState<Partial<MockInterviewCreate>>({
		candidate_id: undefined,
		interviewer_name: defaultInterviewer,
		interview_date: new Date().toISOString(),
		interview_type: 'internal',
		status: 'pending',
		overall_rating: 0,
		feedback: '',
		start_time: new Date().toISOString(),
		end_time: undefined,
		duration_minutes: 0,
	});

	const [questions, setQuestions] = useState<Question[]>([]);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isPaused, setIsPaused] = useState(true);
	const timerRef = useRef<any>(null);

	const toggleTimer = useCallback(() => {
		setIsPaused(prev => !prev);
	}, []);

	useEffect(() => {
		if (currentMockInterview) {
			setFormData({
				candidate_id: currentMockInterview.candidate_id,
				interviewer_name: currentMockInterview.interviewer_name || '',
				interview_date: currentMockInterview.interview_date,
				interview_type: currentMockInterview.interview_type || 'internal',
				status: currentMockInterview.status,
				overall_rating: currentMockInterview.overall_rating || 0,
				feedback: currentMockInterview.feedback || '',
				start_time: currentMockInterview.start_time,
				end_time: currentMockInterview.end_time,
				duration_minutes: currentMockInterview.duration_minutes || 0,
			});
			setQuestions(currentMockInterview.questions || []);
			setSkills(currentMockInterview.skills || []);
			setElapsedSeconds((currentMockInterview.duration_minutes || 0) * 60);
		} else {
			const now = new Date().toISOString();
			setFormData({
				candidate_id: undefined,
				interviewer_name: defaultInterviewer,
				interview_date: now,
				status: 'pending',
				overall_rating: 0,
				feedback: '',
				start_time: now,
				end_time: undefined,
				duration_minutes: 0,
			});
			setQuestions([{ question: '', answer: '' }]);
			setSkills([{ skill: '', level: 'Beginner', rating: 5 }]);
			setElapsedSeconds(0);
			setIsPaused(true);

			// Start stopwatch for new interview
			timerRef.current = setInterval(() => {
				setIsPaused(paused => {
					if (!paused) {
						setElapsedSeconds(prev => prev + 1);
					}
					return paused;
				});
			}, 1000);
		}
		setErrors({});

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [currentMockInterview, defaultInterviewer]);

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

	const toast = useToast();

	const { aggregatedSkills: masterSkills } = useSelector((state: RootState) => state.skills);

	const handleSubmit = async () => {
		if (!validate()) {
			toast.error('Please fix the errors in the form');
			return;
		}

		const now = new Date().toISOString();
		const finalDuration = Math.ceil(elapsedSeconds / 60);

		// Handle new skills creation
		const newSkillsToAdd = skills
			.map(s => s.skill.trim())
			.filter(s => s && !masterSkills.includes(s));
		
		for (const skillName of Array.from(new Set(newSkillsToAdd))) {
			try {
				await dispatch(createSkill({ name: skillName, is_verified: false })).unwrap();
			} catch (e) {
				console.error(`Failed to create skill: ${skillName}`, e);
			}
		}

		const payload: MockInterviewCreate = {
			batch_id: batchId,
			candidate_id: formData.candidate_id!,
			interviewer_name: formData.interviewer_name!,
			interview_type: formData.interview_type || 'internal',
			status: formData.status!,
			overall_rating: formData.overall_rating!,
			feedback: formData.feedback!,
			questions: questions.filter(q => q.question.trim()),
			skills: skills.filter(s => s.skill.trim()),
			interview_date: formData.interview_date!,
			start_time: formData.start_time,
			end_time: currentMockInterview && !isPaused ? now : (formData.end_time || now),
			duration_minutes: finalDuration
		};

		try {
			if (currentMockInterview) {
				await dispatch(updateMockInterview({ id: currentMockInterview.id, data: payload })).unwrap();
				toast.success('Mock interview updated successfully');
			} else {
				await dispatch(createMockInterview(payload)).unwrap();
				toast.success('Mock interview created successfully');
			}
			onClose();
		} catch (error: any) {
			toast.error(error?.message || 'Failed to save mock interview');
		}
	};

	return {
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
	};
};

