import React, { useState } from 'react';
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import type { TrainingBatch, CandidateAllocation } from '../../../models/training';
import { useAssessment } from './useAssessment';

// Sub-components
import AssessmentHeader from './AssessmentHeader';
import AssessmentConfigPanel from './AssessmentConfigPanel';
import AssessmentMatrix from './AssessmentMatrix';
import AssessmentFormDialog from './AssessmentFormDialog';

interface AssessmentTrackerProps {
	batch: TrainingBatch;
	allocations: CandidateAllocation[];
}

const AssessmentTracker: React.FC<AssessmentTrackerProps> = ({ batch, allocations }) => {
	const {
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
	} = useAssessment(batch, allocations);

	const [dialogOpen, setDialogOpen] = useState(false);

	const handleCreateNew = () => {
		setActiveAssessmentName('');
		setActiveDescription('');
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
