import { useNavigate } from 'react-router-dom';
import {
	TableRow,
	TableCell,
	Stack,
	Avatar,
	Box,
	Typography,
	Tooltip,
	Chip,
	Button
} from '@mui/material';
import { type CandidateMatchResult } from '../../../../../services/placementMappingService';

interface Props {
	candidate: CandidateMatchResult;
	widths: {
		candidate: string;
		score: string;
		disability: string;
		qualification: string;
		skills: string;
		actions: string;
	};
	onMap: (candidate: CandidateMatchResult) => void;
}

const CandidateMatchTableRow = ({ candidate, widths, onMap }: Props) => {
	const navigate = useNavigate();

	const getScoreColor = (score: number) => {
		if (score >= 80) return '#1d8102'; // AWS Success Green
		if (score >= 40) return '#ff9900'; // AWS Warning Orange
		return '#d13212'; // AWS Error Red
	};

	const toTitleCase = (str: string) => {
		if (!str) return '';
		return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
	};

	return (
		<TableRow
			sx={{
				height: '64px', // Slightly taller for better vertical rhythm
				transition: 'background-color 0.2s',
				'&:nth-of-type(even)': { bgcolor: '#f9f9f9' },
				'&:hover': {
					bgcolor: '#f5f8fa',
					'& .name-text': { color: 'primary.main' }
				},
				'& .MuiTableCell-root': { borderBottom: '1px solid #f0f0f0' }
			}}
		>
			<TableCell sx={{ py: 1.5, width: widths.candidate }}>
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar
						sx={{
							bgcolor: 'primary.main',
							color: 'white',
							width: 32,
							height: 32,
							fontSize: '0.85rem',
							fontWeight: 700,
							boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
						}}
					>
						{candidate.name[0]}
					</Avatar>
					<Box sx={{ overflow: 'hidden' }}>
						<Typography
							className="name-text"
							variant="body2"
							sx={{
								fontWeight: 600,
								cursor: 'pointer',
								transition: 'color 0.2s',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis'
							}}
							onClick={() => navigate(`/candidates/${candidate.public_id}`)}
						>
							{toTitleCase(candidate.name)}
						</Typography>
					</Box>
				</Stack>
			</TableCell>
			<TableCell sx={{ width: widths.score }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getScoreColor(candidate.match_score) }} />
					<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
						{candidate.match_score}%
					</Typography>
				</Box>
			</TableCell>
			<TableCell sx={{ width: widths.disability }}>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', fontWeight: 500 }}>
					{candidate.disability}
				</Typography>
			</TableCell>
			<TableCell sx={{ width: widths.qualification }}>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
					{candidate.qualification}
				</Typography>
			</TableCell>
			<TableCell sx={{ width: widths.skills }}>
				<Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
					{candidate.skills.slice(0, 2).map((skill: string, i: number) => (
						<Chip
							key={i}
							label={skill}
							size="small"
							variant="outlined"
							sx={{
								height: 20,
								fontSize: '0.65rem',
								fontWeight: 600,
								borderColor: 'divider',
								color: 'text.secondary',
								bgcolor: 'white'
							}}
						/>
					))}
					{candidate.skills.length > 2 && (
						<Tooltip title={candidate.skills.slice(2).join(', ')}>
							<Chip
								label={`+${candidate.skills.length - 2}`}
								size="small"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'action.hover' }}
							/>
						</Tooltip>
					)}
				</Stack>
			</TableCell>
			<TableCell align="right" sx={{ width: widths.actions }}>
				{!candidate.is_already_mapped ? (
					<Button
						variant="outlined"
						size="small"
						onClick={() => onMap(candidate)}
						sx={{
							textTransform: 'none',
							fontWeight: 600,
							borderColor: 'divider',
							color: 'text.primary',
							px: 2,
							'&:hover': {
								bgcolor: 'primary.main',
								color: 'white',
								borderColor: 'primary.main'
							}
						}}
					>
						Map
					</Button>
				) : (
					<Chip
						label="Already Mapped"
						size="small"
						sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'success.light', color: 'success.contrastText' }}
					/>
				)}
			</TableCell>
		</TableRow>
	);
};

export default CandidateMatchTableRow;
