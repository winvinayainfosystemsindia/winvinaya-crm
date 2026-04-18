import { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	Stack,
	Divider,
	Chip,
	useTheme,
	useMediaQuery
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
	Work as WorkIcon,
	Business as BusinessIcon,
	Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJobRoles } from '../../store/slices/jobRoleSlice';
import { 
	fetchMatchesForJobRole, 
	mapCandidate, 
	unmapCandidate, 
	clearMatches, 
	clearPlacementError,
	type CandidateMatchResult 
} from '../../store/slices/placementMappingSlice';
import useToast from '../../hooks/useToast';
import { type JobRole } from '../../models/jobRole';

// Modular Components
import JobRoleSelectionHeader from '../../components/placement/mapping/common/JobRoleSelectionHeader';
import JobRoleSpecifications from '../../components/placement/mapping/details/JobRoleSpecifications';
import CandidateMatchResults from '../../components/placement/mapping/table/CandidateMatchResults';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CandidateEmailDialog from '../../components/placement/mapping/dialogs/CandidateEmailDialog';
import placementEmailService from '../../services/placementEmailService';

const CandidateMapping = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const toast = useToast();

	const { list: jobRoles, loading: rolesLoading } = useAppSelector((state) => state.jobRoles);
	const { matches, loading, error: placementError } = useAppSelector((state) => state.placementMapping);

	const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);

	// Mapping Dialog State
	const [mapDialogOpen, setMapDialogOpen] = useState(false);
	const [unmapDialogOpen, setUnmapDialogOpen] = useState(false);
	const [candidateToMap, setCandidateToMap] = useState<CandidateMatchResult | null>(null);
	const [candidateToUnmap, setCandidateToUnmap] = useState<CandidateMatchResult | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// Email Dialog State
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	const [candidateForEmail, setCandidateForEmail] = useState<CandidateMatchResult | null>(null);
	const [sendingEmail, setSendingEmail] = useState(false);

	useEffect(() => {
		dispatch(fetchJobRoles({ skip: 0, limit: 100 }));
		return () => {
			dispatch(clearMatches());
		};
	}, [dispatch]);

	// Auto-display errors from slice
	useEffect(() => {
		if (placementError) {
			toast.error(placementError);
			dispatch(clearPlacementError());
		}
	}, [placementError, toast, dispatch]);

	const fetchMatches = useCallback(async (rolePId: string) => {
		dispatch(fetchMatchesForJobRole(rolePId));
	}, [dispatch]);

	useEffect(() => {
		if (selectedRole) {
			fetchMatches(selectedRole.public_id);
		} else {
			dispatch(clearMatches());
		}
	}, [selectedRole, fetchMatches, dispatch]);

	const handleMapCandidate = async () => {
		if (!candidateToMap || !selectedRole) return;
		setSubmitting(true);
		try {
			await dispatch(mapCandidate({
				candidate_id: candidateToMap.candidate_id,
				job_role_id: selectedRole.id!,
				match_score: candidateToMap.match_score,
				notes: ''
			})).unwrap();

			toast.success(`${candidateToMap.name} successfully mapped`);
			setMapDialogOpen(false);
		} catch (error: any) {
			toast.error(error || 'Failed to map candidate');
		} finally {
			setSubmitting(false);
		}
	};

	const handleUnmapCandidate = async () => {
		if (!candidateToUnmap || !selectedRole) return;
		setSubmitting(true);
		try {
			await dispatch(unmapCandidate({ 
				candidateId: candidateToUnmap.candidate_id, 
				jobRoleId: selectedRole.id! 
			})).unwrap();
			
			toast.success(`${candidateToUnmap.name} mapping removed`);
			setUnmapDialogOpen(false);
		} catch (error: any) {
			toast.error(error || 'Failed to remove mapping');
		} finally {
			setSubmitting(false);
		}
	};

	const handleSendEmail = async (data: { email: string; subject: string; message: string; document_ids: number[] }) => {
		if (!candidateForEmail || !candidateForEmail.mapping_id) return;
		setSendingEmail(true);
		try {
			await placementEmailService.sendCandidateProfile(candidateForEmail.mapping_id, {
				custom_email: data.email,
				custom_subject: data.subject,
				custom_message: data.message,
				document_ids: data.document_ids,
				mapping_ids: [candidateForEmail.mapping_id]
			});
			toast.success(`Profile sent successfully to ${data.email}`);
			setEmailDialogOpen(false);
		} catch (error: any) {
			toast.error(error.response?.data?.detail || 'Failed to send email');
		} finally {
			setSendingEmail(false);
		}
	};

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
			{/* AWS Professional Dark Header */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', pt: 2, pb: 4, mb: 0 }}>
				<Container maxWidth="xl">
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
						<Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
								<Typography variant="h4" sx={{ fontWeight: 300, letterSpacing: '-0.02em', fontSize: isMobile ? '1.5rem' : '2rem' }}>
									Candidate Match Making
								</Typography>
							</Box>
							<Typography variant="body2" sx={{ color: '#aab7bd', maxWidth: 600 }}>
								Enterprise-grade resource allocation using affinity-based candidate mapping and screening data.
							</Typography>
						</Box>
						<Box sx={{ minWidth: 320 }}>
							<JobRoleSelectionHeader
								jobRoles={jobRoles}
								selectedRole={selectedRole}
								onRoleChange={setSelectedRole}
								loading={rolesLoading}
							/>
						</Box>
					</Box>

					{selectedRole && (
						<Paper
							elevation={0}
							sx={{
								bgcolor: 'rgba(255, 255, 255, 0.05)',
								borderRadius: '2px',
								p: 2,
								border: '1px solid rgba(255, 255, 255, 0.1)',
								display: 'flex',
								flexWrap: 'wrap',
								gap: 4
							}}
						>
							<Box>
								<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Active Resource
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center">
									<WorkIcon sx={{ fontSize: 14, color: '#ff9900' }} />
									<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{selectedRole.title}</Typography>
								</Stack>
							</Box>
							<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
							<Box>
								<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Organization
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center">
									<BusinessIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
									<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{selectedRole.company?.name || 'N/A'}</Typography>
								</Stack>
							</Box>
							<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
							<Box>
								<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Resource Status
								</Typography>
								<Chip
									label={selectedRole.status.toUpperCase()}
									size="small"
									sx={{
										height: 20,
										fontSize: '0.65rem',
										fontWeight: 900,
										bgcolor: selectedRole.status === 'active' ? '#1d8102' : 'action.hover',
										color: 'white',
										borderRadius: '2px'
									}}
								/>
							</Box>
							<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
							<Box>
								<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Vacancies
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center">
									<GroupIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
									<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{selectedRole.no_of_vacancies || 0} Openings</Typography>
								</Stack>
							</Box>
						</Paper>
					)}
				</Container>
			</Box>

			<Container maxWidth="xl" sx={{ mt: 4 }}>
				{!selectedRole ? (
					<Box sx={{ mt: 4, textAlign: 'center', p: 10, bgcolor: 'background.paper', border: (t) => `1px dashed ${t.palette.divider}`, borderRadius: '2px' }}>
						<WorkIcon sx={{ fontSize: 56, color: 'divider', mb: 3 }} />
						<Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 1 }}>
							Awaiting Resource Selection
						</Typography>
						<Typography variant="body2" color="textSecondary">
							Please select a Job Role / Resource from the header to load matching algorithm results.
						</Typography>
					</Box>
				) : (
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 4 }}>
							<JobRoleSpecifications
								selectedRole={selectedRole}
								onViewDetails={(pid) => navigate(`/placement/job-roles/${pid}`)}
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 8 }}>
							<CandidateMatchResults
								matches={matches}
								loading={loading}
								onMapClick={(candidate) => {
									setCandidateToMap(candidate);
									setMapDialogOpen(true);
								}}
								onUnmapClick={(candidate) => {
									setCandidateToUnmap(candidate);
									setUnmapDialogOpen(true);
								}}
								onEmailClick={(candidate) => {
									setCandidateForEmail(candidate);
									setEmailDialogOpen(true);
								}}
							/>
						</Grid>
					</Grid>
				)}
			</Container>

			<ConfirmDialog
				open={mapDialogOpen}
				title="Confirm Candidate Mapping"
				message={`Are you sure you want to map ${candidateToMap?.name} to the resource "${selectedRole?.title}"? This will record the affinity score and notify the placement team.`}
				confirmText="Proceed with Mapping"
				onClose={() => setMapDialogOpen(false)}
				onConfirm={handleMapCandidate}
				loading={submitting}
				severity="info"
			/>
			<ConfirmDialog
				open={unmapDialogOpen}
				title="Remove Candidate Mapping"
				message={`Are you sure you want to remove ${candidateToUnmap?.name} from this resource? This will permanently delete the mapping record.`}
				confirmText="Remove Mapping"
				onClose={() => setUnmapDialogOpen(false)}
				onConfirm={handleUnmapCandidate}
				loading={submitting}
				severity="warning"
			/>

			{candidateForEmail && selectedRole && (
				<CandidateEmailDialog
					open={emailDialogOpen}
					onClose={() => setEmailDialogOpen(false)}
					onSend={handleSendEmail}
					mappingIds={candidateForEmail.mapping_id ? [candidateForEmail.mapping_id] : []}
					candidateNames={[candidateForEmail.name]}
					jobTitle={selectedRole.title}
					contactEmail={selectedRole.contact?.email || ''}
					contactName={selectedRole.contact?.full_name || 'Hiring Manager'}
					loading={sendingEmail}
				/>
			)}
		</Box>
	);
};

export default CandidateMapping;
