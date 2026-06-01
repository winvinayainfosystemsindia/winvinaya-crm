import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import TrainingModuleLayout from '../../components/training/layout/TrainingModuleLayout';
import CandidateAnalysisList from '../../components/training/candidate-analysis/CandidateAnalysisList';

const CandidateAnalysisPage: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const isAllowed = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'trainer';

	if (!isAllowed) {
		return <Navigate to="/dashboard" replace />;
	}

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
