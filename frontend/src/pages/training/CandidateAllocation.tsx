import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
	Box,
	Container,
	Typography,
	useTheme,
	useMediaQuery,
	Paper,
	Stack,
	Divider,
	Chip,
} from '@mui/material';
import {
	School as SchoolIcon,
	Schedule as ScheduleIcon,
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
import AttendanceTracker from '../../components/training/attendance/AttendanceTracker';
import AssessmentTracker from '../../components/training/assessment/AssessmentTracker';
import MockInterviewList from '../../components/training/mock-interview/MockInterviewList';
import BatchSelectionHeader from '../../components/training/common/BatchSelectionHeader';
import CandidateAllocationTable from '../../components/training/allocation/CandidateAllocationTable';
import DropoutDialog from '../../components/training/form/DropoutDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useSnackbar } from 'notistack';

// Focused Module Components
const AllocationModule: React.FC<any> = ({
	allocations,
	loading,
	searchQuery,
	setSearchQuery,
	filterDropout,
	setFilterDropout,
	updatingStatus,
	handleStatusChange,
	handleRemoveClick,
	setDialogOpen
}) => (
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
		onAddClick={() => setDialogOpen(true)}
	/>
);

const CandidateAllocation: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();

	const { batches, allocations, loading } = useAppSelector((state) => state.training);
	const location = useLocation();
	const [selectedBatch, setSelectedBatch] = useState<TrainingBatch | null>(null);
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const tab = params.get('tab');
		if (tab !== null) {
			setTabValue(parseInt(tab));
		}
	}, [location]);

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

	const renderModule = () => {
		if (!selectedBatch) return null;

		switch (tabValue) {
			case 1:
				return (
					<AllocationModule
						allocations={allocations}
						loading={loading}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						filterDropout={filterDropout}
						setFilterDropout={setFilterDropout}
						updatingStatus={updatingStatus}
						handleStatusChange={handleStatusChange}
						handleRemoveClick={handleRemoveClick}
						setDialogOpen={setDialogOpen}
					/>
				);
			case 2:
				return <AttendanceTracker batch={selectedBatch} allocations={allocations} />;
			case 3:
				return <AssessmentTracker batch={selectedBatch} allocations={allocations} />;
			case 4:
				return <MockInterviewList batchId={selectedBatch.id} allocations={allocations} />;
			default:
				return <Typography>Please select a valid module from the sidebar.</Typography>;
		}
	};

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh' }}>
			{/* Professional AWS Service Header */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', pt: 2, pb: 4, mb: 0 }}>
				<Container maxWidth="xl">
					{/* Professional Breadcrumbs */}


					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
						<Box>
							<Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5, letterSpacing: '-0.02em', fontSize: isMobile ? '1.5rem' : '2rem' }}>
								{tabValue === 1 ? 'Candidate Allocation' : tabValue === 2 ? 'Attendance Tracker' : tabValue === 3 ? 'Assessment Matrix' : 'Mock Interview Console'}
							</Typography>
							<Typography variant="body2" sx={{ color: '#aab7bd', maxWidth: 600 }}>
								Manage and monitor {tabValue === 1 ? 'candidate enrollments and lifecycle' : tabValue === 2 ? 'daily attendance records' : tabValue === 3 ? 'weekly assessment performance' : 'candidate interview readiness'} with enterprise-grade precision.
							</Typography>
						</Box>
						<Box sx={{ minWidth: 320 }}>
							<BatchSelectionHeader
								batches={batches}
								selectedBatch={selectedBatch}
								onBatchChange={handleBatchChange}
							/>
						</Box>
					</Box>

					{selectedBatch && (
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
									Active Batch
								</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{selectedBatch.batch_name}</Typography>
							</Box>
							<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
							<Box>
								<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Status
								</Typography>
								<Chip
									label={selectedBatch.status.toUpperCase()}
									size="small"
									sx={{
										height: 20,
										fontSize: '0.65rem',
										fontWeight: 900,
										bgcolor: getStatusColor(selectedBatch.status),
										color: 'white',
										borderRadius: '2px'
									}}
								/>
							</Box>
							<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
							<Box>
								<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Schedule
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center">
									<ScheduleIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
									<Typography variant="body2" sx={{ color: 'white' }}>{selectedBatch.duration?.weeks} Weeks</Typography>
								</Stack>
							</Box>
							<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
							<Box>
								<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									Enrollment
								</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{allocations.length} Candidates</Typography>
							</Box>
						</Paper>
					)}
				</Container>
			</Box>

			<Container maxWidth="xl" sx={{ py: 4 }}>
				{!selectedBatch ? (
					<Paper elevation={0} sx={{ p: 10, textAlign: 'center', border: '1px solid #d5dbdb', borderRadius: '2px' }}>
						<SchoolIcon sx={{ fontSize: 80, color: '#d5dbdb', mb: 3 }} />
						<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }} gutterBottom>
							No Training Batch Selected
						</Typography>
						<Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
							Please select an active training batch from the header console to begin managing allocations, attendance, or assessments.
						</Typography>
					</Paper>
				) : (
					<Box>
						{renderModule()}
					</Box>
				)}

			</Container>

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
		</Box>
	);
};

export default CandidateAllocation;
