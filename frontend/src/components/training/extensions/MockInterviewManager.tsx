import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Grid,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Rating,
	Stack,
	Divider,
	CircularProgress,
	MenuItem
} from '@mui/material';
import {
	Add as AddIcon,
	Psychology as InterviewIcon,
	Person as InterviewerIcon,
} from '@mui/icons-material';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingBatch, CandidateAllocation, TrainingMockInterview } from '../../../models/training';

interface MockInterviewManagerProps {
	batch: TrainingBatch;
	allocations: CandidateAllocation[];
}

const MockInterviewManager: React.FC<MockInterviewManagerProps> = ({ batch, allocations }) => {
	const [loading, setLoading] = useState(false);
	const [interviews, setInterviews] = useState<TrainingMockInterview[]>([]);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedCandidate, setSelectedCandidate] = useState<CandidateAllocation | null>(null);

	// Form State
	const [form, setForm] = useState({
		interviewer_name: '',
		overall_rating: 3,
		feedback: '',
		status: 'cleared' as any,
		questions: [{ question: '', answer: '' }]
	});

	useEffect(() => {
		fetchInterviews();
	}, [batch.id]);

	const fetchInterviews = async () => {
		setLoading(true);
		try {
			const data = await trainingExtensionService.getMockInterviews(batch.id);
			setInterviews(data);
		} catch (error) {
			console.error('Failed to fetch mock interviews', error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenForm = (allocation: CandidateAllocation) => {
		setSelectedCandidate(allocation);
		setDialogOpen(true);
	};

	const handleAddQuestion = () => {
		setForm(prev => ({ ...prev, questions: [...prev.questions, { question: '', answer: '' }] }));
	};

	const handleQuestionChange = (index: number, field: string, value: string) => {
		const updated = [...form.questions];
		(updated[index] as any)[field] = value;
		setForm(prev => ({ ...prev, questions: updated }));
	};

	const handleSubmit = async () => {
		if (!selectedCandidate) return;
		try {
			await trainingExtensionService.createMockInterview({
				batch_id: batch.id,
				candidate_id: selectedCandidate.candidate_id,
				interview_date: new Date().toISOString(),
				...form
			});
			fetchInterviews();
			setDialogOpen(false);
			// Reset form
		} catch (error) {
			console.error('Failed to submit interview', error);
		}
	};

	const getInterviewStatusColor = (status: string) => {
		switch (status) {
			case 'cleared': return 'success';
			case 're-test': return 'warning';
			case 'rejected': return 'error';
			default: return 'default';
		}
	};

	if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;

	return (
		<Box>
			<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>Mock Interview Sessions</Typography>
			</Box>

			<Grid container spacing={3}>
				{allocations.map(allocation => {
					const candidateInterviews = interviews.filter(i => i.candidate_id === allocation.candidate_id);
					const lastInterview = candidateInterviews.length > 0 ? candidateInterviews[candidateInterviews.length - 1] : null;

					return (
						<Grid size={{ xs: 12, md: 6, lg: 4 }} key={allocation.id}>
							<Card variant="outlined" sx={{ borderRadius: '2px', height: '100%', position: 'relative' }}>
								<CardContent>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
											<Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#f2f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
												{allocation.candidate?.name?.[0]}
											</Box>
											<Box>
												<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{allocation.candidate?.name}</Typography>
												<Typography variant="caption" color="text.secondary">Total Interviews: {candidateInterviews.length}</Typography>
											</Box>
										</Box>
										{lastInterview && (
											<Chip
												label={lastInterview.status.toUpperCase()}
												size="small"
												color={getInterviewStatusColor(lastInterview.status)}
												sx={{ fontWeight: 700, borderRadius: '2px', height: 20 }}
											/>
										)}
									</Box>

									<Divider sx={{ my: 1.5 }} />

									{lastInterview ? (
										<Box>
											<Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
												<InterviewerIcon sx={{ fontSize: 16, color: '#545b64' }} />
												<Typography variant="body2"><b>Interviewer:</b> {lastInterview.interviewer_name}</Typography>
											</Stack>
											<Typography variant="body2" color="text.secondary" sx={{
												bgcolor: '#f8f9fa', p: 1, borderRadius: 1, mb: 1.5,
												fontStyle: 'italic', borderLeft: '3px solid #007eb9'
											}}>
												"{lastInterview.feedback?.substring(0, 100)}..."
											</Typography>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Typography variant="caption">Rating:</Typography>
												<Rating value={lastInterview.overall_rating} readOnly size="small" />
											</Box>
										</Box>
									) : (
										<Box sx={{ py: 2, textAlign: 'center', bgcolor: '#fcfcfc', border: '1px dashed #eaeded' }}>
											<Typography variant="body2" color="text.secondary">No Sessions Recorded</Typography>
										</Box>
									)}

									<Button
										fullWidth
										variant="outlined"
										startIcon={<AddIcon />}
										sx={{ mt: 2, textTransform: 'none' }}
										onClick={() => handleOpenForm(allocation)}
									>
										Recod New Session
									</Button>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Mock Interview Record - {selectedCandidate?.candidate?.name}</DialogTitle>
				<DialogContent dividers>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Interviewer Name"
								size="small"
								value={form.interviewer_name}
								onChange={(e) => setForm(prev => ({ ...prev, interviewer_name: e.target.value }))}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								select
								fullWidth
								label="Status"
								size="small"
								value={form.status}
								onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
							>
								<MenuItem value="cleared">Cleared</MenuItem>
								<MenuItem value="re-test">Needs Re-test</MenuItem>
								<MenuItem value="rejected">Rejected</MenuItem>
							</TextField>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant="subtitle2" gutterBottom>Overall Rating</Typography>
							<Rating
								value={form.overall_rating}
								onChange={(_, val) => setForm(prev => ({ ...prev, overall_rating: val || 0 }))}
							/>
						</Grid>
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								multiline
								rows={3}
								label="Overall Feedback"
								value={form.feedback}
								onChange={(e) => setForm(prev => ({ ...prev, feedback: e.target.value }))}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
								<InterviewIcon sx={{ color: '#007eb9' }} /> Questions & Evaluation
							</Typography>
							<Stack spacing={2}>
								{form.questions.map((q, idx) => (
									<Box key={idx} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
										<TextField
											fullWidth
											label={`Question ${idx + 1}`}
											size="small"
											sx={{ mb: 1, bgcolor: 'white' }}
											value={q.question}
											onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
										/>
										<TextField
											fullWidth
											multiline
											rows={2}
											label="Evaluation/Answer"
											size="small"
											sx={{ bgcolor: 'white' }}
											value={q.answer}
											onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
										/>
									</Box>
								))}
								<Button variant="text" startIcon={<AddIcon />} onClick={handleAddQuestion}>Add Question</Button>
							</Stack>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#007eb9' }}>Save Record</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default MockInterviewManager;
