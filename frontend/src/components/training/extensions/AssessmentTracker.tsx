import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import trainingExtensionService from '../../../services/trainingExtensionService';
import userService from '../../../services/userService';
import type { TrainingBatch, CandidateAllocation, TrainingAssessment } from '../../../models/training';
import type { User } from '../../../models/user';

import { useAppSelector } from '../../../store/hooks';

// Sub-components
import AssessmentHeader from '../assessment/AssessmentHeader';
import AssessmentConfigPanel from '../assessment/AssessmentConfigPanel';
import AssessmentMatrix from '../assessment/AssessmentMatrix';
import AssessmentFormDialog from '../assessment/AssessmentFormDialog';

interface AssessmentTrackerProps {
	batch: TrainingBatch;
	allocations: CandidateAllocation[];
}

const AssessmentTracker: React.FC<AssessmentTrackerProps> = ({ batch, allocations }) => {
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

	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		fetchData();
	}, [batch.id]);

	const fetchData = async () => {
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
				handleSelectAssessment(names[0], assessmentData);
			} else {
				setActiveAssessmentName('New Assessment');
				if (batch.courses && batch.courses.length > 0) setActiveCourses([batch.courses[0]]);
				// Set default trainer to current user if they are a trainer/admin
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
	};

	const handleSelectAssessment = (name: string, data: TrainingAssessment[] = assessments) => {
		setActiveAssessmentName(name);
		const firstMatch = data.find(a => a.assessment_name === name);
		if (firstMatch) {
			setActiveDate(firstMatch.assessment_date);
			// For Sum logic: max_marks stored is Total Max.
			// So per-course max = max_marks / number of courses
			const coursesCount = Array.isArray(firstMatch.course_name) ? firstMatch.course_name.length : (firstMatch.course_name ? 1 : 1);
			setActiveMaxMarks(firstMatch.max_marks / (coursesCount || 1));

			setActiveCourses(Array.isArray(firstMatch.course_name) ? firstMatch.course_name : (firstMatch.course_name ? [firstMatch.course_name as any] : []));
			setActiveTrainerId(firstMatch.trainer_id || '');
			setActiveDescription(firstMatch.description || '');
		}
	};

	const assessmentNames = useMemo(() => {
		return Array.from(new Set(assessments.map(a => a.assessment_name)));
	}, [assessments]);

	const handleMarkChange = (candidateId: number, field: keyof TrainingAssessment | 'remarks' | 'course_mark', value: any, courseName?: string) => {
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
					// Calculate SUM: sum of all course marks
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
	};

	const handleSave = async () => {
		if (!activeAssessmentName) {
			enqueueSnackbar('Assessment name is required', { variant: 'warning' });
			return;
		}

		setSaving(true);
		try {
			// Prepare data for bulk update
			const assessmentsToSave = allocations.map(allocation => {
				const existing = assessments.find(a => a.candidate_id === allocation.candidate_id && a.assessment_name === activeAssessmentName);
				return {
					batch_id: batch.id,
					candidate_id: allocation.candidate_id,
					assessment_name: activeAssessmentName,
					assessment_date: activeDate,
					// Store TOTAL Max Marks = per_course_max * num_courses
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

	const handleCreateNew = () => {
		setActiveAssessmentName('');
		setActiveDescription('');

		// Default trainer to current user
		if (user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'manager')) {
			setActiveTrainerId(user.id);
		} else {
			setActiveTrainerId('');
		}

		setActiveCourses([]);
		setDialogOpen(true);
	};

	const handleDialogSubmit = (data: {
		assessmentName: string;
		courses: string[];
		description: string;
		date: string;
		maxMarks: number;
	}) => {
		setActiveAssessmentName(data.assessmentName);
		setActiveCourses(data.courses);
		setActiveDescription(data.description);
		setActiveDate(data.date);
		setActiveMaxMarks(data.maxMarks);
	};

	if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress thickness={2} size={40} /></Box>;

	return (
		<Box sx={{ p: 0 }}>
			{/* Top Header Section */}
			<Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #eaeded', borderRadius: '4px', bgcolor: 'white' }}>
				<Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#232f3e', mb: 2 }}>
					Weekly Assessments
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Manage and track student performance across courses for {batch.batch_name}
				</Typography>

				<AssessmentHeader
					assessmentNames={assessmentNames}
					activeAssessmentName={activeAssessmentName}
					onSelectAssessment={handleSelectAssessment}
					onCreateNew={handleCreateNew}
					onSave={handleSave}
					onDelete={handleDeleteAssessment}
					saving={saving}
				/>

				{activeAssessmentName && (
					<AssessmentConfigPanel
						assessmentName={activeAssessmentName}
						date={activeDate}
						courses={activeCourses}
						trainerId={activeTrainerId}
						maxMarks={activeMaxMarks}
						description={activeDescription}
						batch={batch}
						trainers={trainers}
						onDateChange={setActiveDate}
						onCoursesChange={setActiveCourses}
						onTrainerChange={setActiveTrainerId}
						onMaxMarksChange={setActiveMaxMarks}
						onDescriptionChange={setActiveDescription}
					/>
				)}
			</Paper>

			{/* Matrix Section */}
			<AssessmentMatrix
				allocations={allocations}
				assessments={assessments}
				activeAssessmentName={activeAssessmentName}
				activeCourses={activeCourses}
				activeMaxMarks={activeMaxMarks}
				activeDate={activeDate}
				onMarkChange={handleMarkChange}
			/>

			{/* New Assessment Dialog */}
			<AssessmentFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleDialogSubmit}
				batch={batch}
			/>
		</Box>
	);
};

export default AssessmentTracker;
