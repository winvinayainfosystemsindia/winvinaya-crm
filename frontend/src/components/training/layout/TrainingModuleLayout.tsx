import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
	CircularProgress,
} from '@mui/material';
import {
	Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
	fetchTrainingBatches,
	fetchAllocations,
} from '../../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../../models/training';
import BatchSelectionHeader from '../common/BatchSelectionHeader';

interface TrainingModuleLayoutProps {
	title: string;
	subtitle: string;
	children: (props: { selectedBatch: TrainingBatch; allocations: any[]; loading: boolean }) => React.ReactNode;
}

const TrainingModuleLayout: React.FC<TrainingModuleLayoutProps> = ({
	title,
	subtitle,
	children
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const dispatch = useAppDispatch();
	const [searchParams, setSearchParams] = useSearchParams();

	const { batches, allocations, loading } = useAppSelector((state) => state.training);
	const [selectedBatch, setSelectedBatch] = useState<TrainingBatch | null>(null);

	const batchPublicId = searchParams.get('batchId');

	useEffect(() => {
		dispatch(fetchTrainingBatches({ limit: 1000 }));
	}, [dispatch]);

	useEffect(() => {
		if (batches.length > 0 && batchPublicId) {
			const batch = batches.find(b => b.public_id === batchPublicId);
			if (batch) {
				setSelectedBatch(batch);
			} else {
				// If batch not found in list (maybe old link), clear the param
				setSearchParams({});
			}
		} else if (batches.length > 0 && !batchPublicId && !selectedBatch) {
			// Optional: auto-select first batch if none selected? 
			// For now, let's keep it empty as per original UI logic
		}
	}, [batches, batchPublicId]);

	useEffect(() => {
		if (selectedBatch) {
			dispatch(fetchAllocations({ batchPublicId: selectedBatch.public_id }));
		}
	}, [selectedBatch, dispatch]);

	const handleBatchChange = (newValue: TrainingBatch | null) => {
		setSelectedBatch(newValue);
		if (newValue) {
			setSearchParams({ batchId: newValue.public_id });
		} else {
			setSearchParams({});
		}
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'planned': return '#2575fc';
			case 'running': return '#ff9900';
			case 'closed': return '#5f6368';
			default: return '#5f6368';
		}
	};

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh' }}>
			{/* Professional AWS Service Header */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', pt: 2, pb: 4, mb: 0 }}>
				<Container maxWidth="xl">
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
						<Box>
							<Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5, letterSpacing: '-0.02em', fontSize: isMobile ? '1.5rem' : '2rem' }}>
								{title}
							</Typography>
							<Typography variant="body2" sx={{ color: '#aab7bd', maxWidth: 600 }}>
								{subtitle}
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
						<CircularProgress sx={{ mb: 3, color: '#d5dbdb' }} />
						<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }} gutterBottom>
							No Training Batch Selected
						</Typography>
						<Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
							Please select an active training batch from the header console to begin.
						</Typography>
					</Paper>
				) : (
					<Box>
						{children({ selectedBatch, allocations, loading })}
					</Box>
				)}
			</Container>
		</Box>
	);
};

export default TrainingModuleLayout;
