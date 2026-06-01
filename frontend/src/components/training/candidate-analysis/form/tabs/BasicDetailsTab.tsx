import React, { memo } from 'react';
import {
	Stack,
	Box,
	Typography,
	TextField,
	Grid,
	MenuItem,
	Paper,
	Divider
} from '@mui/material';
import {
	Person as PersonIcon,
	History as HistoryIcon,
	Update as UpdateIcon
} from '@mui/icons-material';
import useDateTime from '../../../../../hooks/useDateTime';

interface BasicDetailsTabProps {
	candidateId: number | '';
	setCandidateId: (val: number | '') => void;
	analystName: string;
	analysisDate: string;
	candidates: Array<{ id: number; name: string }>;
	viewMode: boolean;
	isEdit: boolean;
	other?: any;
}

const BasicDetailsTab: React.FC<BasicDetailsTabProps> = memo(({
	candidateId,
	setCandidateId,
	analystName,
	analysisDate,
	candidates,
	viewMode,
	isEdit,
	other
}) => {
	const { formatDateTime } = useDateTime();

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: 1.5,
			bgcolor: '#fcfcfc',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' }
		}
	};

	return (
		<Stack spacing={4} sx={{ maxWidth: 800, mx: 'auto' }}>
			{/* Audit Panel for Collaborative Changes */}
			{other && (other.created_by || other.modified_by) && (
				<Paper
					variant="outlined"
					sx={{
						p: 2.5,
						borderRadius: 2,
						bgcolor: 'rgba(0, 77, 230, 0.03)',
						borderColor: 'rgba(0, 77, 230, 0.15)',
						borderWidth: 1,
						borderStyle: 'solid'
					}}
				>
					<Stack spacing={2}>
						<Stack direction="row" alignItems="center" spacing={1.5}>
							<HistoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
								SWOT Collaborative Log
							</Typography>
						</Stack>

						<Divider sx={{ borderColor: 'rgba(0, 77, 230, 0.1)' }} />

						<Grid container spacing={3}>
							{/* Created Section */}
							{other.created_by && (
								<Grid size={{ xs: 12, sm: 6 }}>
									<Stack direction="row" spacing={1.5} alignItems="flex-start">
										<Box sx={{ display: 'flex', mt: 0.25 }}>
											<PersonIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
										</Box>
										<Box>
											<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
												Original Evaluator
											</Typography>
											<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.25 }}>
												{other.created_by}
											</Typography>
											{other.created_at && (
												<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
													{formatDateTime(other.created_at)}
												</Typography>
											)}
										</Box>
									</Stack>
								</Grid>
							)}

							{/* Modified Section */}
							{other.modified_by && (
								<Grid size={{ xs: 12, sm: 6 }}>
									<Stack direction="row" spacing={1.5} alignItems="flex-start">
										<Box sx={{ display: 'flex', mt: 0.25 }}>
											<UpdateIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
										</Box>
										<Box>
											<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
												Last Updated By
											</Typography>
											<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.25 }}>
												{other.modified_by}
											</Typography>
											{other.modified_at && (
												<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
													{formatDateTime(other.modified_at)}
												</Typography>
											)}
										</Box>
									</Stack>
								</Grid>
							)}
						</Grid>
					</Stack>
				</Paper>
			)}

			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
					Evaluation Metadata
				</Typography>
				<Grid container spacing={3}>
					{/* Candidate Name Select */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Candidate Name *
						</Typography>
						<TextField
							select
							fullWidth
							size="small"
							required
							disabled={viewMode || isEdit}
							value={candidateId}
							onChange={(e) => setCandidateId(Number(e.target.value))}
							sx={inputSx}
						>
							{candidates.map(c => (
								<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
							))}
						</TextField>
					</Grid>

					{/* Analyst Name */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Evaluator / Analyst *
						</Typography>
						<TextField
							fullWidth
							size="small"
							required
							disabled={true}
							value={analystName}
							sx={inputSx}
						/>
					</Grid>

					{/* Evaluation Date */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Evaluation Date *
						</Typography>
						<TextField
							type="date"
							fullWidth
							size="small"
							required
							disabled={true}
							value={analysisDate}
							sx={inputSx}
						/>
					</Grid>
				</Grid>
			</Box>
		</Stack>
	);
});

BasicDetailsTab.displayName = 'BasicDetailsTab';

export default BasicDetailsTab;
