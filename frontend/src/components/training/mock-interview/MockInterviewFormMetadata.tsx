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
	Slider
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { type MockInterviewCreate } from '../../../models/MockInterview';

interface MockInterviewFormMetadataProps {
	formData: Partial<MockInterviewCreate>;
	errors: Record<string, string>;
	viewMode: boolean;
	isEdit: boolean;
	allocations: any[];
	onChange: (field: keyof MockInterviewCreate, value: any) => void;
	PRIMARY_BLUE: string;
}

const MockInterviewFormMetadata: React.FC<MockInterviewFormMetadataProps> = memo(({
	formData,
	errors,
	viewMode,
	isEdit,
	allocations,
	onChange,
	PRIMARY_BLUE
}) => {
	return (
		<Stack spacing={4}>
			<Box>
				<Typography variant="overline" sx={{ fontWeight: 700, color: '#545b64', letterSpacing: 1.2 }}>
					Metadata
				</Typography>
				<Stack spacing={3} sx={{ mt: 2 }}>
					<FormControl fullWidth error={!!errors.candidate_id} size="small">
						<InputLabel shrink>Target Candidate</InputLabel>
						<Select
							value={formData.candidate_id || ''}
							onChange={(e) => onChange('candidate_id', e.target.value)}
							label="Target Candidate"
							disabled={viewMode || isEdit}
							displayEmpty
							sx={{ bgcolor: 'white' }}
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
						InputLabelProps={{ shrink: true }}
						sx={{ bgcolor: 'white' }}
					/>

					<TextField
						label="Assessment Timestamp"
						type="datetime-local"
						value={formData.interview_date || ''}
						onChange={(e) => onChange('interview_date', e.target.value)}
						fullWidth
						size="small"
						disabled={viewMode}
						error={!!errors.interview_date}
						helperText={errors.interview_date}
						InputLabelProps={{ shrink: true }}
						sx={{ bgcolor: 'white' }}
					/>

					<TextField
						select
						label="Outcome Status"
						value={formData.status || 'pending'}
						onChange={(e) => onChange('status', e.target.value)}
						fullWidth
						size="small"
						disabled={viewMode}
						InputLabelProps={{ shrink: true }}
						sx={{ bgcolor: 'white' }}
					>
						<MenuItem value="pending">Pending Review</MenuItem>
						<MenuItem value="cleared">Cleared / Recommended</MenuItem>
						<MenuItem value="re-test">Require Re-assessment</MenuItem>
						<MenuItem value="rejected">Not Recommended</MenuItem>
					</TextField>
				</Stack>
			</Box>

			<Paper variant="outlined" sx={{ p: 3, borderRadius: '4px', bgcolor: '#f1faff', border: '1px solid #d1e9ff' }}>
				<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
					<Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY_BLUE }}>
						OVERALL SCORE
					</Typography>
					<Tooltip title="Aggregated proficiency score across all assessed areas">
						<HelpIcon sx={{ fontSize: 16, color: PRIMARY_BLUE, opacity: 0.7 }} />
					</Tooltip>
				</Stack>
				<Box sx={{ textAlign: 'center' }}>
					<Typography variant="h2" sx={{ fontWeight: 800, color: PRIMARY_BLUE }}>
						{formData.overall_rating}
						<Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>/ 10</Typography>
					</Typography>
					<Slider
						value={formData.overall_rating || 0}
						min={0}
						max={10}
						step={0.5}
						onChange={(_, v) => onChange('overall_rating', v)}
						disabled={viewMode}
						sx={{
							mt: 2,
							width: '90%',
							color: PRIMARY_BLUE,
							'& .MuiSlider-thumb': {
								'&:hover, &.Mui-focusVisible': {
									boxShadow: `0px 0px 0px 8px rgba(0, 126, 185, 0.16)`,
								},
							}
						}}
					/>
					<Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: 1 }}>
						<Typography variant="caption" color="text.secondary">Entry</Typography>
						<Typography variant="caption" color="text.secondary">Expert</Typography>
					</Stack>
				</Box>
			</Paper>
		</Stack>
	);
});

MockInterviewFormMetadata.displayName = 'MockInterviewFormMetadata';

export default MockInterviewFormMetadata;
