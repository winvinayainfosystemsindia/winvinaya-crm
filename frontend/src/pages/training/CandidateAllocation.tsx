import React, { useState, useEffect } from 'react';
import {
	Box,
	Container,
	Typography,
	useTheme,
	useMediaQuery,
	Paper,
	Autocomplete,
	TextField,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	IconButton,
	Grid,
	CircularProgress,
	Select,
	MenuItem,
	FormControl,
	Tabs,
	Tab,
	Divider,
	Tooltip,
	Fade
} from '@mui/material';
import {
	PersonAdd as PersonAddIcon,
	Delete as DeleteIcon,
	School as SchoolIcon,
	Dashboard as DashboardIcon,
	People as PeopleIcon,
	AssignmentInd as AssignmentIcon,
	EventAvailable as AttendanceIcon,
	Assessment as AssessmentTabIcon,
	Psychology as MockInterviewIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	fetchTrainingBatches,
	fetchAllocations,
	updateAllocationStatus,
	removeAllocation
} from '../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../models/training';
import AllocateCandidateDialog from '../../components/training/form/AllocateCandidateDialog';
import AttendanceTracker from '../../components/training/extensions/AttendanceTracker';
import AssessmentTracker from '../../components/training/extensions/AssessmentTracker';
import MockInterviewManager from '../../components/training/extensions/MockInterviewManager';
import { useSnackbar } from 'notistack';

const ALLOCATION_STATUSES = [
	'allocated',
	'training',
	'completed',
	'dropout',
	'not interested'
];

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

const TabPanel = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`allocation-tabpanel-${index}`}
			aria-labelledby={`allocation-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ py: 3 }}>
					{children}
				</Box>
			)}
		</div>
	);
};

const CandidateAllocation: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

	const { batches, allocations, loading } = useAppSelector((state) => state.training);
	const [selectedBatch, setSelectedBatch] = useState<TrainingBatch | null>(null);
	const [tabValue, setTabValue] = useState(0);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

	useEffect(() => {
		dispatch(fetchTrainingBatches({ limit: 1000 }));
	}, [dispatch]);

	useEffect(() => {
		if (selectedBatch) {
			dispatch(fetchAllocations(selectedBatch.public_id));
		}
	}, [selectedBatch, dispatch]);

	const handleBatchChange = (_event: any, newValue: TrainingBatch | null) => {
		setSelectedBatch(newValue);
		setTabValue(newValue ? 1 : 0); // Open candidate list by default when batch selected
	};

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'planned': return '#2575fc';
			case 'running': return '#ff9900';
			case 'closed': return '#5f6368';
			default: return '#5f6368';
		}
	};

	const getAllocationStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'completed': return '#2e7d32';
			case 'dropout': return '#d32f2f';
			case 'not interested': return '#757575';
			case 'training': return '#0288d1';
			default: return '#fb8c00';
		}
	};

	const handleStatusChange = async (publicId: string, newStatus: string) => {
		setUpdatingStatus(publicId);
		try {
			await dispatch(updateAllocationStatus({ publicId, status: newStatus })).unwrap();
			enqueueSnackbar('Status updated successfully', { variant: 'success' });
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to update status', { variant: 'error' });
		} finally {
			setUpdatingStatus(null);
		}
	};

	const handleRemove = async (publicId: string, candidateName: string) => {
		if (window.confirm(`Are you sure you want to remove ${candidateName} from this batch?`)) {
			try {
				await dispatch(removeAllocation(publicId)).unwrap();
				enqueueSnackbar('Candidate removed from batch', { variant: 'success' });
			} catch (error: any) {
				enqueueSnackbar(error || 'Failed to remove candidate', { variant: 'error' });
			}
		}
	};

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: isMobile ? 2 : 3 }}>
			<Container maxWidth="xl" sx={{ px: isMobile ? 1 : { sm: 2, md: 3 } }}>
				{/* Page Header */}
				<Box sx={{ mb: 4 }}>
					<Typography
						variant={isMobile ? "h5" : "h4"}
						component="h1"
						sx={{
							fontWeight: 300,
							color: '#232f3e',
							mb: 0.5
						}}
					>
						Batch Allocation Manager
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Experience-driven candidate assignment and progress tracking
					</Typography>
				</Box>

				{/* Batch Selection Strip */}
				<Paper
					elevation={0}
					sx={{
						p: 3,
						mb: 4,
						borderRadius: '4px',
						border: '1px solid #d5dbdb',
						display: 'flex',
						flexDirection: isMobile ? 'column' : 'row',
						alignItems: isMobile ? 'stretch' : 'center',
						gap: 3,
						background: 'linear-gradient(to right, #ffffff, #fcfcfc)'
					}}
				>
					<Box sx={{ flexGrow: 1 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, color: '#545b64', display: 'block', mb: 1, textTransform: 'uppercase' }}>
							Select Training Batch
						</Typography>
						<Autocomplete
							options={batches}
							getOptionLabel={(option) => option.batch_name}
							value={selectedBatch}
							onChange={handleBatchChange}
							renderInput={(params) => (
								<TextField
									{...params}
									placeholder="Search by batch name..."
									size="medium"
									sx={{
										bgcolor: 'white',
										'& .MuiOutlinedInput-root': {
											borderRadius: '2px',
											'& fieldset': { borderColor: '#d5dbdb' }
										}
									}}
								/>
							)}
							sx={{ width: '100%', maxWidth: 600 }}
						/>
					</Box>

					{selectedBatch && (
						<Fade in={!!selectedBatch}>
							<Box sx={{ display: 'flex', gap: 4, px: isMobile ? 0 : 4, borderLeft: isMobile ? 'none' : '1px solid #eaeded' }}>
								<Box>
									<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>STATUS</Typography>
									<Chip
										label={selectedBatch.status.toUpperCase()}
										size="small"
										sx={{
											bgcolor: getStatusColor(selectedBatch.status),
											color: 'white',
											fontWeight: 700,
											borderRadius: '2px',
											height: 24
										}}
									/>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>ENROLLMENT</Typography>
									<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }}>{allocations.length}</Typography>
								</Box>
							</Box>
						</Fade>
					)}
				</Paper>

				{selectedBatch ? (
					<Box>
						<Box sx={{ borderBottom: 1, borderColor: '#eaeded' }}>
							<Tabs
								value={tabValue}
								onChange={handleTabChange}
								aria-label="batch management tabs"
								sx={{
									'& .MuiTab-root': {
										textTransform: 'none',
										fontWeight: 600,
										fontSize: '0.95rem',
										minWidth: 160,
										color: '#545b64',
										'&.Mui-selected': {
											color: '#007eb9'
										}
									},
									'& .MuiTabs-indicator': {
										backgroundColor: '#007eb9',
										height: 3
									}
								}}
							>
								<Tab icon={<DashboardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Batch Dashboard" id="allocation-tab-0" />
								<Tab icon={<PeopleIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Managed Candidates" id="allocation-tab-1" />
								<Tab icon={<AttendanceIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Daily Attendance" id="allocation-tab-2" />
								<Tab icon={<AssessmentTabIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Weekly Assessments" id="allocation-tab-3" />
								<Tab icon={<MockInterviewIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Mock Interviews" id="allocation-tab-4" />
								<Tab icon={<AssignmentIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Add New Allocation" id="allocation-tab-5" />
							</Tabs>
						</Box>

						<TabPanel value={tabValue} index={0}>
							<Grid container spacing={4}>
								<Grid size={{ xs: 12, md: 8 }}>
									<Paper variant="outlined" sx={{ p: 4, borderRadius: '4px' }}>
										<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Batch Details</Typography>
										<Divider sx={{ mb: 3 }} />
										<Grid container spacing={3}>
											<Grid size={{ xs: 12, sm: 6 }}>
												<Typography variant="caption" color="text.secondary">COURSES OFFERED</Typography>
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
													{Array.isArray(selectedBatch.courses) ? selectedBatch.courses.map(c => (
														<Chip key={c} label={c} size="small" variant="outlined" />
													)) : <Typography variant="body2">None</Typography>}
												</Box>
											</Grid>
											<Grid size={{ xs: 12, sm: 6 }}>
												<Typography variant="caption" color="text.secondary">TRAINING DURATION</Typography>
												<Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
													{selectedBatch.duration?.weeks} Weeks ({selectedBatch.duration?.start_date} to {selectedBatch.duration?.end_date})
												</Typography>
											</Grid>
										</Grid>
									</Paper>
								</Grid>
								<Grid size={{ xs: 12, md: 4 }}>
									<Paper variant="outlined" sx={{ p: 4, borderRadius: '4px', textAlign: 'center', bgcolor: '#f8f9fa' }}>
										<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Enrollment Summary</Typography>
										<Box sx={{ py: 3 }}>
											<Typography variant="h2" sx={{ fontWeight: 800, color: '#ff9900' }}>{allocations.length}</Typography>
											<Typography variant="body2" color="text.secondary">Total Active Candidates</Typography>
										</Box>
										<Button
											variant="outlined"
											fullWidth
											onClick={() => setTabValue(1)}
											sx={{ textTransform: 'none', mt: 2 }}
										>
											View All Candidates
										</Button>
									</Paper>
								</Grid>
							</Grid>
						</TabPanel>

						<TabPanel value={tabValue} index={1}>
							<TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d5dbdb', borderRadius: '4px' }}>
								<Table>
									<TableHead>
										<TableRow sx={{ bgcolor: '#f8f9fa' }}>
											<TableCell sx={{ fontWeight: 700, py: 2 }}>Candidate Name</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Contact Info</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Allocation Date</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Current Status</TableCell>
											<TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{loading ? (
											<TableRow>
												<TableCell colSpan={5} align="center" sx={{ py: 8 }}>
													<CircularProgress size={32} thickness={4} />
													<Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">Loading candidate data...</Typography>
												</TableCell>
											</TableRow>
										) : allocations.length === 0 ? (
											<TableRow>
												<TableCell colSpan={5} align="center" sx={{ py: 10 }}>
													<Box sx={{ opacity: 0.5 }}>
														<PeopleIcon sx={{ fontSize: 64, mb: 1 }} />
														<Typography variant="h6">No candidates in this batch</Typography>
														<Typography variant="body2">Use the "Add New Allocation" tab to enroll candidates.</Typography>
													</Box>
												</TableCell>
											</TableRow>
										) : (
											allocations.map((allocation) => (
												<TableRow key={allocation.public_id} hover>
													<TableCell>
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
															<Box
																sx={{
																	width: 36,
																	height: 36,
																	borderRadius: '50%',
																	bgcolor: '#eaeded',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontWeight: 700,
																	color: '#545b64',
																	fontSize: '0.875rem'
																}}
															>
																{allocation.candidate?.name?.[0] || 'C'}
															</Box>
															<Typography sx={{ fontWeight: 600 }}>{allocation.candidate?.name}</Typography>
														</Box>
													</TableCell>
													<TableCell>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>{allocation.candidate?.email}</Typography>
														<Typography variant="caption" color="text.secondary">{allocation.candidate?.phone}</Typography>
													</TableCell>
													<TableCell>
														<Typography variant="body2">{new Date(allocation.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</Typography>
													</TableCell>
													<TableCell>
														<FormControl size="small" sx={{ minWidth: 160 }}>
															<Select
																value={allocation.status?.current || 'allocated'}
																onChange={(e) => handleStatusChange(allocation.public_id, e.target.value)}
																disabled={updatingStatus === allocation.public_id}
																sx={{
																	fontSize: '0.875rem',
																	fontWeight: 600,
																	'& .MuiSelect-select': { py: '6px' }
																}}
															>
																{ALLOCATION_STATUSES.map(s => (
																	<MenuItem key={s} value={s} sx={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
																		<Box component="span" sx={{
																			display: 'inline-block',
																			width: 10,
																			height: 10,
																			borderRadius: '50%',
																			bgcolor: getAllocationStatusColor(s),
																			mr: 1.5
																		}} />
																		{s}
																	</MenuItem>
																))}
															</Select>
														</FormControl>
													</TableCell>
													<TableCell align="right">
														<Tooltip title="Remove from batch">
															<IconButton
																size="small"
																color="error"
																onClick={() => handleRemove(allocation.public_id, allocation.candidate?.name || 'Candidate')}
															>
																<DeleteIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</TabPanel>

						<TabPanel value={tabValue} index={2}>
							<AttendanceTracker batch={selectedBatch} allocations={allocations} />
						</TabPanel>

						<TabPanel value={tabValue} index={3}>
							<AssessmentTracker batch={selectedBatch} allocations={allocations} />
						</TabPanel>

						<TabPanel value={tabValue} index={4}>
							<MockInterviewManager batch={selectedBatch} allocations={allocations} />
						</TabPanel>

						<TabPanel value={tabValue} index={5}>
							<Paper sx={{ p: 6, textAlign: 'center', border: '2px dashed #d5dbdb', borderRadius: '4px', bgcolor: 'transparent' }}>
								<PersonAddIcon sx={{ fontSize: 48, color: '#d5dbdb', mb: 2 }} />
								<Typography variant="h6" gutterBottom>Enroll More Candidates</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: 'auto' }}>
									Enroll single or multiple candidates who have completed counseling and are ready for training.
								</Typography>
								<Button
									variant="contained"
									size="large"
									onClick={() => setDialogOpen(true)}
									sx={{
										bgcolor: '#00a1c9',
										'&:hover': { bgcolor: '#007eb9' },
										textTransform: 'none',
										fontWeight: 600,
										px: 4
									}}
								>
									Start Enrollment Process
								</Button>
							</Paper>
						</TabPanel>
					</Box>
				) : (
					<Paper sx={{ p: 10, textAlign: 'center', border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '4px', mt: 4 }}>
						<SchoolIcon sx={{ fontSize: 80, color: '#eaeded', mb: 3 }} />
						<Typography variant="h5" color="#232f3e" sx={{ fontWeight: 600 }} gutterBottom>
							No Training Batch Selected
						</Typography>
						<Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
							To manage candidate allocations, status updates, and enrollments, please select an active training batch from the dropdown above.
						</Typography>
					</Paper>
				)}

				{selectedBatch && (
					<AllocateCandidateDialog
						open={dialogOpen}
						onClose={() => setDialogOpen(false)}
						batchId={selectedBatch.id}
						batchPublicId={selectedBatch.public_id}
						batchName={selectedBatch.batch_name}
					/>
				)}
			</Container>
		</Box>
	);
};

export default CandidateAllocation;
