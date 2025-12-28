import React, { useEffect } from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import CandidateStatCards from '../../components/candidates/CandidateStatCards';
import CandidateTable from '../../components/candidates/CandidateTable';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateStats } from '../../store/slices/candidateSlice';

const CandidateList: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const { stats } = useAppSelector((state) => state.candidates);

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
		docs_pending: 0
	};

	const handleAddCandidate = () => {
		// For now, navigate to the existing registration page
		// Or ideally open a dialog for admin creation
		navigate('/candidate-registration');
	};

	const handleEditCandidate = (id: string) => {
		console.log('Edit candidate', id);
		// TODO: Implement edit functionality or navigation
	};

	const handleViewCandidate = (id: string) => {
		navigate(`/candidates/${id}`);
	};

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
				{/* Page Header */}
				<Box sx={{ mb: 3 }}>
					<Typography
						variant={isMobile ? "h5" : "h4"}
						component="h1"
						sx={{
							fontWeight: 300,
							color: 'text.primary',
							mb: 0.5
						}}
					>
						Candidate List
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage candidate registrations, profiles, and status
					</Typography>
				</Box>

				{/* Stat Cards Section */}
				<CandidateStatCards stats={stats || defaultStats} />

				{/* Candidate Table */}
				<CandidateTable
					onAddCandidate={handleAddCandidate}
					onEditCandidate={handleEditCandidate}
					onViewCandidate={handleViewCandidate}
				/>
			</Container>
		</Box>
	);
};

export default CandidateList;
