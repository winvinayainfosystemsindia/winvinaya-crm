import React, { useState, useEffect, useMemo } from 'react';
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
	Divider,
	Stack,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	useTheme,
	alpha
} from '@mui/material';
import {
	Assessment as AssessmentIcon,
	ExpandMore as ExpandMoreIcon,
	School as BatchIcon
} from '@mui/icons-material';
import { useDateTime } from '../../../../hooks/useDateTime';
import { SectionHeader, SectionCard } from '../DetailedViewCommon';
import candidateAnalysisService from '../../../../services/candidateAnalysisService';
import type { CandidateAnalysis } from '../../../../models/CandidateAnalysis';
import type { Candidate } from '../../../../models/candidate';

interface CandidateAnalysisTabProps {
	candidate: Candidate;
}

const CandidateAnalysisTab: React.FC<CandidateAnalysisTabProps> = ({ candidate }) => {
	const theme = useTheme();
	const { formatDate } = useDateTime();
	const [analyses, setAnalyses] = useState<CandidateAnalysis[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			if (!candidate.public_id) return;
			try {
				const data = await candidateAnalysisService.getByCandidateId(candidate.public_id);
				setAnalyses(data);
			} catch (error) {
				console.error('Failed to fetch candidate analyses:', error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [candidate.public_id]);

	// Group analyses by batch
	const analysesByBatch = useMemo(() => {
		const grouped = new Map<number, { batch: NonNullable<CandidateAnalysis['batch']>; records: CandidateAnalysis[] }>();

		analyses.forEach(record => {
			if (!record.batch) return;

			if (!grouped.has(record.batch_id)) {
				grouped.set(record.batch_id, { batch: record.batch, records: [] });
			}
			grouped.get(record.batch_id)!.records.push(record);
		});

		return Array.from(grouped.values());
	}, [analyses]);

	const getRecommendationChip = (rec: string) => {
		switch (rec) {
			case 'ready_for_placement':
				return <Chip label="Ready for Placement" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 700 }} />;
			case 'needs_additional_training':
				return <Chip label="Needs Training" size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark', fontWeight: 700 }} />;
			case 'assign_dsr_project':
				return <Chip label="Assign DSR" size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontWeight: 700 }} />;
			case 'counseling_required':
				return <Chip label="Counseling Required" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontWeight: 700 }} />;
			default:
				return <Chip label={(rec || '').replace(/_/g, ' ').toUpperCase()} size="small" />;
		}
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
			<SectionHeader title="Candidate Analysis Portfolio" icon={<AssessmentIcon />} />

			{analyses.length > 0 ? (
				<>
					{/* Overall Summary Strip */}
					<Box sx={{ display: 'flex', gap: 6, mb: 4, bgcolor: alpha(theme.palette.background.default, 0.5), p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '2px' }}>
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Total Evaluations
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{analyses.length}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Ready for Placement
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
								{analyses.filter(a => a.recommendation === 'ready_for_placement').length}
							</Typography>
						</Box>
					</Box>

					{/* Analyses by Batch */}
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
						Evaluations by Training Batch
					</Typography>

					{analysesByBatch.map(({ batch, records }, index) => {
						return (
							<Accordion
								key={batch.id}
								defaultExpanded={index === 0}
								sx={{
									mb: 2,
									border: '1px solid',
									borderColor: 'divider',
									'&:before': { display: 'none' },
									boxShadow: 'none'
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									sx={{ bgcolor: alpha(theme.palette.background.default, 0.3), '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.6) } }}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
										<BatchIcon sx={{ color: 'primary.main', fontSize: 20 }} />
										<Box sx={{ flexGrow: 1 }}>
											<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
												{batch.batch_name}
											</Typography>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>
												{records.length} evaluations
											</Typography>
										</Box>
									</Box>
								</AccordionSummary>
								<AccordionDetails sx={{ p: 0 }}>
									<TableContainer>
										<Table size="small">
											<TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
												<TableRow>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>DATE</TableCell>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>EVALUATOR</TableCell>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>STATUS</TableCell>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>RECOMMENDATION</TableCell>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>STRENGTHS/WEAKNESSES</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{records.map((row) => (
													<TableRow key={row.id} hover>
														<TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
															{formatDate(row.analysis_date)}
														</TableCell>
														<TableCell sx={{ color: 'text.primary' }}>
															{row.analyst_name || 'Unassigned'}
														</TableCell>
														<TableCell>
															<Chip label={row.status.toUpperCase()} size="small" variant="outlined" color={row.status === 'completed' ? 'success' : 'warning'} />
														</TableCell>
														<TableCell>{getRecommendationChip(row.recommendation)}</TableCell>
														<TableCell sx={{ color: 'text.secondary', maxWidth: 300 }}>
															<Stack spacing={0.5}>
																<Typography variant="caption" noWrap>
																	<b>Strengths:</b> {row.strengths || 'N/A'}
																</Typography>
																<Typography variant="caption" noWrap>
																	<b>Weaknesses:</b> {row.weaknesses || 'N/A'}
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
				<Box sx={{ textAlign: 'center', py: 8, bgcolor: alpha(theme.palette.background.default, 0.5), border: '1px dashed', borderColor: 'divider', borderRadius: '2px' }}>
					<AssessmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
					<Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Analysis Records</Typography>
					<Typography variant="body2" color="text.secondary">
						Once the candidate completes their analysis and assessment, the results will appear here.
					</Typography>
				</Box>
			)}
		</SectionCard>
	);
};

export default CandidateAnalysisTab;
