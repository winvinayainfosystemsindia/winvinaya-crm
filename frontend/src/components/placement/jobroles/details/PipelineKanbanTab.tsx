import React, { useMemo } from 'react';
import {
	Box,
	Typography,
	Stack,
	Paper,
	Avatar,
	Chip,
	IconButton,
	Tooltip,
	Divider
} from '@mui/material';
import {
	MoreVert as MoreIcon,
	History as HistoryIcon,
	TrendingUp as TrendingUpIcon,
	Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../../../store/hooks';

const KANBAN_COLUMNS = [
	{ id: 'sourced', title: 'Sourced/Applied', stages: ['applied'] },
	{ id: 'shortlisted', title: 'Shortlisted', stages: ['shortlisted'] },
	{ id: 'interviewing', title: 'Interviewing', stages: ['interview_l1', 'interview_l2', 'technical_round', 'hr_round'] },
	{ id: 'offered', title: 'Offered', stages: ['offer_made', 'offer_accepted'] },
	{ id: 'hired', title: 'Hired/Joined', stages: ['joined'] },
	{ id: 'closed', title: 'Dropped/Declined', stages: ['rejected', 'dropped', 'not_joined', 'offer_rejected', 'on_hold'] }
];

const PipelineKanbanTab: React.FC = () => {
	const { matches } = useAppSelector((state) => state.placementMapping);
	const mappedCandidates = useMemo(() => matches.filter(m => m.is_already_mapped), [matches]);

	const getColumnData = (stages: string[]) => {
		return mappedCandidates.filter(c => stages.includes(c.status || 'applied'));
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return '#1d8102';
		if (score >= 40) return '#ff9900';
		return '#d13212';
	};

	return (
		<Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2, minHeight: 'calc(100vh - 300px)', alignItems: 'flex-start' }}>
			{KANBAN_COLUMNS.map((col) => {
				const columnCandidates = getColumnData(col.stages);
				return (
					<Box
						key={col.id}
						sx={{
							minWidth: 280,
							width: 280,
							flexShrink: 0,
							bgcolor: '#f2f3f3',
							borderRadius: '4px',
							display: 'flex',
							flexDirection: 'column',
							maxHeight: '100%'
						}}
					>
						<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid', borderColor: 'divider' }}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#232f3e', textTransform: 'uppercase', fontSize: '0.75rem' }}>
									{col.title}
								</Typography>
								<Chip 
									label={columnCandidates.length} 
									size="small" 
									sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'white' }} 
								/>
							</Stack>
						</Box>

						<Box sx={{ p: 1.5, overflowY: 'auto', flexGrow: 1 }}>
							{columnCandidates.map((candidate) => (
								<Paper
									key={candidate.public_id}
									elevation={0}
									sx={{
										p: 2,
										mb: 1.5,
										borderRadius: '4px',
										border: '1px solid #d5dbdb',
										bgcolor: 'white',
										cursor: 'pointer',
										'&:hover': {
											borderColor: '#ec7211',
											boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
										}
									}}
								>
									<Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
										<Avatar 
											sx={{ 
												width: 32, 
												height: 32, 
												fontSize: '0.875rem', 
												fontWeight: 700,
												bgcolor: getScoreColor(candidate.match_score) 
											}}
										>
											{candidate.name[0]}
										</Avatar>
										<Box sx={{ flexGrow: 1 }}>
											<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e', lineHeight: 1.2 }}>
												{candidate.name}
											</Typography>
											<Typography variant="caption" color="textSecondary">
												Score: {candidate.match_score}%
											</Typography>
										</Box>
										<IconButton size="small" sx={{ mt: -0.5, mr: -0.5 }}>
											<MoreIcon fontSize="small" />
										</IconButton>
									</Stack>

									<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
										{candidate.skills.slice(0, 2).map((skill, i) => (
											<Chip 
												key={i} 
												label={skill} 
												size="small" 
												sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#f3f3f3' }} 
											/>
										))}
									</Stack>

									<Divider sx={{ my: 1.5 }} />

									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Stack direction="row" spacing={1}>
											<Tooltip title="View History">
												<IconButton size="small" sx={{ color: 'primary.main' }}>
													<HistoryIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Tooltip>
											<Tooltip title="Schedule">
												<IconButton size="small">
													<ScheduleIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Tooltip>
										</Stack>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
											<TrendingUpIcon sx={{ fontSize: 14, color: getScoreColor(candidate.match_score) }} />
											<Typography variant="caption" sx={{ fontWeight: 700 }}>
												{candidate.match_score > 70 ? 'High Match' : 'Potentail'}
											</Typography>
										</Box>
									</Stack>
								</Paper>
							))}
							{columnCandidates.length === 0 && (
								<Box sx={{ py: 4, textAlign: 'center', opacity: 0.3 }}>
									<Typography variant="caption" sx={{ fontStyle: 'italic' }}>Empty</Typography>
								</Box>
							)}
						</Box>
					</Box>
				);
			})}
		</Box>
	);
};

export default PipelineKanbanTab;
