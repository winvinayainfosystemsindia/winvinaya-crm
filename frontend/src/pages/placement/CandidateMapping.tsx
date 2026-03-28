import { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Container,
	Grid,
	Typography
} from '@mui/material';
import { Work as WorkIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJobRoles } from '../../store/slices/jobRoleSlice';
import placementMappingService from '../../services/placementMappingService';
import { type CandidateMatchResult } from '../../services/placementMappingService';
import { type JobRole } from '../../models/jobRole';

// Modular Components
import { AWS_COLORS } from '../../components/placement/mapping/mappingTypes';
import MappingDashboardHeader from '../../components/placement/mapping/MappingDashboardHeader';
import JobRoleResourceSwitcher from '../../components/placement/mapping/JobRoleResourceSwitcher';
import JobRoleSpecifications from '../../components/placement/mapping/JobRoleSpecifications';
import CandidateMatchResults from '../../components/placement/mapping/CandidateMatchResults';
import ConfirmationMappingDialog from '../../components/placement/mapping/ConfirmationMappingDialog';

const CandidateMapping = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

	const { list: jobRoles, loading: rolesLoading } = useAppSelector((state) => state.jobRoles);

	const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
	const [matches, setMatches] = useState<CandidateMatchResult[]>([]);
	const [loading, setLoading] = useState(false);

	// Mapping Dialog State
	const [mapDialogOpen, setMapDialogOpen] = useState(false);
	const [candidateToMap, setCandidateToMap] = useState<CandidateMatchResult | null>(null);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		dispatch(fetchJobRoles({ skip: 0, limit: 100 }));
	}, [dispatch]);

	const fetchMatches = useCallback(async (rolePId: string) => {
		setLoading(true);
		try {
			const data = await placementMappingService.getMatchesForJobRole(rolePId);
			setMatches(data);
		} catch (error: any) {
			enqueueSnackbar('Failed to fetch matches', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	}, [enqueueSnackbar]);

	useEffect(() => {
		if (selectedRole) {
			fetchMatches(selectedRole.public_id);
		} else {
			setMatches([]);
		}
	}, [selectedRole, fetchMatches]);

	const handleMapCandidate = async (notes: string) => {
		if (!candidateToMap || !selectedRole) return;
		setSubmitting(true);
		try {
			await placementMappingService.mapCandidate({
				candidate_id: candidateToMap.candidate_id,
				job_role_id: selectedRole.id!,
				match_score: candidateToMap.match_score,
				notes: notes
			});

			enqueueSnackbar(`${candidateToMap.name} successfully mapped`, { variant: 'success' });
			setMapDialogOpen(false);
			fetchMatches(selectedRole.public_id);
		} catch (error: any) {
			enqueueSnackbar(error?.response?.data?.detail || 'Failed to map candidate', { variant: 'error' });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box sx={{ bgcolor: AWS_COLORS.background, minHeight: '100vh', pb: 6 }}>
			<Container maxWidth="xl" sx={{ mt: 3 }}>
				{/* 1. Header Section */}
				<MappingDashboardHeader />

				{/* 2. Resource Switcher Area */}
				<JobRoleResourceSwitcher
					jobRoles={jobRoles}
					selectedRole={selectedRole}
					loading={rolesLoading}
					onRoleChange={setSelectedRole}
				/>

				{!selectedRole ? (
					<Box sx={{ mt: 8, textAlign: 'center', p: 10, bgcolor: 'white', border: `1px dashed ${AWS_COLORS.divider}`, borderRadius: '2px' }}>
						<WorkIcon sx={{ fontSize: 56, color: AWS_COLORS.divider, mb: 3 }} />
						<Typography variant="h6" sx={{ color: AWS_COLORS.secondaryText, fontWeight: 400, mb: 1 }}>
							Awaiting Resource Selection
						</Typography>
						<Typography variant="body2" color="textSecondary">
							Please select a Job Role to load the matching algorithm results.
						</Typography>
					</Box>
				) : (
					<Grid container spacing={3}>
						{/* 3. Job Context Panel (Left) */}
						<Grid size={{ xs: 12, md: 4 }}>
							<JobRoleSpecifications
								selectedRole={selectedRole}
								onViewDetails={(pid) => navigate(`/placement/job-roles/${pid}`)}
							/>
						</Grid>

						{/* 4. Matching Results (Right) */}
						<Grid size={{ xs: 12, md: 8 }}>
							<CandidateMatchResults
								matches={matches}
								loading={loading}
								onMapClick={(candidate) => {
									setCandidateToMap(candidate);
									setMapDialogOpen(true);
								}}
							/>
						</Grid>
					</Grid>
				)}
			</Container>

			{/* 5. Enterprise Confirmation Dialog */}
			<ConfirmationMappingDialog
				open={mapDialogOpen}
				candidate={candidateToMap}
				jobRole={selectedRole}
				submitting={submitting}
				onClose={() => setMapDialogOpen(false)}
				onConfirm={handleMapCandidate}
			/>
		</Box>
	);
};

export default CandidateMapping;
