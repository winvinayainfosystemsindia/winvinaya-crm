import React from 'react';
import { Paper, Typography, Box, Button, Grid, Stack } from '@mui/material';
import {
	School as SchoolIcon,
	TrendingUp as PipelineIcon,
	AssignmentTurnedIn as ReadyIcon,
	WarningAmber as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, InfoRow } from './DetailedViewCommon';
import type { Candidate } from '../../../models/candidate';

interface TrainingAllocationTabProps {
	candidate: Candidate;
}

const TrainingAllocationTab: React.FC<TrainingAllocationTabProps> = ({ candidate }) => {
	const navigate = useNavigate();

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 3,
				borderRadius: 0,
				border: '1px solid #d5dbdb',
				boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
			}}
		>
			<SectionHeader title="Training & Allocation Status" icon={<SchoolIcon />} />

			<Grid container spacing={4}>
				<Grid size={{ xs: 12, md: 8 }}>
					<Box sx={{ p: 4, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #eaeded', textAlign: 'center' }}>
						<PipelineIcon sx={{ fontSize: 64, color: '#ec7211', mb: 2, opacity: 0.8 }} />
						<Typography variant="h6" sx={{ color: '#232f3e', fontWeight: 700, mb: 1 }}>
							Sourcing & Selection Pipeline
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
							{candidate.name} is currently in the initial sourcing phase. Allocation to training batches becomes available once the career counseling and screening assessments are finalized.
						</Typography>

						<Stack direction="row" spacing={2} justifyContent="center">
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
								Manage Allocation
							</Button>
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
						</Stack>
					</Box>
				</Grid>

				<Grid size={{ xs: 12, md: 4 }}>
					<Box sx={{ p: 3, bgcolor: '#f2f3f3', borderRadius: 1, height: '100%' }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 3, display: 'flex', alignItems: 'center' }}>
							<ReadyIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
							Allocation Readiness
						</Typography>

						<InfoRow
							label="Counseling Status"
							value={candidate.counseling ? 'Completed' : 'Pending'}
							icon={candidate.counseling ? <ReadyIcon sx={{ fontSize: 16, color: '#2e7d32' }} /> : <PendingIcon sx={{ fontSize: 16, color: '#ec7211' }} />}
						/>

						<InfoRow
							label="Screening Status"
							value={candidate.screening ? 'Completed' : 'Pending'}
							icon={candidate.screening ? <ReadyIcon sx={{ fontSize: 16, color: '#2e7d32' }} /> : <PendingIcon sx={{ fontSize: 16, color: '#ec7211' }} />}
						/>

						<Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
							* Candidates must complete both phases before batch assignment.
						</Typography>
					</Box>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default TrainingAllocationTab;
