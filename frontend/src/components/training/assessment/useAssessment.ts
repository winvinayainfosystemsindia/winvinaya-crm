import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import trainingExtensionService from '../../../services/trainingExtensionService';
import userService from '../../../services/userService';
import type { TrainingBatch, CandidateAllocation, TrainingAssessment } from '../../../models/training';
import type { User } from '../../../models/user';
import { useAppSelector } from '../../../store/hooks';

export const useAssessment = (batch: TrainingBatch, allocations: CandidateAllocation[]) => {
	const { enqueueSnackbar } = useSnackbar();
	const user = useAppSelector((state) => state.auth.user);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [assessments, setAssessments] = useState<TrainingAssessment[]>([]);
	const [trainers, setTrainers] = useState<User[]>([]);

	// Form state for creating/editing an assessment event
	const [activeAssessmentName, setActiveAssessmentName] = useState('');
	const [activeDate, setActiveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
	const [activeMaxMarks, setActiveMaxMarks] = useState(100);
	const [activeCourses, setActiveCourses] = useState<string[]>([]);
	const [activeTrainerId, setActiveTrainerId] = useState<number | ''>('');
	const [activeDescription, setActiveDescription] = useState('');

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [assessmentData, userData] = await Promise.all([
				trainingExtensionService.getAssessments(batch.id),
				userService.getAll(0, 100)
			]);

			setAssessments(assessmentData);
			setTrainers(userData.items.filter(u => u.role === 'trainer' || u.role === 'admin' || u.role === 'manager'));

			const names = Array.from(new Set(assessmentData.map(a => a.assessment_name)));
			if (names.length > 0) {
				// We use a local function or memoized logic for initial selection
				const name = names[0];
				const firstMatch = assessmentData.find(a => a.assessment_name === name);
				if (firstMatch) {
					setActiveAssessmentName(name);
					setActiveDate(firstMatch.assessment_date);
					const coursesCount = Array.isArray(firstMatch.course_name) ? firstMatch.course_name.length : (firstMatch.course_name ? 1 : 1);
					setActiveMaxMarks(firstMatch.max_marks / (coursesCount || 1));
					setActiveCourses(Array.isArray(firstMatch.course_name) ? firstMatch.course_name : (firstMatch.course_name ? [firstMatch.course_name as any] : []));
					setActiveTrainerId(firstMatch.trainer_id || '');
					setActiveDescription(firstMatch.description || '');
				}
			} else {
				setActiveAssessmentName('New Assessment');
				if (batch.courses && batch.courses.length > 0) {
					const firstCourse = batch.courses[0];
					setActiveCourses([typeof firstCourse === 'string' ? firstCourse : firstCourse.name]);
				}
				if (user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'manager')) {
					setActiveTrainerId(user.id);
				}
			}
		} catch (error) {
			console.error('Failed to fetch data', error);
			enqueueSnackbar('Failed to load assessment data', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	}, [batch.id, batch.courses, user, enqueueSnackbar]);

	useEffect(() => {
		if (batch.id) {
			fetchData();
		}
	}, [batch.id, fetchData]);

	const handleSelectAssessment = useCallback((name: string) => {
		setActiveAssessmentName(name);
		const firstMatch = assessments.find(a => a.assessment_name === name);
		if (firstMatch) {
			setActiveDate(firstMatch.assessment_date);
			const coursesCount = Array.isArray(firstMatch.course_name) ? firstMatch.course_name.length : (firstMatch.course_name ? 1 : 1);
			setActiveMaxMarks(firstMatch.max_marks / (coursesCount || 1));
			setActiveCourses(Array.isArray(firstMatch.course_name) ? firstMatch.course_name : (firstMatch.course_name ? [firstMatch.course_name as any] : []));
			setActiveTrainerId(firstMatch.trainer_id || '');
			setActiveDescription(firstMatch.description || '');
		}
	}, [assessments]);

	const assessmentNames = useMemo(() => {
		return Array.from(new Set(assessments.map(a => a.assessment_name)));
	}, [assessments]);

	const handleMarkChange = useCallback((candidateId: number, field: keyof TrainingAssessment | 'remarks' | 'course_mark', value: any, courseName?: string) => {
		setAssessments(prev => {
			const existingIdx = prev.findIndex(a => a.candidate_id === candidateId && a.assessment_name === activeAssessmentName);
			const updated = [...prev];

			if (existingIdx >= 0) {
				if (field === 'remarks') {
					updated[existingIdx] = {
						...updated[existingIdx],
						others: { ...(updated[existingIdx].others || {}), remarks: value }
					};
				} else if (field === 'course_mark' && courseName) {
					const currentCourseMarks = updated[existingIdx].course_marks || {};
					const newCourseMarks = { ...currentCourseMarks, [courseName]: value };
					const totalMarks = Object.values(newCourseMarks).reduce((sum, m) => sum + (m as number), 0);
					updated[existingIdx] = {
						...updated[existingIdx],
						course_marks: newCourseMarks,
						marks_obtained: totalMarks
					};
				} else {
					updated[existingIdx] = { ...updated[existingIdx], [field]: value };
				}
			} else {
				const newRecord: TrainingAssessment = {
					batch_id: batch.id,
					candidate_id: candidateId,
					assessment_name: activeAssessmentName,
					assessment_date: activeDate,
					marks_obtained: 0,
					max_marks: activeMaxMarks,
					course_name: activeCourses,
					trainer_id: activeTrainerId || undefined,
					description: activeDescription,
					submission_date: format(new Date(), 'yyyy-MM-dd'),
					course_marks: {}
				};

				if (field === 'remarks') {
					newRecord.others = { remarks: value };
				} else if (field === 'course_mark' && courseName) {
					newRecord.course_marks = { [courseName]: value };
					newRecord.marks_obtained = value;
				} else {
					(newRecord as any)[field] = value;
				}
				updated.push(newRecord);
			}
			return updated;
		});
	}, [activeAssessmentName, activeDate, activeMaxMarks, activeCourses, activeTrainerId, activeDescription, batch.id]);

	const handleSave = async () => {
		if (!activeAssessmentName) {
			enqueueSnackbar('Assessment name is required', { variant: 'warning' });
			return;
		}

		setSaving(true);
		try {
			const assessmentsToSave = allocations.map(allocation => {
				const existing = assessments.find(a => a.candidate_id === allocation.candidate_id && a.assessment_name === activeAssessmentName);
				return {
					batch_id: batch.id,
					candidate_id: allocation.candidate_id,
					assessment_name: activeAssessmentName,
					assessment_date: activeDate,
					max_marks: activeMaxMarks * (activeCourses.length || 1),
					course_name: activeCourses,
					trainer_id: activeTrainerId || undefined,
					description: activeDescription,
					course_marks: existing?.course_marks || {},
					marks_obtained: existing?.marks_obtained || 0,
					submission_date: existing?.submission_date || activeDate,
					others: existing?.others || {}
				};
			});

			await trainingExtensionService.updateBulkAssessments(assessmentsToSave as any);
			enqueueSnackbar('Assessments saved successfully', { variant: 'success' });
			fetchData();
		} catch (error) {
			console.error('Failed to save assessments', error);
			enqueueSnackbar('Failed to save assessments', { variant: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteAssessment = async () => {
		if (!activeAssessmentName) return;
		if (!window.confirm(`Are you sure you want to delete the assessment "${activeAssessmentName}"? This will remove all marks for all students.`)) return;

		setSaving(true);
		try {
			await trainingExtensionService.deleteAssessment(batch.id, activeAssessmentName);
			enqueueSnackbar('Assessment deleted successfully', { variant: 'success' });
			setActiveAssessmentName('');
			fetchData();
		} catch (error) {
			console.error('Failed to delete assessment', error);
			enqueueSnackbar('Failed to delete assessment', { variant: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const stats = useMemo(() => {
		if (!activeAssessmentName) return { totalAssessments: assessmentNames.length, submittedCount: 0, pendingCount: allocations.length };

		const currentAssessments = assessments.filter(a => a.assessment_name === activeAssessmentName);
		const submittedCount = currentAssessments.length;
		const pendingCount = Math.max(0, allocations.length - submittedCount);

		return {
			totalAssessments: assessmentNames.length,
			submittedCount,
			pendingCount
		};
	}, [assessmentNames.length, activeAssessmentName, assessments, allocations.length]);

	return {
		loading,
		saving,
		assessments,
		trainers,
		activeAssessmentName,
		activeDate,
		activeMaxMarks,
		activeCourses,
		activeTrainerId,
		activeDescription,
		assessmentNames,
		stats,
		setActiveDate,
		setActiveCourses,
		setActiveTrainerId,
		setActiveMaxMarks,
		setActiveDescription,
		handleSelectAssessment,
		handleMarkChange,
		handleSave,
		handleDeleteAssessment,
		setActiveAssessmentName
	};
};
