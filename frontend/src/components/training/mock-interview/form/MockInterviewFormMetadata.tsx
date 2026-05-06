import React, { memo } from 'react';
import {
	Stack,
	Box,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	TextField,
	Paper,
	Tooltip,
	Slider,
	useTheme,
	alpha
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { type MockInterviewCreate } from '../../../../models/MockInterview';

interface MockInterviewFormMetadataProps {
	formData: Partial<MockInterviewCreate>;
	errors: Record<string, string>;
	viewMode: boolean;
	isEdit: boolean;
	allocations: any[];
	onChange: (field: keyof MockInterviewCreate, value: any) => void;
}

const MockInterviewFormMetadata: React.FC<MockInterviewFormMetadataProps> = memo(({
	formData,
	errors,
	viewMode,
	isEdit,
	allocations,
	onChange
}) => {
	const theme = useTheme();
	const isAbsent = formData.status === 'absent';
	const scoreColor = isAbsent ? theme.palette.text.disabled : theme.palette.primary.main;

	return (
		<Stack spacing={4}>
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
					Evaluation Metadata
				</Typography>
				<Stack spacing={2.5} sx={{ mt: 3 }}>
					<FormControl fullWidth error={!!errors.candidate_id} size="small">
						<InputLabel shrink sx={{ fontWeight: 600 }}>Target Candidate</InputLabel>
						<Select
							value={formData.candidate_id || ''}
							onChange={(e) => onChange('candidate_id', e.target.value)}
							label="Target Candidate"
							disabled={viewMode || isEdit}
							displayEmpty
							sx={{ 
								bgcolor: 'background.paper',
								borderRadius: 2
							}}
						>
							<MenuItem value="" disabled>Select candidate...</MenuItem>
							{allocations.map((a) => (
								<MenuItem key={a.candidate_id} value={a.candidate_id}>
									{a.candidate?.name}
								</MenuItem>
							))}
						</Select>
						{errors.candidate_id && <FormHelperText>{errors.candidate_id}</FormHelperText>}
					</FormControl>

					<TextField
						label="Evaluation Conducted By"
						value={formData.interviewer_name || ''}
						onChange={(e) => onChange('interviewer_name', e.target.value)}
						fullWidth
						size="small"
						disabled={viewMode}
						error={!!errors.interviewer_name}
						helperText={errors.interviewer_name}
						InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
						sx={{ 
							bgcolor: 'background.paper',
							'& .MuiOutlinedInput-root': { borderRadius: 2 }
						}}
					/>

					<TextField
						label="Interview Timestamp"
						type="datetime-local"
						value={formData.interview_date || ''}
						onChange={(e) => onChange('interview_date', e.target.value)}
						fullWidth
						size="small"
						disabled={viewMode}
						error={!!errors.interview_date}
						helperText={errors.interview_date}
						InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
						sx={{ 
							bgcolor: 'background.paper',
							'& .MuiOutlinedInput-root': { borderRadius: 2 }
						}}
					/>

					<TextField
						select
						label="Outcome Status"
						value={formData.status || 'pending'}
						onChange={(e) => onChange('status', e.target.value)}
						fullWidth
						size="small"
						disabled={viewMode}
						InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
						sx={{ 
							bgcolor: 'background.paper',
							'& .MuiOutlinedInput-root': { borderRadius: 2 }
						}}
					>
						<MenuItem value="pending">Pending Review</MenuItem>
						<MenuItem value="cleared">Cleared / Recommended</MenuItem>
						<MenuItem value="re-test">Require Re-assessment</MenuItem>
						<MenuItem value="rejected">Not Recommended</MenuItem>
						<MenuItem value="absent">Absent / Not Attended</MenuItem>
					</TextField>
				</Stack>
			</Box>

			<Paper 
				elevation={0}
				sx={{ 
					p: 3, 
					borderRadius: 3, 
					bgcolor: alpha(scoreColor, 0.04), 
					border: '1px solid',
					borderColor: alpha(scoreColor, 0.12)
				}}
			>
				<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
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
							mt: 2,
							width: '90%',
							color: scoreColor,
							'& .MuiSlider-thumb': {
								width: 24,
								height: 24,
								backgroundColor: '#fff',
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
					<Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: 1 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.6 }}>ENTRY</Typography>
						<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.6 }}>EXPERT</Typography>
					</Stack>
				</Box>
			</Paper>
		</Stack>
	);
});

MockInterviewFormMetadata.displayName = 'MockInterviewFormMetadata';

export default MockInterviewFormMetadata;
