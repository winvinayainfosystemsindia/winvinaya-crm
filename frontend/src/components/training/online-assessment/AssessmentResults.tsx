import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	CircularProgress,
	Chip,
	Stack
} from '@mui/material';
import {
	CheckCircle as SuccessIcon,
	Cancel as FailedIcon,
	Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Assessment, AssessmentResult } from '../../../models/training';
import assessmentService from '../../../services/assessmentService';

interface AssessmentResultsProps {
	assessment: Assessment;
	open: boolean;
	onClose: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ assessment: partialAssessment, open, onClose }) => {
	const [results, setResults] = useState<AssessmentResult[]>([]);
	const [assessment, setAssessment] = useState<Assessment | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (open && partialAssessment.public_id) {
			loadData();
		}
	}, [open, partialAssessment.public_id]);

	const loadData = async () => {
		try {
			setLoading(true);
			// Load full assessment with questions
			const fullAssessment = await assessmentService.getPublicAssessment(partialAssessment.public_id!);
			setAssessment(fullAssessment);

			// Load results
			const resultsData = await assessmentService.getAssessmentResults(partialAssessment.id!);
			setResults(resultsData);
		} catch (error) {
			console.error('Failed to load assessment data:', error);
		} finally {
			setLoading(false);
		}
	};

	// Calculate max marks from results if questions are not available on the assessment object
	const maxMarks = assessment?.questions?.length
		? assessment.questions.reduce((sum, q) => sum + (q.marks || 0), 0)
		: (results.length > 0 && results[0].responses?.length
			? results[0].responses.reduce((sum, _) => sum + 1, 0) // Fallback to 1 mark per response if unknown
			: 100); // Default fallback

	const passMarks = maxMarks * ((assessment?.pass_percentage || partialAssessment.pass_percentage || 40) / 100);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: 'white', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>{assessment?.title || partialAssessment.title} - Results</Typography>
						<Typography variant="caption" sx={{ color: '#aab7b8' }}>
							Pass Criteria: {assessment?.pass_percentage || partialAssessment.pass_percentage}% ({passMarks.toFixed(1)} / {maxMarks} Marks)
						</Typography>
					</Box>
				</Stack>
			</DialogTitle>
			<DialogContent sx={{ p: 0 }}>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
						<CircularProgress />
					</Box>
				) : results.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 10 }}>
						<Typography variant="body1" color="text.secondary">No submissions yet.</Typography>
					</Box>
				) : (
					<TableContainer component={Paper} elevation={0}>
						<Table>
							<TableHead sx={{ bgcolor: '#f8f9fa' }}>
								<TableRow>
									<TableCell sx={{ fontWeight: 800 }}>Candidate Name</TableCell>
									<TableCell sx={{ fontWeight: 800 }}>Submission Time</TableCell>
									<TableCell sx={{ fontWeight: 800 }} align="center">Score</TableCell>
									<TableCell sx={{ fontWeight: 800 }} align="center">Status</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{results.map((r) => {
									const isPass = r.total_score >= passMarks;
									return (
										<TableRow key={r.id} hover>
											<TableCell>
												<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
													{r.candidate_name || 'N/A'}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{r.candidate_email}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{r.submitted_at ? format(new Date(r.submitted_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
												</Typography>
											</TableCell>
											<TableCell align="center">
												<Typography variant="body2" sx={{ fontWeight: 800, color: isPass ? '#318400' : '#d13212' }}>
													{r.total_score.toFixed(1)} / {maxMarks}
												</Typography>
											</TableCell>
											<TableCell align="center">
												<Chip
													size="small"
													icon={isPass ? <SuccessIcon /> : <FailedIcon />}
													label={isPass ? "Passed" : "Failed"}
													color={isPass ? "success" : "error"}
													sx={{ fontWeight: 800, px: 1 }}
												/>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #eaeded' }}>
				<Button onClick={onClose} variant="outlined" sx={{ fontWeight: 700 }}>
					Close
				</Button>
				<Button
					variant="contained"
					startIcon={<DownloadIcon />}
					disabled={results.length === 0}
					sx={{ bgcolor: '#232f3e', '&:hover': { bgcolor: '#1a242e' }, fontWeight: 700 }}
				>
					Export CSV
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AssessmentResults;
