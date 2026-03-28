import { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Stack,
	Typography,
	Box,
	TextField,
	Button,
	CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Warning as WarningIcon } from '@mui/icons-material';
import { type CandidateMatchResult } from '../../../../services/placementMappingService';
import { type JobRole } from '../../../../models/jobRole';

interface Props {
	open: boolean;
	candidate: CandidateMatchResult | null;
	jobRole: JobRole | null;
	submitting: boolean;
	onClose: () => void;
	onConfirm: (notes: string) => void;
}

const ConfirmationMappingDialog = ({
	open,
	candidate,
	jobRole,
	submitting,
	onClose,
	onConfirm
}: Props) => {
	const [notes, setNotes] = useState('');

	const getScoreColor = (score: number) => {
		if (score >= 70) return 'success.main';
		if (score >= 40) return '#ff9900'; // Amber (stable AWS color)
		return 'error.main';
	};

	const handleConfirm = () => {
		onConfirm(notes);
		setNotes('');
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{ sx: { borderRadius: '2px' } }}
		>
			<DialogTitle sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem', py: 2.5, px: 3, bgcolor: 'background.paper', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
				Confirm Resource Mapping
			</DialogTitle>
			<DialogContent sx={{ p: 3 }}>
				{candidate && (
					<Stack spacing={3.5}>
						<Typography variant="body2" color="textSecondary">
							Confirm the assignment of the candidate below to target job role. This will formalize the mapping in the recruitment pipeline.
						</Typography>

						<Grid container spacing={4}>
							<Grid size={{ xs: 6 }}>
								<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Candidate Name</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>{candidate.name}</Typography>
							</Grid>
							<Grid size={{ xs: 6 }}>
								<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Affinity Score</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700, color: getScoreColor(candidate.match_score), mt: 0.5 }}>{candidate.match_score}%</Typography>
							</Grid>
						</Grid>

						<Box>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}>Target Resource Context</Typography>
							<Box sx={{ p: 2, bgcolor: 'background.default', borderLeft: (t) => `5px solid ${t.palette.primary.main}`, borderRadius: '2px' }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>{jobRole?.title}</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary' }}>{jobRole?.company?.name} — {jobRole?.location?.cities?.join(', ') || 'Manual Location'}</Typography>
							</Box>
						</Box>

						{candidate.other_mappings_count > 0 && (
							<Box sx={{ p: 2, bgcolor: '#fff4e5', border: '1px solid #ffb74d', borderRadius: '4px' }}>
								<Stack direction="row" spacing={2} alignItems="flex-start">
									<WarningIcon sx={{ color: '#ff9900', fontSize: 24 }} />
									<Box>
										<Typography variant="subtitle2" sx={{ color: '#663c00', fontWeight: 800 }}>Utilization Conflict Alert</Typography>
										<Typography variant="body2" sx={{ color: '#663c00', fontSize: '0.8rem', mt: 0.5 }}>
											This candidate is currently mapped to {candidate.other_mappings_count} other role(s): <strong>{candidate.other_mappings.join(', ')}</strong>. Mapping to another role may impact availability.
										</Typography>
									</Box>
								</Stack>
							</Box>
						)}

						<TextField
							fullWidth
							multiline
							rows={4}
							label="Assignment Notes / Justification"
							placeholder="Enter any additional context or mapping justification..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							sx={{ mt: 1 }}
							InputLabelProps={{ shrink: true }}
							InputProps={{ sx: { borderRadius: '2px' } }}
						/>
					</Stack>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 3, bgcolor: 'background.paper', borderTop: (t) => `1px solid ${t.palette.divider}` }}>
				<Button onClick={onClose} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 700, fontSize: '0.875rem', px: 3 }}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleConfirm}
					disabled={submitting}
					sx={{
						bgcolor: 'primary.main',
						'&:hover': { bgcolor: 'primary.dark' },
						textTransform: 'none',
						fontWeight: 700,
						boxShadow: 'none',
						px: 4,
						borderRadius: '2px'
					}}
				>
					{submitting ? <CircularProgress size={20} color="inherit" /> : 'Confirm Assignment'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationMappingDialog;
