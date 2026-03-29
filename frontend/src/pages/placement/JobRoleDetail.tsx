import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Container,
	Typography,
	Stack,
	Button,
	Tabs,
	Tab,
	useTheme,
	useMediaQuery,
	Divider,
	Paper,
	CircularProgress,
	Grid,
	Alert
} from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Business as BusinessIcon,
	LocationOn as LocationOnIcon,
	Person as PersonIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJobRoleById, updateJobRole, clearCurrentJobRole } from '../../store/slices/jobRoleSlice';
import { useSnackbar } from 'notistack';
import type { JobRoleUpdate } from '../../models/jobRole';

// Components
import PlacementStatusBadge from '../../components/placement/jobroles/common/PlacementStatusBadge';
import JobRoleFormDialog from '../../components/placement/jobroles/forms/JobRoleFormDialog';
import CandidateMappingTab from '../../components/placement/jobroles/details/CandidateMappingTab';

const JobRoleDetail: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const { publicId } = useParams<{ publicId: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { currentJobRole: jobRole, loading, error } = useAppSelector((state) => state.jobRoles);

	const [tabIndex, setTabIndex] = useState(0);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		if (publicId) {
			dispatch(fetchJobRoleById(publicId));
		}
		return () => {
			dispatch(clearCurrentJobRole());
		};
	}, [publicId, dispatch]);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setTabIndex(newValue);
	};

	const handleEditSubmit = async (data: any) => {
		if (!publicId) return;
		setFormLoading(true);
		try {
			await dispatch(updateJobRole({ publicId, jobRole: data as JobRoleUpdate })).unwrap();
			enqueueSnackbar('Job Role updated successfully', { variant: 'success' });
			setEditDialogOpen(false);
			dispatch(fetchJobRoleById(publicId));
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to update job role', { variant: 'error' });
		} finally {
			setFormLoading(false);
		}
	};

	if (loading && !jobRole) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
				<CircularProgress size={40} thickness={4} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Alert severity="error" variant="outlined" sx={{ borderRadius: 0, borderLeft: '4px solid #d91d11' }}>
					{error}
				</Alert>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/placement/job-roles')} sx={{ mt: 2, textTransform: 'none' }}>
					Back to Job Roles
				</Button>
			</Box>
		);
	}

	if (!jobRole) return null;

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>

				{/* Top Bar / Navigation */}
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
						Job Role Details
					</Typography>
					<Typography variant="body2" color="text.secondary">
						View the job role details and manage candidate mapping
					</Typography>
				</Box>

				{/* AWS Style Header */}
				<Box sx={{ bgcolor: '#232f3e', color: 'white', px: 3, py: 2 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
						<Box sx={{ mb: isMobile ? 2 : 0 }}>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
								<Typography variant="h4" sx={{ fontWeight: 500, fontSize: '1.75rem' }}>
									{jobRole.title}
								</Typography>
								<PlacementStatusBadge label={jobRole.status} status={jobRole.status} />
							</Stack>
							<Stack direction="row" spacing={3} sx={{ color: '#aab7b8', flexWrap: 'wrap', gap: 1 }}>
								<Stack direction="row" spacing={0.5} alignItems="center">
									<BusinessIcon sx={{ fontSize: 18 }} />
									<Typography variant="body2">{jobRole.company?.name || 'N/A'}</Typography>
								</Stack>
								<Stack direction="row" spacing={0.5} alignItems="center">
									<LocationOnIcon sx={{ fontSize: 18 }} />
									<Typography variant="body2">
										{jobRole.location?.cities?.join(', ') || jobRole.location?.states?.join(', ') || 'Remote'}
									</Typography>
								</Stack>
								<Stack direction="row" spacing={0.5} alignItems="center">
									<PersonIcon sx={{ fontSize: 18 }} />
									<Typography variant="body2">Owner: {jobRole.creator?.username || 'System'}</Typography>
								</Stack>
							</Stack>
						</Box>
						<Stack direction="row" spacing={1.5}>
							<Button
								variant="outlined"
								startIcon={<RefreshIcon />}
								onClick={() => dispatch(fetchJobRoleById(publicId!))}
								sx={{
									color: 'white',
									borderColor: '#aab7b8',
									textTransform: 'none',
									'&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
								}}
							>
								Refresh
							</Button>
							<Button
								variant="contained"
								startIcon={<EditIcon />}
								onClick={() => setEditDialogOpen(true)}
								sx={{
									bgcolor: 'white',
									color: '#232f3e',
									'&:hover': { bgcolor: '#f2f3f3' },
									textTransform: 'none',
									fontWeight: 700
								}}
							>
								Edit
							</Button>
						</Stack>
					</Box>
				</Box>

				{/* Tabs Section */}
				<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: 'white' }}>
					<Tabs
						value={tabIndex}
						onChange={handleTabChange}
						sx={{
							px: 3,
							'& .MuiTab-root': {
								textTransform: 'none',
								fontWeight: 500,
								minWidth: 120,
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							},
							'& .MuiTabs-indicator': { bgcolor: '#ec7211', height: 2 }
						}}
					>
						<Tab label="Details" id="tab-0" />
						<Tab label="Candidate Mapping" id="tab-1" />
					</Tabs>
				</Box>

				{/* Content Section */}
				<Box sx={{ py: 3 }}>
					{tabIndex === 0 && (
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 8 }}>
								<Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderTop: 'none' }}>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Description</Typography>
									<Typography variant="body1" sx={{ color: '#545b64', whiteSpace: 'pre-wrap' }}>
										{jobRole.description || 'No description provided.'}
									</Typography>

									<Divider sx={{ my: 3 }} />

									<Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Requirements</Typography>
									<Stack spacing={2}>
										<Box>
											<Typography variant="subtitle2" color="textSecondary">Skills</Typography>
											<Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
												{jobRole.requirements?.skills?.map((skill, index) => (
													<Paper key={index} variant="outlined" sx={{ px: 1.5, py: 0.5, bgcolor: '#f2f3f3', border: '1px solid #d5dbdb' }}>
														<Typography variant="caption" sx={{ fontWeight: 600 }}>{skill}</Typography>
													</Paper>
												)) || 'N/A'}
											</Stack>
										</Box>
										<Box>
											<Typography variant="subtitle2" color="textSecondary">Qualifications</Typography>
											<Typography variant="body2" sx={{ mt: 0.5 }}>
												{jobRole.requirements?.qualifications?.join(', ') || 'N/A'}
											</Typography>
										</Box>
										<Box>
											<Typography variant="subtitle2" color="textSecondary">Preferred Disabilities</Typography>
											<Typography variant="body2" sx={{ mt: 0.5 }}>
												{jobRole.requirements?.disability_preferred?.join(', ') || 'Any'}
											</Typography>
										</Box>
									</Stack>
								</Paper>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderTop: 'none', bgcolor: 'white' }}>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Overview</Typography>
									<Stack spacing={2.5}>
										<Box>
											<Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Vacancies</Typography>
											<Typography variant="body1" sx={{ fontWeight: 600 }}>{jobRole.no_of_vacancies || 0}</Typography>
										</Box>
										<Box>
											<Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Close Date</Typography>
											<Typography variant="body1" sx={{ fontWeight: 600 }}>{jobRole.close_date ? new Date(jobRole.close_date).toLocaleDateString() : 'N/A'}</Typography>
										</Box>
										<Box>
											<Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Workplace Type</Typography>
											<Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{jobRole.job_details?.workplace_type || 'N/A'}</Typography>
										</Box>
										<Box>
											<Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Job Type</Typography>
											<Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{jobRole.job_details?.job_type || 'N/A'}</Typography>
										</Box>
										<Box>
											<Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Salary Range</Typography>
											<Typography variant="body1" sx={{ fontWeight: 600 }}>
												{jobRole.salary_range ? `${jobRole.salary_range.currency} ${jobRole.salary_range.min} - ${jobRole.salary_range.max}` : 'N/A'}
											</Typography>
										</Box>
									</Stack>
								</Paper>
							</Grid>
						</Grid>
					)}

					{tabIndex === 1 && (
						<CandidateMappingTab jobRole={jobRole} />
					)}
				</Box>

			</Container>

			<JobRoleFormDialog
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				onSubmit={handleEditSubmit}
				jobRole={jobRole}
				loading={formLoading}
			/>
		</Box>
	);
};

export default JobRoleDetail;
