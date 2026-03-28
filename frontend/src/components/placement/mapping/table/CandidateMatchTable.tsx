import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Stack,
	Avatar,
	Box,
	Typography,
	Tooltip,
	LinearProgress,
	Chip,
	Button
} from '@mui/material';
import {
	CheckCircle as CheckCircleIcon,
	Warning as WarningIcon,
	Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { type CandidateMatchResult } from '../../../../services/placementMappingService';

interface Props {
	candidates: CandidateMatchResult[];
	onMapClick: (candidate: CandidateMatchResult) => void;
	emptyMsg: string;
}

const CandidateMatchTable = ({ candidates, onMapClick, emptyMsg }: Props) => {
	const navigate = useNavigate();

	const getScoreColor = (score: number) => {
		if (score >= 70) return 'success.main';
		if (score >= 40) return '#ff9900'; // Amber
		return 'error.main';
	};

	return (
		<TableContainer>
			<Table sx={{ minWidth: 650 }} size="medium" stickyHeader>
				<TableHead>
					<TableRow>
						<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5, borderBottom: (t) => `2px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>Candidate</TableCell>
						<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5, borderBottom: (t) => `2px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>Match Score</TableCell>
						<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5, borderBottom: (t) => `2px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>Disability</TableCell>
						<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5, borderBottom: (t) => `2px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>Qualification</TableCell>
						<TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5, borderBottom: (t) => `2px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>Relevant Skills</TableCell>
						<TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5, borderBottom: (t) => `2px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{candidates.map((candidate: CandidateMatchResult) => (
						<TableRow
							key={candidate.public_id}
							sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'background-color 0.1s', borderBottom: (t) => `1px solid ${t.palette.divider}` }}
						>
							<TableCell sx={{ py: 2 }}>
								<Stack direction="row" spacing={2} alignItems="center">
									<Avatar sx={{ bgcolor: 'background.default', color: 'text.secondary', width: 36, height: 36, fontSize: '0.875rem', fontWeight: 700 }}>
										{candidate.name[0]}
									</Avatar>
									<Box>
										<Typography
											variant="body2"
											sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
											onClick={() => navigate(`/candidates/${candidate.public_id}`)}
										>
											{candidate.name}
										</Typography>
										{candidate.other_mappings_count > 0 && (
											<Tooltip title={`Current Utilization: ${candidate.other_mappings.join(', ')}`}>
												<Box sx={{ display: 'inline-flex', alignItems: 'center', mt: 0.5, bgcolor: '#fff4e5', px: 1, py: 0.2, borderRadius: '4px', border: '1px solid #ffb74d' }}>
													<WarningIcon sx={{ fontSize: 12, color: '#ff9900', mr: 0.5 }} />
													<Typography variant="caption" sx={{ color: '#663c00', fontSize: '0.65rem', fontWeight: 700 }}>
														{candidate.other_mappings_count} External Project(s)
													</Typography>
												</Box>
											</Tooltip>
										)}
									</Box>
								</Stack>
							</TableCell>
							<TableCell>
								<Box sx={{ width: '100%', maxWidth: 100 }}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Typography variant="body2" sx={{ fontWeight: 700, color: getScoreColor(candidate.match_score), minWidth: 35 }}>
											{candidate.match_score}%
										</Typography>
										<Box sx={{ flexGrow: 1 }}>
											<LinearProgress
												variant="determinate"
												value={candidate.match_score}
												sx={{
													height: 6,
													borderRadius: 3,
													bgcolor: 'background.default',
													'& .MuiLinearProgress-bar': { bgcolor: getScoreColor(candidate.match_score), borderRadius: 3 }
												}}
											/>
										</Box>
									</Stack>
								</Box>
							</TableCell>
							<TableCell>
								<Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>{candidate.disability || 'N/A'}</Typography>
							</TableCell>
							<TableCell>
								<Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>{candidate.qualification || 'N/A'}</Typography>
							</TableCell>
							<TableCell>
								<Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
									{candidate.skills.slice(0, 3).map((skill: string, i: number) => (
										<Chip
											key={i}
											label={skill}
											size="small"
											sx={{
												height: 22,
												fontSize: '0.7rem',
												borderRadius: '4px',
												bgcolor: 'background.default',
												border: (t) => `1px solid ${t.palette.divider}`,
												color: 'text.secondary',
												fontWeight: 500
											}}
										/>
									))}
									{candidate.skills.length > 3 && (
										<Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, ml: 0.5 }}>
											+{candidate.skills.length - 3} more
										</Typography>
									)}
								</Stack>
							</TableCell>
							<TableCell align="right">
								{!candidate.is_already_mapped ? (
									<Button
										variant="outlined"
										size="small"
										onClick={() => onMapClick(candidate)}
										sx={{
											textTransform: 'none',
											fontWeight: 700,
											fontSize: '0.75rem',
											borderColor: 'text.secondary',
											color: 'text.secondary',
											'&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' },
											px: 2
										}}
									>
										Map Candidate
									</Button>
								) : (
									<Chip
										label="Currently Mapped"
										size="small"
										icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
										sx={{ fontWeight: 700, height: 26, bgcolor: '#ebf5e9', color: 'success.main', border: '1px solid #c8e6c9' }}
									/>
								)}
							</TableCell>
						</TableRow>
					))}
					{candidates.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} align="center" sx={{ py: 12 }}>
								<InfoIcon sx={{ color: 'divider', fontSize: 48, mb: 1.5 }} />
								<Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>{emptyMsg}</Typography>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default CandidateMatchTable;
