import React, { memo } from 'react';
import {
	Box,
	Typography,
	TextField,
	Stack,
	Paper,
	Tooltip,
	Slider,
	alpha,
	useTheme
} from '@mui/material';
import { 
	CommentBankOutlined as FeedbackIcon,
	HelpOutline as HelpIcon
} from '@mui/icons-material';
import { type MockInterviewCreate } from '../../../../../models/MockInterview';

interface FinalRemarksTabProps {
	formData: Partial<MockInterviewCreate>;
	viewMode: boolean;
	onChange: (field: keyof MockInterviewCreate, value: any) => void;
}

const FinalRemarksTab: React.FC<FinalRemarksTabProps> = memo(({
	formData,
	viewMode,
	onChange
}) => {
	const theme = useTheme();
	const isAbsent = formData.status === 'absent';
	const scoreColor = isAbsent ? theme.palette.text.disabled : theme.palette.primary.main;

	return (
		<Box sx={{ maxWidth: 800, mx: 'auto' }}>
			<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
				<Box 
					sx={{ 
						p: 1.25, 
						bgcolor: alpha(theme.palette.info.main, 0.08), 
						borderRadius: 2, 
						display: 'flex',
						color: 'info.main'
					}}
				>
					<FeedbackIcon />
				</Box>
				<Box>
					<Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
						Final Remarks & Recommendations
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
						Provide a comprehensive summary of the candidate's performance and future outlook.
					</Typography>
				</Box>
			</Stack>

			<Stack spacing={4}>
				<Paper 
					elevation={0}
					sx={{ 
						p: 4, 
						borderRadius: 3, 
						bgcolor: alpha(scoreColor, 0.04), 
						border: '1px solid',
						borderColor: alpha(scoreColor, 0.12)
					}}
				>
					<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
						<Typography variant="caption" sx={{ fontWeight: 800, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							{isAbsent ? 'No Score (Absent)' : 'Overall Proficiency Score'}
						</Typography>
						<Tooltip title={isAbsent ? 'Candidate was absent, no proficiency score recorded' : 'Aggregated proficiency score across all assessed areas'}>
							<HelpIcon sx={{ fontSize: 16, color: scoreColor, opacity: 0.6 }} />
						</Tooltip>
					</Stack>
					<Box sx={{ textAlign: 'center' }}>
						<Typography variant="h2" sx={{ fontWeight: 900, color: scoreColor, letterSpacing: '-0.02em' }}>
							{isAbsent ? '--' : formData.overall_rating}
							{!isAbsent && <Typography component="span" variant="h5" color="text.secondary" sx={{ ml: 1, fontWeight: 700, opacity: 0.5 }}>/ 10</Typography>}
						</Typography>
						<Slider
							value={isAbsent ? 0 : (formData.overall_rating || 0)}
							min={0}
							max={10}
							step={0.5}
							onChange={(_, v) => onChange('overall_rating', v)}
							disabled={viewMode || isAbsent}
							sx={{
								mt: 3,
								width: '80%',
								color: scoreColor,
								'& .MuiSlider-thumb': {
									width: 24,
									height: 24,
									backgroundColor: theme.palette.background.paper,
									border: '2px solid currentColor',
									'&:hover, &.Mui-focusVisible': {
										boxShadow: `0px 0px 0px 8px ${alpha(scoreColor, 0.16)}`,
									},
									'&.Mui-active': {
										boxShadow: `0px 0px 0px 14px ${alpha(scoreColor, 0.16)}`,
									},
								},
								'& .MuiSlider-rail': {
									opacity: 0.32,
								},
							}}
						/>
						<Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: '10%' }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.6 }}>ENTRY</Typography>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.6 }}>EXPERT</Typography>
						</Stack>
					</Box>
				</Paper>

				<Box 
					sx={{ 
						p: 4, 
						borderRadius: 3, 
						bgcolor: alpha(theme.palette.info.main, 0.02),
						border: '1px solid',
						borderColor: alpha(theme.palette.info.main, 0.1)
					}}
				>
					<Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'info.main', fontSize: '0.75rem' }}>
						Summative Remarks
					</Typography>
					<TextField
						multiline
						rows={10}
						placeholder="Provide detailed observations on the candidate's performance, strengths, areas for improvement, and specific recommendations for further training or placement..."
						value={formData.feedback || ''}
						onChange={(e) => onChange('feedback', e.target.value)}
						fullWidth
						disabled={viewMode}
						sx={{ 
							bgcolor: 'background.paper',
							'& .MuiOutlinedInput-root': {
								borderRadius: 2,
								fontSize: '0.95rem',
								lineHeight: 1.6
							}
						}}
					/>
				</Box>
			</Stack>
		</Box>
	);
});

FinalRemarksTab.displayName = 'FinalRemarksTab';

export default FinalRemarksTab;
