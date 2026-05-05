import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	Box,
	Typography,
	Paper,
	Stack,
	Divider,
	Chip,
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
import ModuleLayout from '../../common/layout/ModuleLayout';

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
				setSearchParams({});
			}
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
		<ModuleLayout
			title={title}
			subtitle={subtitle}
			loading={loading && batches.length === 0}
			isEmpty={!selectedBatch && !loading}
			emptyTitle="No Training Batch Selected"
			emptyMessage="Please select an active training batch from the header console to begin."
			headerExtra={
				<BatchSelectionHeader
					batches={batches}
					selectedBatch={selectedBatch}
					onBatchChange={handleBatchChange}
				/>
			}
			headerChildren={selectedBatch && (
				<Paper
					elevation={0}
					sx={{
						bgcolor: 'rgba(255, 255, 255, 0.05)',
						borderRadius: '8px',
						p: 2,
						border: '1px solid rgba(255, 255, 255, 0.1)',
						display: 'flex',
						flexWrap: 'wrap',
						gap: 4
					}}
				>
					<Box>
						<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Active Batch
						</Typography>
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{selectedBatch.batch_name}</Typography>
					</Box>
					<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
					<Box>
						<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
								borderRadius: '4px'
							}}
						/>
					</Box>
					<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
					<Box>
						<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Schedule
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<ScheduleIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' }} />
							<Typography variant="body2" sx={{ color: 'white' }}>{selectedBatch.duration?.weeks} Weeks</Typography>
						</Stack>
					</Box>
					<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
					<Box>
						<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Enrollment
						</Typography>
						<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{allocations.length} Candidates</Typography>
					</Box>
				</Paper>
			)}
		>
			{selectedBatch && children({ selectedBatch, allocations, loading })}
		</ModuleLayout>
	);
};


export default TrainingModuleLayout;
