import React, { useState, useEffect } from 'react';
import {
	Paper,
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
	Stack
} from '@mui/material';
import {
	School as SchoolIcon,
	Event as DateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './DetailedViewCommon';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { Candidate } from '../../../models/candidate';
import type { CandidateAllocation } from '../../../models/training';

interface TrainingAllocationTabProps {
	candidate: Candidate;
}

const TrainingAllocationTab: React.FC<TrainingAllocationTabProps> = ({ candidate }) => {
	const navigate = useNavigate();
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
			return <Chip label="Dropout" size="small" sx={{ bgcolor: '#fff1f0', color: '#d91d11', fontWeight: 700, borderRadius: '4px' }} />;
		}
		// Check if batch is still running
		const batchStatus = allocation.batch?.status;
		if (batchStatus === 'running' || batchStatus === 'planned') {
			return <Chip label="Active" size="small" sx={{ bgcolor: '#ebf5e0', color: '#318400', fontWeight: 700, borderRadius: '4px' }} />;
		}
		return <Chip label="Completed" size="small" sx={{ bgcolor: '#e7f4f9', color: '#005b82', fontWeight: 700, borderRadius: '4px' }} />;
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	return (
		<Paper
			variant="outlined"
			sx={{ p: 3, borderRadius: 0, border: '1px solid #d5dbdb', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)' }}
		>
			<SectionHeader title="Training Batch Allocations" icon={<SchoolIcon />} />

			{allocations.length > 0 ? (
				<>
					{/* Summary Strip */}
					<Box sx={{ display: 'flex', gap: 6, mb: 4, bgcolor: '#f8f9fa', p: 2.5, border: '1px solid #eaeded', borderRadius: '2px' }}>
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Total Batches
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#232f3e' }}>{allocations.length}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Active
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#318400' }}>
								{allocations.filter(a => !a.is_dropout && (a.batch?.status === 'running' || a.batch?.status === 'planned')).length}
							</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Completed
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#007eb9' }}>
								{allocations.filter(a => !a.is_dropout && a.batch?.status === 'closed').length}
							</Typography>
						</Box>
					</Box>

					{/* Allocations Table */}
					<TableContainer sx={{ border: '1px solid #eaeded', borderRadius: '2px' }}>
						<Table size="small">
							<TableHead sx={{ bgcolor: '#f8f9fa' }}>
								<TableRow>
									<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>BATCH NAME</TableCell>
									<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>DISABILITY TYPE</TableCell>
									<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>DURATION</TableCell>
									<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>STATUS</TableCell>
									<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>REMARK</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{allocations.map((allocation) => (
									<TableRow key={allocation.id} hover>
										<TableCell sx={{ color: '#232f3e', fontWeight: 600 }}>
											<Button
												variant="text"
												sx={{
													textTransform: 'none',
													color: '#007eb9',
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
										<TableCell sx={{ color: '#545b64' }}>
											{allocation.batch?.disability_type || 'N/A'}
										</TableCell>
										<TableCell sx={{ color: '#545b64', fontSize: '0.875rem' }}>
											{allocation.batch?.start_date && (
												<Stack direction="row" spacing={0.5} alignItems="center">
													<DateIcon sx={{ fontSize: 16, color: '#aab7b8' }} />
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
										<TableCell sx={{ color: '#545b64', fontStyle: allocation.dropout_remark ? 'normal' : 'italic', maxWidth: 200 }}>
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
								color: '#232f3e',
								borderColor: '#d5dbdb',
								textTransform: 'none',
								'&:hover': { borderColor: '#545b64', bgcolor: 'rgba(0,0,0,0.02)' }
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
				<Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f8f9fa', border: '1px dashed #eaeded', borderRadius: '2px' }}>
					<SchoolIcon sx={{ fontSize: 48, color: '#aab7b8', mb: 2 }} />
					<Typography variant="h6" sx={{ color: '#545b64', fontWeight: 600 }}>No Training Allocations</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{candidate.name} has not been allocated to any training batch yet.
					</Typography>
					<Button
						variant="contained"
						sx={{
							bgcolor: '#ec7211',
							'&:hover': { bgcolor: '#eb5f07' },
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
		</Paper>
	);
};

export default TrainingAllocationTab;
