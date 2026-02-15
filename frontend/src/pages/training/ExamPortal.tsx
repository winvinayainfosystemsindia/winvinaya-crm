import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Container,
	Paper,
	Typography,
	TextField,
	Button,
	Stack,
	CircularProgress,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	LinearProgress,
	Alert,
	Divider
} from '@mui/material';
import {
	Security as SecurityIcon,
	Timer as TimerIcon,
	Send as SendIcon,
	ContentCopy as CopyIcon,
	Download as DownloadIcon,
	Launch as LaunchIcon,
	Email as EmailIcon,
	CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import type { Assessment } from '../../models/training';
import assessmentService from '../../services/assessmentService';

const isUsingSEB = () => {
	const ua = navigator.userAgent;
	return ua.includes('SEB') || ua.includes('SafeExamBrowser');
};

const ExamPortal: React.FC = () => {
	const { publicId } = useParams<{ publicId: string }>();
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();

	const [loading, setLoading] = useState(true);
	const [assessment, setAssessment] = useState<Assessment | null>(null);
	const [phase, setPhase] = useState<'verification' | 'exam' | 'result'>('verification');

	// Verification State
	const [email, setEmail] = useState('');
	const [dob, setDob] = useState('');

	// Exam State
	const [resultId, setResultId] = useState<number | null>(null);
	const [responses, setResponses] = useState<Record<number, string>>({});
	const [timeLeft, setTimeLeft] = useState(0);
	const timerRef = useRef<any>(null);

	// Result State
	const [score, setScore] = useState<number | null>(null);

	const loadAssessment = async () => {
		if (!publicId) return;
		try {
			setLoading(true);
			const data = await assessmentService.getPublicAssessment(publicId);
			setAssessment(data);
		} catch (error) {
			enqueueSnackbar('Assessment not found or unavailable', { variant: 'error' });
			navigate('/training');
		} finally {
			setLoading(false);
		}
	};

	const showSEBWarning = assessment?.include_seb && !isUsingSEB();

	useEffect(() => {
		loadAssessment();
	}, [publicId]);

	const handleStart = async () => {
		if (!email || !dob || !assessment || !publicId) return;

		try {
			const result = await assessmentService.startAssessment(publicId, {
				email,
				dob
			});
			setResultId(result.id);
			setTimeLeft(assessment.duration_minutes * 60);
			setPhase('exam');
			startTimer();
		} catch (error: any) {
			enqueueSnackbar(error.response?.data?.detail || 'Verification failed', { variant: 'error' });
		}
	};

	const startTimer = () => {
		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					if (timerRef.current) clearInterval(timerRef.current);
					handleSubmit();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const handleSubmit = async () => {
		if (!resultId) return;
		if (timerRef.current) clearInterval(timerRef.current);

		try {
			setLoading(true);
			const formattedResponses = Object.entries(responses).map(([qId, val]) => ({
				question_id: parseInt(qId),
				selected_answer: val
			}));

			const result = await assessmentService.submitAssessment(resultId, {
				responses: formattedResponses
			});
			setScore(result.total_score);
			setPhase('result');
		} catch (error) {
			enqueueSnackbar('Error submitting assessment', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	if (loading && phase !== 'exam') return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
	if (!assessment) return null;

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh', py: 5 }}>
			<Container maxWidth="md">
				{/* Header */}
				<Paper sx={{ p: 3, mb: 3, borderTop: '4px solid #ff9900' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h5" sx={{ fontWeight: 800 }}>{assessment.title}</Typography>
							<Typography variant="body2" color="text.secondary">{assessment.description}</Typography>
						</Box>
						{phase === 'exam' && (
							<Box sx={{ textAlign: 'right' }}>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ color: timeLeft < 60 ? 'error.main' : 'inherit' }}>
									<TimerIcon fontSize="small" />
									<Typography variant="h6" sx={{ fontWeight: 800 }}>{formatTime(timeLeft)}</Typography>
								</Stack>
								<Typography variant="caption" color="text.secondary">Time Remaining</Typography>
							</Box>
						)}
					</Stack>
				</Paper>

				{/* Professional SEB Blocker Page */}
				{showSEBWarning && (
					<Box sx={{ py: 4 }}>
						<Paper sx={{ p: 4, borderRadius: 2, border: '1px solid #d5dbdb', boxShadow: 3 }}>
							<Stack spacing={4}>
								<Box sx={{ textAlign: 'center' }}>
									<SecurityIcon sx={{ fontSize: 64, color: '#ec7211', mb: 2 }} />
									<Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Security Requirement</Typography>
									<Typography variant="body1" color="text.secondary">
										This assessment requires a secure testing environment to ensure academic integrity.
									</Typography>
								</Box>

								<Divider sx={{ borderStyle: 'dashed' }} />

								<Box>
									<Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
										Follow these steps to proceed:
									</Typography>

									<Stack spacing={3}>
										<Box sx={{ display: 'flex', gap: 2 }}>
											<Box sx={{
												width: 32, height: 32, borderRadius: '50%', bgcolor: '#232f3e',
												color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
												flexShrink: 0, fontWeight: 800
											}}>1</Box>
											<Box>
												<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Install Safe Exam Browser (SEB)</Typography>
												<Typography variant="body2" sx={{ mb: 1 }}>If you haven't installed it yet, please download and install the official version for your operating system.</Typography>
												<Button
													variant="outlined"
													size="small"
													startIcon={<DownloadIcon />}
													href="https://safeexambrowser.org/download_en.html"
													target="_blank"
													sx={{ textTransform: 'none' }}
												>
													Download SEB v3.4+
												</Button>
											</Box>
										</Box>

										<Box sx={{ display: 'flex', gap: 2 }}>
											<Box sx={{
												width: 32, height: 32, borderRadius: '50%', bgcolor: '#232f3e',
												color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
												flexShrink: 0, fontWeight: 800
											}}>2</Box>
											<Box>
												<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Launch Secure Session</Typography>
												<Typography variant="body2" sx={{ mb: 1 }}>Click the button below to automatically open this assessment in the Safe Exam Browser app.</Typography>
												<Button
													variant="contained"
													color="warning"
													startIcon={<LaunchIcon />}
													href={`seb${window.location.href.replace(/^http/, '')}`}
													sx={{
														fontWeight: 800,
														textTransform: 'none',
														bgcolor: '#ff9900',
														'&:hover': { bgcolor: '#ec7211' }
													}}
												>
													Launch Safe Exam Browser
												</Button>
											</Box>
										</Box>

										<Box sx={{ display: 'flex', gap: 2 }}>
											<Box sx={{
												width: 32, height: 32, borderRadius: '50%', bgcolor: '#232f3e',
												color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
												flexShrink: 0, fontWeight: 800
											}}>3</Box>
											<Box>
												<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Manual Fallback</Typography>
												<Typography variant="body2" sx={{ mb: 1 }}>If the launch button doesn't work, copy the link below and paste it directly into the SEB address bar.</Typography>
												<Button
													variant="text"
													size="small"
													startIcon={<CopyIcon />}
													onClick={() => {
														navigator.clipboard.writeText(window.location.href);
														enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
													}}
													sx={{ textTransform: 'none' }}
												>
													Copy Secure Link
												</Button>
											</Box>
										</Box>
									</Stack>
								</Box>

								<Box sx={{ p: 2, bgcolor: '#fff4e5', border: '1px solid #ffe2b7', borderRadius: 1 }}>
									<Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<SecurityIcon sx={{ fontSize: 16 }} />
										Academic integrity is monitored. Unauthorized browser extensions or tab switching will be blocked during the exam.
									</Typography>
								</Box>
							</Stack>
						</Paper>
					</Box>
				)}

				{/* Phase 1: Verification */}
				{phase === 'verification' && (
					<Paper sx={{ p: 4 }}>
						<Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Candidate Verification</Typography>
						<Box component="form" onSubmit={(e) => { e.preventDefault(); handleStart(); }}>
							<Stack spacing={3}>
								<Alert severity="info" sx={{ py: 1.5, '& .MuiAlert-message': { fontWeight: 500 } }}>Please enter your registered Email Address and Date of Birth to begin the assessment.</Alert>
								<TextField
									fullWidth
									label="Email Address"
									variant="outlined"
									placeholder="yourname@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
								/>
								<TextField
									fullWidth
									label="Date of Birth"
									variant="outlined"
									type="date"
									value={dob}
									onChange={(e) => setDob(e.target.value)}
									InputProps={{
										startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
									}}
									InputLabelProps={{ shrink: true }}
								/>
								<Button
									fullWidth
									type="submit"
									variant="contained"
									size="large"
									disabled={showSEBWarning || !email || !dob}
									sx={{ bgcolor: '#ff9900', color: '#232f3e', fontWeight: 800, '&:hover': { bgcolor: '#ec7211' }, py: 1.5 }}
								>
									Begin Assessment
								</Button>

								{showSEBWarning && (
									<Button
										fullWidth
										variant="outlined"
										color="primary"
										onClick={() => {
											navigator.clipboard.writeText(window.location.href);
											enqueueSnackbar('Exam link copied! Paste this into Safe Exam Browser.', { variant: 'success' });
										}}
										sx={{ textTransform: 'none', fontWeight: 600 }}
									>
										Copy Exam Link for SEB
									</Button>
								)}
							</Stack>
						</Box>
					</Paper>
				)}

				{/* Phase 2: Active Exam */}
				{phase === 'exam' && (
					<Stack spacing={3}>
						<LinearProgress
							variant="determinate"
							value={(timeLeft / (assessment.duration_minutes * 60)) * 100}
							sx={{ height: 8, borderRadius: 4, bgcolor: '#d5dbdb', '& .MuiLinearProgress-bar': { bgcolor: '#ff9900' } }}
						/>

						{assessment.questions?.map((q, idx) => (
							<Paper key={q.id} sx={{ p: 4 }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
									{idx + 1}. {q.text}
								</Typography>

								{q.type === 'MCQ' ? (
									<FormControl component="fieldset">
										<RadioGroup
											value={responses[q.id!] || ''}
											onChange={(e) => setResponses({ ...responses, [q.id!]: e.target.value })}
										>
											{(q.options as string[]).map((opt, oIdx) => (
												<FormControlLabel
													key={oIdx}
													value={opt}
													control={<Radio />}
													label={opt}
												/>
											))}
										</RadioGroup>
									</FormControl>
								) : (
									<FormControl component="fieldset">
										<RadioGroup
											value={responses[q.id!] || ''}
											onChange={(e) => setResponses({ ...responses, [q.id!]: e.target.value })}
										>
											<FormControlLabel value="True" control={<Radio />} label="True" />
											<FormControlLabel value="False" control={<Radio />} label="False" />
										</RadioGroup>
									</FormControl>
								)}
							</Paper>
						))}

						<Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
							<Button
								variant="contained"
								size="large"
								startIcon={<SendIcon />}
								onClick={handleSubmit}
								sx={{ bgcolor: '#232f3e', color: 'white', px: 10, fontWeight: 800, '&:hover': { bgcolor: '#1a242e' } }}
							>
								Submit and Finish
							</Button>
						</Box>
					</Stack>
				)}

				{/* Phase 3: Result */}
				{phase === 'result' && (
					<Paper sx={{ p: 5, textAlign: 'center' }}>
						<Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#318400' }}>Congratulations!</Typography>
						<Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>You have successfully completed the assessment.</Typography>

						<Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, display: 'inline-block', minWidth: 200 }}>
							<Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, color: 'text.secondary' }}>Your Score</Typography>
							<Typography variant="h2" sx={{ fontWeight: 900, color: '#232f3e' }}>{score}</Typography>
						</Box>

						<Typography variant="body1" sx={{ mb: 4 }}>
							{score! >= (assessment.questions?.reduce((sum, q) => sum + q.marks, 0) || 0) * (assessment.pass_percentage / 100)
								? "Great job! You have passed this assessment."
								: "You did not meet the passing criteria for this assessment. Please check with your trainer."}
						</Typography>

						<Button variant="outlined" onClick={() => navigate('/training')}>Return to Dashboard</Button>
					</Paper>
				)}
			</Container>
		</Box>
	);
};

export default ExamPortal;
