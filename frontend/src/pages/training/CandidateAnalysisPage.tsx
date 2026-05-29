import React from 'react';
import TrainingModuleLayout from '../../components/training/layout/TrainingModuleLayout';
import CandidateAnalysisList from '../../components/training/candidate-analysis/CandidateAnalysisList';

const CandidateAnalysisPage: React.FC = () => {
	return (
		<TrainingModuleLayout
			title="Candidate Performance Analysis"
			subtitle="Deep-dive into candidate readiness, custom skill scores, and placement recommendations."
		>
			{({ selectedBatch, allocations }) => (
				<CandidateAnalysisList batchId={selectedBatch.id} allocations={allocations} />
			)}
		</TrainingModuleLayout>
	);
};

export default CandidateAnalysisPage;
