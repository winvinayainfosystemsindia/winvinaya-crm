import React from 'react';
import TrainingModuleLayout from '../../components/training/layout/TrainingModuleLayout';
import AssessmentTracker from '../../components/training/assessment/AssessmentTracker';

const AssessmentMatrixPage: React.FC = () => {
	return (
		<TrainingModuleLayout
			title="Assessment Matrix"
			subtitle="Manage and monitor weekly assessment performance with enterprise-grade precision."
		>
			{({ selectedBatch, allocations }) => (
				<AssessmentTracker batch={selectedBatch} allocations={allocations} />
			)}
		</TrainingModuleLayout>
	);
};

export default AssessmentMatrixPage;
