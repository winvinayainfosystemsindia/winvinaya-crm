import React from 'react';
import TrainingModuleLayout from '../../components/training/layout/TrainingModuleLayout';
import AssessmentManagement from '../../components/training/online-assessment/AssessmentManagement';

const AssessmentMatrixPage: React.FC = () => {
	return (
		<TrainingModuleLayout
			title="Online Assessment Module"
			subtitle="Design, manage, and track candidate performance with auto-graded assessments."
		>
			{({ selectedBatch }) => (
				<AssessmentManagement batch={selectedBatch} />
			)}
		</TrainingModuleLayout>
	);
};

export default AssessmentMatrixPage;
