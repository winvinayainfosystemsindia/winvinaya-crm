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
    Grid
} from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Business as BusinessIcon,
	LocationOn as LocationOnIcon,
	Person as PersonIcon
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
	const { currentJobRole: jobRole, loading } = useAppSelector((state) => state.jobRoles);

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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={40} thickness={4} sx={{ color: '#ec7211' }} />
            </Box>
        );
	}

	if (!jobRole) {
		return (
			<Container sx={{ py: 8, textAlign: 'center' }}>
				<Typography variant="h5" color="textSecondary">Job Role not found</Typography>
				<Button
					variant="text"
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/placement/job-roles')}
					sx={{ mt: 2 }}
				>
					Back to Job Roles
				</Button>
			</Container>
		);
	}

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh' }}>
			{/* Top Bar / Navigation */}
			<Box sx={{ bgcolor: 'white', borderBottom: '1px solid #d5dbdb', py: 1.5 }}>
				<Container maxWidth="xl">
					<Button
						variant="text"
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate('/placement/job-roles')}
						sx={{ color: '#545b64', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: 'transparent', color: '#16191f' } }}
					>
						Back to Job Roles
					</Button>
				</Container>
			</Box>

			{/* Service Header Section */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', py: 4 }}>
				<Container maxWidth="xl">
					<Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} spacing={2}>
						<Box>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
								<Typography variant="h4" sx={{ fontWeight: 300 }}>
									{jobRole.title}
								</Typography>
								<PlacementStatusBadge label={jobRole.status} status={jobRole.status} />
							</Stack>
							<Stack direction="row" spacing={3} sx={{ color: '#aab7b8', flexWrap: 'wrap' }}>
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
						<Button
							variant="contained"
							startIcon={<EditIcon />}
							onClick={() => setEditDialogOpen(true)}
							sx={{
								bgcolor: 'white',
								color: '#232f3e',
								'&:hover': { bgcolor: '#f2f3f3' },
								textTransform: 'none',
								fontWeight: 700,
								px: 3
							}}
						>
							Edit Job Role
						</Button>
					</Stack>
				</Container>
			</Box>

			{/* Tabs Section */}
			<Box sx={{ bgcolor: 'white', borderBottom: '1px solid #d5dbdb' }}>
				<Container maxWidth="xl">
					<Tabs
						value={tabIndex}
						onChange={handleTabChange}
						sx={{
							'& .MuiTabs-indicator': { bgcolor: '#ec7211', height: 3 },
							'& .MuiTab-root': {
								textTransform: 'none',
								fontWeight: 600,
								fontSize: '0.9rem',
								color: '#545b64',
								py: 2,
								'&.Mui-selected': { color: '#16191f' }
							}
						}}
					>
						<Tab label="Details" />
						<Tab label="Candidate Mapping" />
					</Tabs>
				</Container>
			</Box>

			{/* Content Section */}
			<Container maxWidth="xl" sx={{ py: 4 }}>
				{tabIndex === 0 && (
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 8 }}>
							<Paper variant="outlined" sx={{ p: 3, borderRadius: 0 }}>
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
							<Paper variant="outlined" sx={{ p: 3, borderRadius: 0, bgcolor: 'white' }}>
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
