import React, { useState, useEffect } from 'react';
import {
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	CircularProgress,
	Button,
	Divider,
	Stack,
	useTheme,
	alpha
} from '@mui/material';
import {
	School as SchoolIcon,
	Event as DateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, SectionCard } from '../DetailedViewCommon';
import trainingExtensionService from '../../../../services/trainingExtensionService';
import type { Candidate } from '../../../../models/candidate';
import type { CandidateAllocation } from '../../../../models/training';

interface TrainingAllocationTabProps {
	candidate: Candidate;
}

const TrainingAllocationTab: React.FC<TrainingAllocationTabProps> = ({ candidate }) => {
	const navigate = useNavigate();
	const theme = useTheme();
	const [allocations, setAllocations] = useState<CandidateAllocation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			if (!candidate.public_id) return;
			try {
				const data = await trainingExtensionService.getCandidateAllocations(candidate.public_id);
				setAllocations(data);
			} catch (error) {
				console.error('Failed to fetch allocations:', error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [candidate.public_id]);

	const getStatusChip = (allocation: CandidateAllocation) => {
		if (allocation.is_dropout) {
			return <Chip label="Dropout" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontWeight: 700, borderRadius: '4px' }} />;
		}
		// Check if batch is still running
		const batchStatus = allocation.batch?.status;
		if (batchStatus === 'running' || batchStatus === 'planned') {
			return <Chip label="Active" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 700, borderRadius: '4px' }} />;
		}
		return <Chip label="Completed" size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontWeight: 700, borderRadius: '4px' }} />;
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: 'primary.main' }} />
			</Box>
		);
	}

	return (
		<SectionCard>
			<SectionHeader title="Training Batch Allocations" icon={<SchoolIcon />} />

			{allocations.length > 0 ? (
				<>
					{/* Summary Strip */}
					<Box sx={{ display: 'flex', gap: 6, mb: 4, bgcolor: alpha(theme.palette.background.default, 0.5), p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '2px' }}>
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Total Batches
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{allocations.length}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Active
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
								{allocations.filter(a => !a.is_dropout && (a.batch?.status === 'running' || a.batch?.status === 'planned')).length}
							</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Completed
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main' }}>
								{allocations.filter(a => !a.is_dropout && a.batch?.status === 'closed').length}
							</Typography>
						</Box>
					</Box>

					{/* Allocations Table */}
					<TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '2px' }}>
						<Table size="small">
							<TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
								<TableRow>
									<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>BATCH NAME</TableCell>
									<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>CATEGORY</TableCell>
									<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>DURATION</TableCell>
									<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>STATUS</TableCell>
									<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>REMARK</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{allocations.map((allocation) => (
									<TableRow key={allocation.id} hover>
										<TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>
											<Button
												variant="text"
												sx={{
													textTransform: 'none',
													color: 'info.main',
													fontWeight: 600,
													p: 0,
													minWidth: 'auto',
													'&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
												}}
												onClick={() => navigate(`/training/batches/${allocation.batch?.public_id}`)}
											>
												{allocation.batch?.batch_name}
											</Button>
										</TableCell>
										<TableCell sx={{ color: 'text.secondary' }}>
											{allocation.batch?.disability_types?.join(', ') || 'N/A'}
										</TableCell>
										<TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
											{allocation.batch?.start_date && (
												<Stack direction="row" spacing={0.5} alignItems="center">
													<DateIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
													<Typography variant="caption">
														{format(new Date(allocation.batch.start_date), 'MMM dd, yyyy')}
														{allocation.batch.approx_close_date && (
															<> - {format(new Date(allocation.batch.approx_close_date), 'MMM dd, yyyy')}</>
														)}
													</Typography>
												</Stack>
											)}
										</TableCell>
										<TableCell>{getStatusChip(allocation)}</TableCell>
										<TableCell sx={{ color: 'text.secondary', fontStyle: allocation.dropout_remark ? 'normal' : 'italic', maxWidth: 200 }}>
											{allocation.dropout_remark || 'No remarks'}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Action Buttons */}
					<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
						<Button
							variant="outlined"
							sx={{
								color: 'text.primary',
								borderColor: 'divider',
								textTransform: 'none',
								'&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' }
							}}
							onClick={() => navigate('/training/batches')}
						>
							View All Batches
						</Button>
						<Button
							variant="contained"
							sx={{
								bgcolor: '#ec7211',
								'&:hover': { bgcolor: '#eb5f07' },
								textTransform: 'none',
								fontWeight: 700,
								boxShadow: 'none'
							}}
							onClick={() => navigate('/training/allocation')}
						>
							Manage Allocation
						</Button>
					</Box>
				</>
			) : (
				<Box sx={{ textAlign: 'center', py: 8, bgcolor: alpha(theme.palette.background.default, 0.5), border: '1px dashed', borderColor: 'divider', borderRadius: '2px' }}>
					<SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
					<Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Training Allocations</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{candidate.name} has not been allocated to any training batch yet.
					</Typography>
					<Button
						variant="contained"
						color="primary"
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							px: 4,
							boxShadow: 'none'
						}}
						onClick={() => navigate('/training/allocation')}
					>
						Allocate to Batch
					</Button>
				</Box>
			)}
		</SectionCard>
	);
};

export default TrainingAllocationTab;
