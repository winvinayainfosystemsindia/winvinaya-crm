import React, { useEffect } from 'react';
import {
	Box,
	Grid,
	Paper,
	Typography,
	LinearProgress,
	Chip,
	Stack,
	Divider,
	alpha
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCandidateStats } from '../../../store/slices/candidateSlice';
import {
	Accessible as PwDIcon,
	Person as NonPwDIcon,
	CheckCircle as CompletedIcon,
	HourglassEmpty as PendingIcon,
	FolderOff as NotStartedIcon,
	Check as CheckIcon,
	Schedule as ScheduleIcon,
	FilterAlt as StageIcon,
	WorkspacePremium as Stage2Icon
} from '@mui/icons-material';

// â”€â”€ Reusable stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	accentColor: string;
	candidateCount: number;
	docsPerCandidate: number;
	docsToCollect: number;
	docsCollected: number;
	docsPending: number;
}

const StatCard: React.FC<StatCardProps> = ({
	icon, label, accentColor, candidateCount,
	docsPerCandidate, docsToCollect, docsCollected, docsPending
}) => {
	const progress = docsToCollect > 0 ? Math.min(100, Math.round((docsCollected / docsToCollect) * 100)) : 0;

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				height: '100%',
				borderRadius: 2,
				border: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
				borderLeft: `4px solid ${accentColor}`,
				transition: 'box-shadow 0.2s',
				'&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }
			}}
		>
			<Stack spacing={1.2}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Stack direction="row" spacing={0.8} alignItems="center">
						{icon}
						<Typography variant="caption" sx={{ fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
							{label}
						</Typography>
					</Stack>
					<Chip
						label={`${candidateCount} Candidates`}
						size="small"
						sx={{ fontWeight: 800, bgcolor: alpha(accentColor, 0.1), color: accentColor, height: 22, fontSize: '0.72rem' }}
					/>
				</Box>

				<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
					<strong>{candidateCount}</strong> Ã— <strong>{docsPerCandidate}</strong> docs ={' '}
					<strong>{docsToCollect}</strong> total docs required
				</Typography>

				<Stack direction="row" spacing={1} alignItems="center">
					<Chip
						icon={<CheckIcon sx={{ fontSize: '13px !important' }} />}
						label={`${docsCollected} Collected`}
						size="small"
						color="success"
						sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
					/>
					<Chip
						icon={<ScheduleIcon sx={{ fontSize: '13px !important' }} />}
						label={`${docsPending} Pending`}
						size="small"
						color="warning"
						variant="outlined"
						sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
					/>
				</Stack>

				<Box>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
						<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
							Progress
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 800, color: accentColor }}>
							{progress}%
						</Typography>
					</Stack>
					<LinearProgress
						variant="determinate"
						value={progress}
						sx={{
							height: 6,
							borderRadius: 3,
							bgcolor: alpha(accentColor, 0.1),
							'& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: accentColor }
						}}
					/>
				</Box>
			</Stack>
		</Paper>
	);
};

// â”€â”€ Stage section header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface SectionHeaderProps {
	icon: React.ReactNode;
	stageLabel: string;
	stageTitle: string;
	subtitle: string;
	accentColor: string;
	totalCandidates: number;
	fullyDone: number;
	partial: number;
	notStarted: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
	icon, stageLabel, stageTitle, subtitle, accentColor,
	totalCandidates, fullyDone, partial, notStarted
}) => (
	<Box
		sx={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			flexWrap: 'wrap',
			gap: 1,
			px: 1.5,
			py: 1,
			borderRadius: 2,
			bgcolor: alpha(accentColor, 0.06),
			border: `1px solid ${alpha(accentColor, 0.2)}`
		}}
	>
		<Stack direction="row" spacing={1} alignItems="center">
			<Box sx={{ color: accentColor, display: 'flex' }}>{icon}</Box>
			<Box>
				<Stack direction="row" spacing={1} alignItems="center">
					<Chip
						label={stageLabel}
						size="small"
						sx={{ fontWeight: 800, bgcolor: accentColor, color: '#fff', height: 20, fontSize: '0.68rem', borderRadius: 1 }}
					/>
					<Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
						{stageTitle}
					</Typography>
				</Stack>
				<Typography variant="caption" color="text.secondary">{subtitle}</Typography>
			</Box>
		</Stack>

		<Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
			<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
				{totalCandidates} candidates:
			</Typography>
			<Chip
				icon={<CompletedIcon sx={{ fontSize: '12px !important' }} />}
				label={`${fullyDone} Complete`}
				size="small"
				color="success"
				sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
			/>
			<Chip
				icon={<PendingIcon sx={{ fontSize: '12px !important' }} />}
				label={`${partial} Partial`}
				size="small"
				color="warning"
				variant="outlined"
				sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
			/>
			{notStarted > 0 && (
				<Chip
					icon={<NotStartedIcon sx={{ fontSize: '12px !important' }} />}
					label={`${notStarted} Not Started`}
					size="small"
					color="error"
					variant="outlined"
					sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
				/>
			)}
		</Stack>
	</Box>
);

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * DocumentStats â€” Two-stage document collection dashboard.
 *   Stage 1: All screened candidates â†’ Resume + Consent Form (Non-PwD=2, PwD=3)
 *   Stage 2: Counseling-selected candidates â†’ Full document set (Non-PwD=9, PwD=10)
 */
const DocumentStats: React.FC = () => {
	const dispatch = useAppDispatch();
	const { stats } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		if (!stats) {
			dispatch(fetchCandidateStats());
		}
	}, [dispatch, stats]);

	if (!stats) return null;

	// Stage 1
	const s1Total          = stats.stage1_total ?? 0;
	const s1PwdCount       = stats.stage1_pwd_count ?? 0;
	const s1NonPwdCount    = stats.stage1_non_pwd_count ?? 0;
	const s1PwdToCollect   = stats.stage1_pwd_files_to_collect ?? (s1PwdCount * 3);
	const s1PwdCollected   = stats.stage1_pwd_files_collected ?? 0;
	const s1PwdPending     = stats.stage1_pwd_files_pending ?? Math.max(0, s1PwdToCollect - s1PwdCollected);
	const s1NonPwdToCollect = stats.stage1_non_pwd_files_to_collect ?? (s1NonPwdCount * 2);
	const s1NonPwdCollected = stats.stage1_non_pwd_files_collected ?? 0;
	const s1NonPwdPending  = stats.stage1_non_pwd_files_pending ?? Math.max(0, s1NonPwdToCollect - s1NonPwdCollected);
	const s1FullyDone      = stats.stage1_fully_submitted ?? 0;
	const s1Partial        = stats.stage1_partially_submitted ?? 0;
	const s1NotStarted     = stats.stage1_not_submitted ?? 0;

	// Stage 2
	const s2Total          = stats.stage2_total ?? stats.docs_total ?? 0;
	const s2PwdCount       = stats.stage2_pwd_count ?? stats.pwd_candidates ?? 0;
	const s2NonPwdCount    = stats.stage2_non_pwd_count ?? stats.non_pwd_candidates ?? 0;
	const s2PwdToCollect   = stats.stage2_pwd_files_to_collect ?? stats.pwd_files_to_collect ?? (s2PwdCount * 10);
	const s2PwdCollected   = stats.stage2_pwd_files_collected ?? stats.pwd_files_collected ?? 0;
	const s2PwdPending     = stats.stage2_pwd_files_pending ?? stats.pwd_files_pending ?? Math.max(0, s2PwdToCollect - s2PwdCollected);
	const s2NonPwdToCollect = stats.stage2_non_pwd_files_to_collect ?? stats.non_pwd_files_to_collect ?? (s2NonPwdCount * 9);
	const s2NonPwdCollected = stats.stage2_non_pwd_files_collected ?? stats.non_pwd_files_collected ?? 0;
	const s2NonPwdPending  = stats.stage2_non_pwd_files_pending ?? stats.non_pwd_files_pending ?? Math.max(0, s2NonPwdToCollect - s2NonPwdCollected);
	const s2FullyDone      = stats.stage2_fully_submitted ?? stats.candidates_fully_submitted ?? 0;
	const s2Partial        = stats.stage2_partially_submitted ?? stats.candidates_partially_submitted ?? 0;
	const s2NotStarted     = stats.stage2_not_submitted ?? stats.candidates_not_submitted ?? 0;

	return (
		<Box sx={{ mb: 3 }}>
			<Stack spacing={2.5}>
				{/* â”€â”€ Stage 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
				<Box>
					<SectionHeader
						icon={<StageIcon />}
						stageLabel="Stage 1"
						stageTitle="Screening Level Documents"
						subtitle="All screened registered candidates â€” Resume & Consent Form"
						accentColor="#0891b2"
						totalCandidates={s1Total}
						fullyDone={s1FullyDone}
						partial={s1Partial}
						notStarted={s1NotStarted}
					/>
					<Grid container spacing={2} sx={{ mt: 0.5 }}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<StatCard
								icon={<NonPwDIcon sx={{ color: '#0891b2', fontSize: 18 }} />}
								label="Non-PwD Candidates"
								accentColor="#0891b2"
								candidateCount={s1NonPwdCount}
								docsPerCandidate={2}
								docsToCollect={s1NonPwdToCollect}
								docsCollected={s1NonPwdCollected}
								docsPending={s1NonPwdPending}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<StatCard
								icon={<PwDIcon sx={{ color: '#059669', fontSize: 18 }} />}
								label="PwD Candidates"
								accentColor="#059669"
								candidateCount={s1PwdCount}
								docsPerCandidate={3}
								docsToCollect={s1PwdToCollect}
								docsCollected={s1PwdCollected}
								docsPending={s1PwdPending}
							/>
						</Grid>
					</Grid>
				</Box>

				<Divider sx={{ borderStyle: 'dashed' }} />

				{/* â”€â”€ Stage 2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
				<Box>
					<SectionHeader
						icon={<Stage2Icon />}
						stageLabel="Stage 2"
						stageTitle="Placement Ready â€” Full Documents"
						subtitle="Counseling-selected candidates â€” complete 9 / 10 document set"
						accentColor="#7c3aed"
						totalCandidates={s2Total}
						fullyDone={s2FullyDone}
						partial={s2Partial}
						notStarted={s2NotStarted}
					/>
					<Grid container spacing={2} sx={{ mt: 0.5 }}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<StatCard
								icon={<NonPwDIcon sx={{ color: '#6366f1', fontSize: 18 }} />}
								label="Non-PwD Candidates"
								accentColor="#6366f1"
								candidateCount={s2NonPwdCount}
								docsPerCandidate={9}
								docsToCollect={s2NonPwdToCollect}
								docsCollected={s2NonPwdCollected}
								docsPending={s2NonPwdPending}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<StatCard
								icon={<PwDIcon sx={{ color: '#c026d3', fontSize: 18 }} />}
								label="PwD Candidates"
								accentColor="#c026d3"
								candidateCount={s2PwdCount}
								docsPerCandidate={10}
								docsToCollect={s2PwdToCollect}
								docsCollected={s2PwdCollected}
								docsPending={s2PwdPending}
							/>
						</Grid>
					</Grid>
				</Box>
			</Stack>
		</Box>
	);
};

export default React.memo(DocumentStats);

