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

						{/* Collapsible/Scrollable Edit Timeline Diff Logs */}
						{other.change_log && other.change_log.length > 0 && (
							<>
								<Divider sx={{ borderColor: 'rgba(0, 77, 230, 0.1)', my: 1.5 }} />
								<Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
										<HistoryIcon sx={{ fontSize: 18 }} /> Detailed Change History ({other.change_log.length})
									</Typography>
									<Stack spacing={2} sx={{ maxHeight: 220, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2 } }}>
										{other.change_log.map((log: any, idx: number) => (
											<Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 1.5 }}>
												<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
													<Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
														Modified by {log.modified_by}
													</Typography>
													<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
														{formatDateTime(log.modified_at)}
													</Typography>
												</Stack>
												<Stack spacing={1}>
													{log.changes.map((c: any, cIdx: number) => (
														<Box key={cIdx} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.75rem', gap: 1 }}>
															<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', bgcolor: '#f1f5f9', px: 1, py: 0.25, borderRadius: 1 }}>
																{c.field}
															</Typography>
															{c.from && (
																<Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.05)', px: 0.75, py: 0.25, borderRadius: 0.5 }}>
																	{c.from}
																</Typography>
															)}
															<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
																&rarr;
															</Typography>
															<Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', bgcolor: 'rgba(34, 197, 94, 0.05)', px: 0.75, py: 0.25, borderRadius: 0.5 }}>
																{c.to}
															</Typography>
														</Box>
													))}
												</Stack>
											</Paper>
										))}
									</Stack>
								</Box>
							</>
						)}
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
