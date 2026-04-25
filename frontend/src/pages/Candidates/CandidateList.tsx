import React, { useEffect } from 'react';
import CandidateStatCards from '../../components/candidates/stats/CandidateStatCards';
import CandidateTable from '../../components/candidates/table/CandidateTable';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateStats } from '../../store/slices/candidateSlice';
import ModuleLayout from '../../components/common/layout/ModuleLayout';

const CandidateList: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const { stats, loading } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		dispatch(fetchCandidateStats());
	}, [dispatch]);

	const defaultStats = {
		total: 0,
		male: 0,
		female: 0,
		others: 0,
		today: 0,
		weekly: [],
		screened: 0,
		not_screened: 0,
		total_counseled: 0,
		counseling_pending: 0,
		counseling_selected: 0,
		counseling_rejected: 0,
		docs_total: 0,
		docs_completed: 0,
		docs_pending: 0,
		files_collected: 0,
		files_to_collect: 0,
		candidates_fully_submitted: 0,
		candidates_partially_submitted: 0,
		candidates_not_submitted: 0,
		in_training: 0,
		moved_to_placement: 0,
		got_job: 0
	};

	const handleEditCandidate = (id: string) => {
		navigate(`/candidates/edit/${id}`);
	};

	const handleViewCandidate = (id: string) => {
		navigate(`/candidates/${id}`);
	};

	return (
		<ModuleLayout
			title="Candidate List"
			subtitle="Manage candidate registrations, profiles, and status"
			loading={loading}
		>
			<CandidateStatCards stats={stats || defaultStats} />
			<CandidateTable
				onEditCandidate={handleEditCandidate}
				onViewCandidate={handleViewCandidate}
			/>
		</ModuleLayout>
	);
};

export default CandidateList;
