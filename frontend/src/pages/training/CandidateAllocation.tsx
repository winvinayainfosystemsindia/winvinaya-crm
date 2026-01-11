import React, { useState, useEffect } from 'react';
import {
	Box,
	Container,
	Typography,
	useTheme,
	useMediaQuery,
	Paper,
	Tabs,
	Tab,
	Grid,
	Divider,
	Button,
	Chip,
} from '@mui/material';
import {
	PersonAdd as PersonAddIcon,
	School as SchoolIcon,
	Dashboard as DashboardIcon,
	People as PeopleIcon,
	EventAvailable as AttendanceIcon,
	Assessment as AssessmentTabIcon,
	Psychology as MockInterviewIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	fetchTrainingBatches,
	fetchAllocations,
	updateAllocationStatus,
	removeAllocation,
	markAsDropout
} from '../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../models/training';
import AllocateCandidateDialog from '../../components/training/form/AllocateCandidateDialog';
import AttendanceTracker from '../../components/training/extensions/AttendanceTracker';
import AssessmentTracker from '../../components/training/extensions/AssessmentTracker';
import MockInterviewList from '../../components/training/mock-interview/MockInterviewList';
import BatchSelectionHeader from '../../components/training/BatchSelectionHeader';
import CandidateAllocationTable from '../../components/training/CandidateAllocationTable';
import DropoutDialog from '../../components/training/form/DropoutDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useSnackbar } from 'notistack';

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
	const [searchQuery, setSearchQuery] = useState('');
	const [filterDropout, setFilterDropout] = useState<boolean | 'all'>('all');
	const [dropoutDialogOpen, setDropoutDialogOpen] = useState(false);
	const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null);
	const [dropoutRemark, setDropoutRemark] = useState('');

	// Confirmation Dialog State
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmData, setConfirmData] = useState<{ id: string; name: string } | null>(null);

	useEffect(() => {
		dispatch(fetchTrainingBatches({ limit: 1000 }));
	}, [dispatch]);

	useEffect(() => {
		if (selectedBatch) {
			const params: any = {};
			if (searchQuery) params.search = searchQuery;
			if (filterDropout !== 'all') params.is_dropout = filterDropout;
			dispatch(fetchAllocations({ batchPublicId: selectedBatch.public_id, params }));
		}
	}, [selectedBatch, searchQuery, filterDropout, dispatch]);

	const handleBatchChange = (newValue: TrainingBatch | null) => {
		setSelectedBatch(newValue);
		setTabValue(newValue ? 1 : 0);
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'planned': return '#2575fc';
			case 'running': return '#ff9900';
			case 'closed': return '#5f6368';
			default: return '#5f6368';
		}
	};

	const handleStatusChange = async (publicId: string, newStatus: string) => {
		if (newStatus === 'dropout') {
			setSelectedAllocationId(publicId);
			setDropoutRemark('');
			setDropoutDialogOpen(true);
			return;
		}

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

	const handleConfirmDropout = async () => {
		if (!selectedAllocationId || !dropoutRemark) return;

		setUpdatingStatus(selectedAllocationId);
		try {
			await dispatch(markAsDropout({ publicId: selectedAllocationId, remark: dropoutRemark })).unwrap();
			enqueueSnackbar('Candidate marked as dropout', { variant: 'success' });
			setDropoutDialogOpen(false);
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to mark as dropout', { variant: 'error' });
		} finally {
			setUpdatingStatus(null);
		}
	};

	const handleRemoveClick = (publicId: string, candidateName: string) => {
		setConfirmData({ id: publicId, name: candidateName });
		setConfirmOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (!confirmData) return;

		try {
			await dispatch(removeAllocation(confirmData.id)).unwrap();
			enqueueSnackbar('Candidate removed from batch', { variant: 'success' });
			setConfirmOpen(false);
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to remove candidate', { variant: 'error' });
		}
	};

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: isMobile ? 2 : 3 }}>
			<Container maxWidth="xl" sx={{ px: isMobile ? 1 : { sm: 2, md: 3 } }}>
				{/* Page Header */}
				<Box sx={{ mb: 4 }}>
					<Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 300, color: '#232f3e', mb: 0.5 }}>
						Batch Allocation Manager
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Experience-driven candidate assignment and progress tracking
					</Typography>
				</Box>

				{/* Batch Selection Strip */}
				<BatchSelectionHeader
					batches={batches}
					selectedBatch={selectedBatch}
					onBatchChange={handleBatchChange}
					allocationCount={allocations.length}
					isMobile={isMobile}
					getStatusColor={getStatusColor}
				/>

				{selectedBatch ? (
					<Box>
						<Box sx={{ borderBottom: 1, borderColor: '#eaeded' }}>
							<Tabs
								value={tabValue}
								onChange={(_e, val) => setTabValue(val)}
								aria-label="batch management tabs"
								variant={isMobile ? "scrollable" : "standard"}
								scrollButtons="auto"
								sx={{
									'& .MuiTab-root': {
										textTransform: 'none',
										fontWeight: 600,
										fontSize: '0.95rem',
										minWidth: isMobile ? 120 : 160,
										color: '#545b64',
										'&.Mui-selected': { color: '#007eb9' }
									},
									'& .MuiTabs-indicator': { backgroundColor: '#007eb9', height: 3 }
								}}
							>
								<Tab icon={<DashboardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Batch Dashboard" />
								<Tab icon={<PeopleIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Managed Candidates" />
								<Tab icon={<AttendanceIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Daily Attendance" />
								<Tab icon={<AssessmentTabIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Weekly Assessments" />
								<Tab icon={<MockInterviewIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Mock Interviews" />
								<Tab icon={<PersonAddIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Add New Allocation" />
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
										<Button variant="outlined" fullWidth onClick={() => setTabValue(1)} sx={{ textTransform: 'none', mt: 2 }}>
											View All Candidates
										</Button>
									</Paper>
								</Grid>
							</Grid>
						</TabPanel>

						<TabPanel value={tabValue} index={1}>
							<CandidateAllocationTable
								allocations={allocations}
								loading={loading}
								searchQuery={searchQuery}
								onSearchChange={setSearchQuery}
								filterDropout={filterDropout}
								onFilterChange={setFilterDropout}
								updatingStatusId={updatingStatus}
								onStatusChange={handleStatusChange}
								onRemove={handleRemoveClick}
							/>
						</TabPanel>

						<TabPanel value={tabValue} index={2}>
							<AttendanceTracker batch={selectedBatch} allocations={allocations} />
						</TabPanel>

						<TabPanel value={tabValue} index={3}>
							<AssessmentTracker batch={selectedBatch} allocations={allocations} />
						</TabPanel>

						<TabPanel value={tabValue} index={4}>
							<MockInterviewList batchId={selectedBatch.id} />
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

				{/* Dialogs */}
				{selectedBatch && (
					<AllocateCandidateDialog
						open={dialogOpen}
						onClose={() => setDialogOpen(false)}
						batchId={selectedBatch.id}
						batchPublicId={selectedBatch.public_id}
						batchName={selectedBatch.batch_name}
					/>
				)}

				<DropoutDialog
					open={dropoutDialogOpen}
					onClose={() => setDropoutDialogOpen(false)}
					onConfirm={handleConfirmDropout}
					remark={dropoutRemark}
					onRemarkChange={setDropoutRemark}
					submitting={updatingStatus !== null}
				/>

				<ConfirmDialog
					open={confirmOpen}
					title="Remove Candidate"
					message={`Are you sure you want to remove ${confirmData?.name} from this batch? This action cannot be undone.`}
					confirmText="Remove"
					severity="error"
					onClose={() => setConfirmOpen(false)}
					onConfirm={handleConfirmRemove}
				/>
			</Container>
		</Box>
	);
};

export default CandidateAllocation;
