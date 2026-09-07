import React, { useEffect } from 'react';
import {
	Box,
	Grid,
	Paper,
	Typography,
	LinearProgress,
	Chip,
	Stack,
	Tooltip,
	useTheme,
	alpha
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCandidateStats } from '../../../store/slices/candidateSlice';
import {
	Groups as CandidatesIcon,
	Accessible as PwDIcon,
	Person as NonPwDIcon,
	AssignmentTurnedIn as ComplianceIcon,
	CheckCircle as CompletedIcon,
	HourglassEmpty as PendingIcon,
	FolderOff as NotStartedIcon,
	Check as CheckIcon,
	Schedule as ScheduleIcon
} from '@mui/icons-material';

/**
 * DocumentStats - Premium, intuitive dashboard for Document Collection metrics.
 * Provides real-time candidate counts, total document targets, collected documents, and compliance tracking.
 */
const DocumentStats: React.FC = () => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { stats } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		if (!stats) {
			dispatch(fetchCandidateStats());
		}
	}, [dispatch, stats]);

	if (!stats) return null;

	// Total Metrics
	const totalCandidates = stats.docs_total || 0;
	const filesCollected = stats.files_collected || 0;
	const filesToCollect = stats.files_to_collect || 0;
	const overallProgress = filesToCollect > 0 ? Math.min(100, Math.round((filesCollected / filesToCollect) * 100)) : 0;

	// PwD Candidate Metrics (10 docs per candidate)
	const pwdCount = stats.pwd_candidates ?? 0;
	const pwdFilesToCollect = stats.pwd_files_to_collect ?? (pwdCount * 10);
	const pwdFilesCollected = stats.pwd_files_collected ?? 0;
	const pwdFilesPending = stats.pwd_files_pending ?? Math.max(0, pwdFilesToCollect - pwdFilesCollected);
	const pwdProgress = pwdFilesToCollect > 0 ? Math.min(100, Math.round((pwdFilesCollected / pwdFilesToCollect) * 100)) : 0;

	// Non-PwD Candidate Metrics (9 docs per candidate)
	const nonPwdCount = stats.non_pwd_candidates ?? 0;
	const nonPwdFilesToCollect = stats.non_pwd_files_to_collect ?? (nonPwdCount * 9);
	const nonPwdFilesCollected = stats.non_pwd_files_collected ?? 0;
	const nonPwdFilesPending = stats.non_pwd_files_pending ?? Math.max(0, nonPwdFilesToCollect - nonPwdFilesCollected);
	const nonPwdProgress = nonPwdFilesToCollect > 0 ? Math.min(100, Math.round((nonPwdFilesCollected / nonPwdFilesToCollect) * 100)) : 0;

	// Compliance Status Metrics
	const fullySubmitted = stats.candidates_fully_submitted || 0;
	const partiallySubmitted = stats.candidates_partially_submitted || 0;
	const notSubmitted = stats.candidates_not_submitted || 0;
	const compliancePercent = totalCandidates > 0 ? Math.min(100, Math.round((fullySubmitted / totalCandidates) * 100)) : 0;

	const cardPaperSx = {
		p: 2.2,
		height: '100%',
		borderRadius: 2,
		border: '1px solid',
		borderColor: 'divider',
		bgcolor: 'background.paper',
		boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
		transition: 'all 0.2s ease-in-out',
		'&:hover': {
			boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
			borderColor: theme.palette.primary.main
		}
	};

	return (
		<Box sx={{ mb: 3 }}>
			<Grid container spacing={2.5}>
				{/* Card 1: Total Candidates & Document Target */}
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Paper elevation={0} sx={{ ...cardPaperSx, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
						<Stack spacing={1.5}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
									Total Candidates
								</Typography>
								<Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
									<CandidatesIcon />
								</Box>
							</Box>

							<Box>
								<Stack direction="row" spacing={1} alignItems="baseline">
									<Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
										{totalCandidates}
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
										Candidates Total
									</Typography>
								</Stack>

								<Box sx={{ mt: 1.5 }}>
									<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
										<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
											Collected:
										</Typography>
										<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
											{filesCollected} / {filesToCollect} ({overallProgress}%)
										</Typography>
									</Stack>
									<LinearProgress
										variant="determinate"
										value={overallProgress}
										sx={{
											height: 6,
											borderRadius: 3,
											bgcolor: alpha(theme.palette.primary.main, 0.1),
											'& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'primary.main' }
										}}
									/>
								</Box>
							</Box>
						</Stack>
					</Paper>
				</Grid>

				{/* Card 2: PwD Candidate Breakdown */}
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Paper elevation={0} sx={{ ...cardPaperSx, borderLeft: '4px solid #059669' }}>
						<Stack spacing={1.2}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={1} alignItems="center">
									<PwDIcon sx={{ color: '#059669', fontSize: 20 }} />
									<Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 }}>
										PwD Candidates
									</Typography>
								</Stack>
								<Chip
									label={`${pwdCount} Candidates`}
									size="small"
									sx={{ fontWeight: 800, bgcolor: alpha('#059669', 0.12), color: '#059669', height: 22, fontSize: '0.72rem' }}
								/>
							</Box>

							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
								Target: <strong>{pwdFilesToCollect}</strong> docs ({pwdCount} × 10 docs)
							</Typography>

							<Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
								<Tooltip title={`${pwdFilesCollected} out of ${pwdFilesToCollect} documents collected`}>
									<Chip
										icon={<CheckIcon sx={{ fontSize: '13px !important' }} />}
										label={`${pwdFilesCollected} Collected`}
										size="small"
										color="success"
										sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
									/>
								</Tooltip>

								<Tooltip title={`${pwdFilesPending} documents remaining to be collected`}>
									<Chip
										icon={<ScheduleIcon sx={{ fontSize: '13px !important' }} />}
										label={`${pwdFilesPending} Pending`}
										size="small"
										color="warning"
										variant="outlined"
										sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
									/>
								</Tooltip>
							</Stack>

							<LinearProgress
								variant="determinate"
								value={pwdProgress}
								sx={{
									height: 5,
									borderRadius: 3,
									bgcolor: alpha('#059669', 0.1),
									'& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#059669' }
								}}
							/>
						</Stack>
					</Paper>
				</Grid>

				{/* Card 3: Non-PwD Candidate Breakdown */}
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Paper elevation={0} sx={{ ...cardPaperSx, borderLeft: '4px solid #6366f1' }}>
						<Stack spacing={1.2}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={1} alignItems="center">
									<NonPwDIcon sx={{ color: '#6366f1', fontSize: 20 }} />
									<Typography variant="caption" sx={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
										Non-PwD Candidates
									</Typography>
								</Stack>
								<Chip
									label={`${nonPwdCount} Candidates`}
									size="small"
									sx={{ fontWeight: 800, bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', height: 22, fontSize: '0.72rem' }}
								/>
							</Box>

							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
								Target: <strong>{nonPwdFilesToCollect}</strong> docs ({nonPwdCount} × 9 docs)
							</Typography>

							<Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
								<Tooltip title={`${nonPwdFilesCollected} out of ${nonPwdFilesToCollect} documents collected`}>
									<Chip
										icon={<CheckIcon sx={{ fontSize: '13px !important' }} />}
										label={`${nonPwdFilesCollected} Collected`}
										size="small"
										color="success"
										sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
									/>
								</Tooltip>

								<Tooltip title={`${nonPwdFilesPending} documents remaining to be collected`}>
									<Chip
										icon={<ScheduleIcon sx={{ fontSize: '13px !important' }} />}
										label={`${nonPwdFilesPending} Pending`}
										size="small"
										color="warning"
										variant="outlined"
										sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
									/>
								</Tooltip>
							</Stack>

							<LinearProgress
								variant="determinate"
								value={nonPwdProgress}
								sx={{
									height: 5,
									borderRadius: 3,
									bgcolor: alpha('#6366f1', 0.1),
									'& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#6366f1' }
								}}
							/>
						</Stack>
					</Paper>
				</Grid>

				{/* Card 4: Clear Candidate Compliance Tracking */}
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Paper elevation={0} sx={{ ...cardPaperSx, borderLeft: '4px solid #0d9488' }}>
						<Stack spacing={1.5}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
									Candidate Compliance
								</Typography>
								<Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#0d9488', 0.1), color: '#0d9488', display: 'flex' }}>
									<ComplianceIcon />
								</Box>
							</Box>

							<Box>
								<Stack direction="row" spacing={1} alignItems="baseline">
									<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
										{fullySubmitted} <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>/ {totalCandidates} Candidates</Typography>
									</Typography>
									<Chip
										label={`${compliancePercent}%`}
										size="small"
										color={compliancePercent === 100 ? 'success' : 'info'}
										sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem', ml: 'auto' }}
									/>
								</Stack>

								<Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.2 }}>
									<Tooltip title={`${fullySubmitted} candidates have submitted ALL required documents`}>
										<Chip
											icon={<CompletedIcon sx={{ fontSize: '13px !important' }} />}
											label={`${fullySubmitted} Complete`}
											size="small"
											color="success"
											sx={{ fontWeight: 700, fontSize: '0.68rem', height: 21 }}
										/>
									</Tooltip>

									<Tooltip title={`${partiallySubmitted} candidates have partially submitted documents`}>
										<Chip
											icon={<PendingIcon sx={{ fontSize: '13px !important' }} />}
											label={`${partiallySubmitted} Partial`}
											size="small"
											color="warning"
											variant="outlined"
											sx={{ fontWeight: 700, fontSize: '0.68rem', height: 21 }}
										/>
									</Tooltip>

									{notSubmitted > 0 && (
										<Tooltip title={`${notSubmitted} candidates have 0 documents submitted`}>
											<Chip
												icon={<NotStartedIcon sx={{ fontSize: '13px !important' }} />}
												label={`${notSubmitted} Pending`}
												size="small"
												color="error"
												variant="outlined"
												sx={{ fontWeight: 700, fontSize: '0.68rem', height: 21 }}
											/>
										</Tooltip>
									)}
								</Stack>
							</Box>
						</Stack>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default React.memo(DocumentStats);
