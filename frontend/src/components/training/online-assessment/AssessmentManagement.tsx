import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	CircularProgress,
	Stack,
	Card,
	CardContent,
	Chip,
	IconButton,
	Tooltip,
	Grid,
	Divider
} from '@mui/material';
import {
	Add as AddIcon,
	PlayArrow as StartIcon,
	Assessment as AnalyticsIcon,
	Share as ShareIcon,
	Security as SecurityIcon,
	Timer as TimerIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import type { Assessment, TrainingBatch } from '../../../models/training';
import assessmentService from '../../../services/assessmentService';
import AssessmentBuilder from './AssessmentBuilder';
import AssessmentResults from './AssessmentResults';

interface AssessmentManagementProps {
	batch: TrainingBatch;
}

const AssessmentManagement: React.FC<AssessmentManagementProps> = ({ batch }) => {
	const [assessments, setAssessments] = useState<Assessment[]>([]);
	const [loading, setLoading] = useState(true);
	const [builderOpen, setBuilderOpen] = useState(false);
	const [resultsOpen, setResultsOpen] = useState(false);
	const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const loadAssessments = async () => {
		try {
			setLoading(true);
			const data = await assessmentService.getBatchAssessments(batch.id);
			setAssessments(data);
		} catch (error) {
			console.error('Failed to load assessments:', error);
			enqueueSnackbar('Error loading assessments', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAssessments();
	}, [batch.id]);

	const handleCreateSuccess = () => {
		setBuilderOpen(false);
		loadAssessments();
		enqueueSnackbar('Assessment created successfully', { variant: 'success' });
	};

	const handleShare = (publicId: string) => {
		const url = `${window.location.origin}/exam/${publicId}`;
		navigator.clipboard.writeText(url);
		enqueueSnackbar('Public link copied to clipboard', { variant: 'info' });
	};

	const handleViewResults = (a: Assessment) => {
		setSelectedAssessment(a);
		setResultsOpen(true);
	};

	if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;

	return (
		<Box sx={{ p: 0 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: '#232f3e' }}>Online Assessments</Typography>
					<Typography variant="body2" color="text.secondary">Create and manage timed quizzes with automatic grading</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setBuilderOpen(true)}
					sx={{
						bgcolor: '#ff9900',
						color: '#232f3e',
						'&:hover': { bgcolor: '#ec7211' },
						textTransform: 'none',
						fontWeight: 700
					}}
				>
					New Assessment
				</Button>
			</Stack>

			{assessments.length === 0 ? (
				<Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#f8f9fa', border: '2px dashed #d5dbdb' }}>
					<Typography variant="h6" color="text.secondary">No assessments created for this batch yet.</Typography>
					<Button
						variant="text"
						startIcon={<AddIcon />}
						onClick={() => setBuilderOpen(true)}
						sx={{ mt: 2 }}
					>
						Create your first assessment
					</Button>
				</Paper>
			) : (
				<Grid container spacing={3}>
					{assessments.map((a) => (
						<Grid key={a.id} size={{ xs: 12, md: 6, lg: 4 }}>
							<Card sx={{
								height: '100%',
								border: '1px solid #eaeded',
								boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
								transition: 'transform 0.2s',
								'&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
							}}>
								<CardContent>
									<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
										<Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#007eb9' }}>{a.title}</Typography>
										<Chip
											size="small"
											label={a.is_active ? "Active" : "Inactive"}
											color={a.is_active ? "success" : "default"}
											sx={{ fontWeight: 700, fontSize: '0.65rem' }}
										/>
									</Stack>
									<Typography variant="body2" color="text.secondary" sx={{
										mb: 2,
										height: 40,
										overflow: 'hidden',
										display: '-webkit-box',
										WebkitLineClamp: 2,
										WebkitBoxOrient: 'vertical'
									}}>
										{a.description || 'No description provided.'}
									</Typography>

									<Divider sx={{ mb: 2 }} />

									<Stack spacing={1.5}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<TimerIcon sx={{ fontSize: 18, color: '#545b64' }} />
											<Typography variant="body2" sx={{ fontWeight: 600 }}>{a.duration_minutes} Minutes</Typography>
										</Box>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<SecurityIcon sx={{ fontSize: 18, color: '#545b64' }} />
											<Typography variant="body2">Key: <strong>{a.security_key || 'None'}</strong></Typography>
										</Box>
									</Stack>

									<Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<Box>
											<Tooltip title="Copy Public Link">
												<IconButton size="small" onClick={() => handleShare(a.public_id!)} sx={{ color: '#007eb9' }}>
													<ShareIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="View Results">
												<IconButton
													size="small"
													sx={{ color: '#318400' }}
													onClick={() => handleViewResults(a)}
												>
													<AnalyticsIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
										<Button
											variant="outlined"
											size="small"
											startIcon={<StartIcon />}
											onClick={() => handleShare(a.public_id!)}
											sx={{ textTransform: 'none', fontWeight: 600 }}
										>
											Preview
										</Button>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{builderOpen && (
				<AssessmentBuilder
					batch={batch}
					open={builderOpen}
					onClose={() => setBuilderOpen(false)}
					onSuccess={handleCreateSuccess}
				/>
			)}
			{resultsOpen && selectedAssessment && (
				<AssessmentResults
					assessment={selectedAssessment}
					open={resultsOpen}
					onClose={() => {
						setResultsOpen(false);
						setSelectedAssessment(null);
					}}
				/>
			)}
		</Box>
	);
};

export default AssessmentManagement;
