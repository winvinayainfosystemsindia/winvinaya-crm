import React, { useEffect } from 'react';
import { Typography, Box, useMediaQuery, useTheme, Container } from '@mui/material';
import CandidateStatCards from '../../components/candidates/stats/CandidateStatCards';
import CandidateTable from '../../components/candidates/table/CandidateTable';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateStats } from '../../store/slices/candidateSlice';

const CandidateList: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const theme = useTheme();

	const { stats } = useAppSelector((state) => state.candidates);
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
		<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
			<Box sx={{ mb: 4 }}>
				<Typography
					variant={isMobile ? "h5" : "h4"}
					component="h1"
					sx={{
						fontWeight: 500, // Aligned with theme/enterprise standards
						color: 'text.primary', // Removed hardcoded color
						mb: 0.5,
						letterSpacing: '-0.02em'
					}}
				>
					Candidate List
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Manage candidate registrations, profiles, and status
				</Typography>
			</Box>
			
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				<CandidateStatCards stats={stats || defaultStats} />
				<CandidateTable
					onEditCandidate={handleEditCandidate}
					onViewCandidate={handleViewCandidate}
				/>
			</Box>
		</Container>
	);
};

export default CandidateList;
