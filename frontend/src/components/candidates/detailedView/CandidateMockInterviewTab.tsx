import React, { useState, useEffect, useMemo } from 'react';
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
	LinearProgress,
	Divider,
	Stack,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from '@mui/material';
import {
	RecordVoiceOver as InterviewIcon,
	ExpandMore as ExpandMoreIcon,
	School as BatchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SectionHeader } from './DetailedViewCommon';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingMockInterview } from '../../../models/training';
import type { Candidate } from '../../../models/candidate';

interface CandidateMockInterviewTabProps {
	candidate: Candidate;
}

const CandidateMockInterviewTab: React.FC<CandidateMockInterviewTabProps> = ({ candidate }) => {
	const [interviews, setInterviews] = useState<TrainingMockInterview[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			if (!candidate.public_id) return;
			try {
				const data = await trainingExtensionService.getCandidateMockInterviews(candidate.public_id);
				setInterviews(data);
			} catch (error) {
				console.error('Failed to fetch mock interviews:', error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [candidate.public_id]);

	// Group interviews by batch
	const interviewsByBatch = useMemo(() => {
		const grouped = new Map<number, { batch: any; records: TrainingMockInterview[] }>();

		interviews.forEach(record => {
			if (!record.batch) return;

			if (!grouped.has(record.batch_id)) {
				grouped.set(record.batch_id, { batch: record.batch, records: [] });
			}
			grouped.get(record.batch_id)!.records.push(record);
		});

		return Array.from(grouped.values());
	}, [interviews]);

	// Overall statistics
	const overallStats = useMemo(() => {
		const total = interviews.length;
		if (total === 0) return { cleared: 0, pending: 0, avgRating: 0 };
		const cleared = interviews.filter(i => i.status === 'cleared').length;
		const pending = interviews.filter(i => i.status === 'pending').length;
		const ratedInterviews = interviews.filter(i => i.overall_rating !== undefined && i.status !== 'absent');
		const avgRating = ratedInterviews.length > 0
			? ratedInterviews.reduce((sum, i) => sum + (i.overall_rating || 0), 0) / ratedInterviews.length
			: 0;
		return { cleared, pending, avgRating: avgRating.toFixed(1) };
	}, [interviews]);

	// Batch-specific statistics
	const getBatchStats = (records: TrainingMockInterview[]) => {
		const total = records.length;
		if (total === 0) return { cleared: 0, avgRating: 0 };
		const cleared = records.filter(i => i.status === 'cleared').length;
		const ratedInterviews = records.filter(i => i.overall_rating !== undefined && i.status !== 'absent');
		const avgRating = ratedInterviews.length > 0
			? ratedInterviews.reduce((sum, i) => sum + (i.overall_rating || 0), 0) / ratedInterviews.length
			: 0;
		return { cleared, avgRating: avgRating.toFixed(1) };
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	const getStatusChip = (status: string) => {
		switch (status) {
			case 'cleared':
				return <Chip label="Cleared" size="small" sx={{ bgcolor: '#ebf5e0', color: '#318400', fontWeight: 700, borderRadius: '4px' }} />;
			case 're-test':
				return <Chip label="Re-test" size="small" sx={{ bgcolor: '#fff4e5', color: '#663c00', fontWeight: 700, borderRadius: '4px' }} />;
			case 'absent':
				return <Chip label="Absent" size="small" sx={{ bgcolor: '#f2f3f3', color: '#545b64', fontWeight: 700, borderRadius: '4px' }} />;
			default:
				return <Chip label={status.toUpperCase()} size="small" sx={{ bgcolor: '#e7f4f9', color: '#005b82', fontWeight: 700, borderRadius: '4px' }} />;
		}
	};

	const renderRating = (rating: number | undefined, status: string) => {
		if (status === 'absent' || rating === undefined || rating === null) {
			return <Typography variant="caption" sx={{ color: '#aab7b8', fontStyle: 'italic' }}>N/A</Typography>;
		}

		return (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Box sx={{ flexGrow: 1, minWidth: 60 }}>
					<LinearProgress
						variant="determinate"
						value={rating * 10}
						sx={{
							height: 4,
							borderRadius: 2,
							bgcolor: '#eaeded',
							'& .MuiLinearProgress-bar': { bgcolor: rating >= 7 ? '#318400' : rating >= 4 ? '#ec7211' : '#d91d11' }
						}}
					/>
				</Box>
				<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>
					{rating}
				</Typography>
			</Box>
		);
	};

	return (
		<Paper
			variant="outlined"
			sx={{ p: 3, borderRadius: 0, border: '1px solid #d5dbdb', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)' }}
		>
			<SectionHeader title="Mock Interview Portfolio" icon={<InterviewIcon />} />

			{interviews.length > 0 ? (
				<>
					{/* Overall Summary Strip */}
					<Box sx={{ display: 'flex', gap: 6, mb: 4, bgcolor: '#f8f9fa', p: 2.5, border: '1px solid #eaeded', borderRadius: '2px' }}>
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Total Sessions
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#232f3e' }}>{interviews.length}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Cleared
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#318400' }}>{overallStats.cleared}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Overall Avg Rating
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#007eb9' }}>{overallStats.avgRating}/10</Typography>
						</Box>
					</Box>

					{/* Mock Interviews by Batch */}
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
						Mock Interviews by Training Batch
					</Typography>

					{interviewsByBatch.map(({ batch, records }, index) => {
						const batchStats = getBatchStats(records);
						return (
							<Accordion
								key={batch.id}
								defaultExpanded={index === 0}
								sx={{
									mb: 2,
									border: '1px solid #eaeded',
									'&:before': { display: 'none' },
									boxShadow: 'none'
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									sx={{ bgcolor: '#fafafa', '&:hover': { bgcolor: '#f5f5f5' } }}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
										<BatchIcon sx={{ color: '#ec7211', fontSize: 20 }} />
										<Box sx={{ flexGrow: 1 }}>
											<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e' }}>
												{batch.batch_name}
											</Typography>
											<Typography variant="caption" sx={{ color: '#545b64' }}>
												{records.length} sessions • {batchStats.cleared} cleared • Avg rating: {batchStats.avgRating}/10
											</Typography>
										</Box>
										<Box sx={{ display: 'flex', gap: 3, mr: 2 }}>
											<Box>
												<Typography variant="caption" sx={{ color: '#545b64', display: 'block' }}>Cleared</Typography>
												<Typography variant="body2" sx={{ fontWeight: 700, color: '#318400' }}>{batchStats.cleared}</Typography>
											</Box>
											<Box>
												<Typography variant="caption" sx={{ color: '#545b64', display: 'block' }}>Avg Rating</Typography>
												<Typography variant="body2" sx={{ fontWeight: 700, color: '#007eb9' }}>{batchStats.avgRating}</Typography>
											</Box>
										</Box>
									</Box>
								</AccordionSummary>
								<AccordionDetails sx={{ p: 0 }}>
									<TableContainer>
										<Table size="small">
											<TableHead sx={{ bgcolor: '#f8f9fa' }}>
												<TableRow>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>DATE</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>INTERVIEWER</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>STATUS</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>SCORE</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>FEEDBACK</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{records.map((row) => (
													<TableRow key={row.id} hover>
														<TableCell sx={{ color: '#232f3e', fontWeight: 500 }}>
															{format(new Date(row.interview_date), 'MMM dd, yyyy')}
														</TableCell>
														<TableCell sx={{ color: '#232f3e' }}>
															{row.interviewer_name || 'Unassigned'}
														</TableCell>
														<TableCell>{getStatusChip(row.status)}</TableCell>
														<TableCell sx={{ minWidth: 100 }}>
															{renderRating(row.overall_rating ?? undefined, row.status)}
														</TableCell>
														<TableCell sx={{ color: '#545b64', maxWidth: 300 }}>
															<Stack direction="row" alignItems="center" spacing={1}>
																<Typography variant="body2" noWrap>
																	{row.feedback || 'No feedback provided'}
																</Typography>
															</Stack>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								</AccordionDetails>
							</Accordion>
						);
					})}
				</>
			) : (
				<Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f8f9fa', border: '1px dashed #eaeded', borderRadius: '2px' }}>
					<InterviewIcon sx={{ fontSize: 48, color: '#aab7b8', mb: 2 }} />
					<Typography variant="h6" sx={{ color: '#545b64', fontWeight: 600 }}>No Mock Interviews Recorded</Typography>
					<Typography variant="body2" color="text.secondary">
						Once the candidate begins their mock interview sessions, the feedback and ratings will be aggregated here.
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default CandidateMockInterviewTab;
