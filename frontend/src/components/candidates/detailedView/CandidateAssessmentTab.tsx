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
	CircularProgress,
	LinearProgress,
	Divider,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from '@mui/material';
import {
	Assignment as AssessmentIcon,
	PendingActions as PendingIcon,
	ExpandMore as ExpandMoreIcon,
	School as BatchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SectionHeader } from './DetailedViewCommon';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingAssessment } from '../../../models/training';
import type { Candidate } from '../../../models/candidate';

interface CandidateAssessmentTabProps {
	candidate: Candidate;
}

const CandidateAssessmentTab: React.FC<CandidateAssessmentTabProps> = ({ candidate }) => {
	const [assessments, setAssessments] = useState<TrainingAssessment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			if (!candidate.public_id) return;
			try {
				const data = await trainingExtensionService.getCandidateAssessments(candidate.public_id);
				setAssessments(data);
			} catch (error) {
				console.error('Failed to fetch assessments:', error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [candidate.public_id]);

	// Group assessments by batch
	const assessmentsByBatch = useMemo(() => {
		const grouped = new Map<number, { batch: any; records: TrainingAssessment[] }>();

		assessments.forEach(record => {
			if (!record.batch) return;

			if (!grouped.has(record.batch_id)) {
				grouped.set(record.batch_id, { batch: record.batch, records: [] });
			}
			grouped.get(record.batch_id)!.records.push(record);
		});

		return Array.from(grouped.values());
	}, [assessments]);

	// Overall statistics
	const overallStats = useMemo(() => {
		if (assessments.length === 0) return { avgPercentage: 0, total: 0 };
		const totalPercentage = assessments.reduce((sum, a) => {
			const perc = (a.marks_obtained / a.max_marks) * 100;
			return sum + perc;
		}, 0);
		return {
			avgPercentage: (totalPercentage / assessments.length).toFixed(1),
			total: assessments.length
		};
	}, [assessments]);

	// Batch-specific statistics
	const getBatchStats = (records: TrainingAssessment[]) => {
		if (records.length === 0) return { avgPercentage: 0, total: 0 };
		const totalPercentage = records.reduce((sum, a) => {
			const perc = (a.marks_obtained / a.max_marks) * 100;
			return sum + perc;
		}, 0);
		return {
			avgPercentage: (totalPercentage / records.length).toFixed(1),
			total: records.length
		};
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	const renderRating = (percentage: number) => {
		let color = '#318400'; // Green
		if (percentage < 40) color = '#d91d11'; // Red
		else if (percentage < 70) color = '#ec7211'; // Orange

		return (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<Box sx={{ flexGrow: 1, minWidth: 80 }}>
					<LinearProgress
						variant="determinate"
						value={percentage}
						sx={{
							height: 6,
							borderRadius: 3,
							bgcolor: '#eaeded',
							'& .MuiLinearProgress-bar': { bgcolor: color }
						}}
					/>
				</Box>
				<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e', width: '40px' }}>
					{percentage.toFixed(0)}%
				</Typography>
			</Box>
		);
	};

	return (
		<Paper
			variant="outlined"
			sx={{ p: 3, borderRadius: 0, border: '1px solid #d5dbdb', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)' }}
		>
			<SectionHeader title="Assessment Performance" icon={<AssessmentIcon />} />

			{assessments.length > 0 ? (
				<>
					{/* Overall Summary Strip */}
					<Box sx={{ display: 'flex', gap: 6, mb: 4, bgcolor: '#f8f9fa', p: 2.5, border: '1px solid #eaeded', borderRadius: '2px' }}>
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Total Assessments
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#232f3e' }}>{overallStats.total}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box flexGrow={1} maxWidth={400}>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Overall Average Proficiency
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<Typography variant="h5" sx={{ fontWeight: 800, color: '#232f3e' }}>{overallStats.avgPercentage}%</Typography>
								<Box sx={{ flexGrow: 1 }}>
									<LinearProgress
										variant="determinate"
										value={typeof overallStats.avgPercentage === 'string' ? parseFloat(overallStats.avgPercentage) : overallStats.avgPercentage}
										sx={{
											height: 8,
											borderRadius: 4,
											bgcolor: '#eaeded',
											'& .MuiLinearProgress-bar': { bgcolor: '#007eb9' }
										}}
									/>
								</Box>
							</Box>
						</Box>
					</Box>

					{/* Assessments by Batch */}
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
						Assessments by Training Batch
					</Typography>

					{assessmentsByBatch.map(({ batch, records }, index) => {
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
												{records.length} assessments • {batchStats.avgPercentage}% average
											</Typography>
										</Box>
										<Box sx={{ mr: 2 }}>
											<Typography variant="caption" sx={{ color: '#545b64', display: 'block' }}>Batch Average</Typography>
											<Typography variant="body2" sx={{ fontWeight: 700, color: '#007eb9' }}>{batchStats.avgPercentage}%</Typography>
										</Box>
									</Box>
								</AccordionSummary>
								<AccordionDetails sx={{ p: 0 }}>
									<TableContainer>
										<Table size="small">
											<TableHead sx={{ bgcolor: '#f8f9fa' }}>
												<TableRow>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>ASSESSMENT NAME</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>MARKS</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>PROFICIENCY</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>DATE</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{records.map((row) => (
													<TableRow key={row.id} hover>
														<TableCell sx={{ color: '#232f3e', fontWeight: 600 }}>
															{row.assessment_name}
														</TableCell>
														<TableCell sx={{ color: '#232f3e' }}>
															<Typography variant="body2" sx={{ fontWeight: 500 }}>
																{row.marks_obtained} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>/ {row.max_marks}</Box>
															</Typography>
														</TableCell>
														<TableCell sx={{ width: '200px' }}>
															{renderRating((row.marks_obtained / row.max_marks) * 100)}
														</TableCell>
														<TableCell sx={{ color: '#545b64' }}>
															{format(new Date(row.assessment_date), 'MMM dd, yyyy')}
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
					<PendingIcon sx={{ fontSize: 48, color: '#aab7b8', mb: 2 }} />
					<Typography variant="h6" sx={{ color: '#545b64', fontWeight: 600 }}>No Assessment Records Found</Typography>
					<Typography variant="body2" color="text.secondary">
						Detailed performance metrics will appear here once the candidate completes their first training assessment.
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default CandidateAssessmentTab;
