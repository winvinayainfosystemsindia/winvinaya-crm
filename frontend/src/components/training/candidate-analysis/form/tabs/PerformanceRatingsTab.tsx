import React, { memo } from 'react';
import {
	Stack,
	Box,
	Typography,
	Grid,
	Paper,
	TextField,
	MenuItem
} from '@mui/material';
import Remarks from '../../../../common/Remarks';

interface PerformanceRatingsTabProps {
	remarks: string;
	setRemarks: (val: string) => void;
	recommendation: string;
	setRecommendation: (val: string) => void;
	status: string;
	setStatus: (val: string) => void;
	viewMode: boolean;
	analystName: string;
}

const PerformanceRatingsTab: React.FC<PerformanceRatingsTabProps> = memo(({
	remarks,
	setRemarks,
	status,
	setStatus,
	viewMode,
	analystName
}) => {
	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: 1.5,
			bgcolor: '#fcfcfc',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' }
		}
	};

	return (
		<Stack spacing={4} sx={{ maxWidth: 850, mx: 'auto', p: 1 }}>
			{/* Evaluation Remarks Timeline Section */}
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
					Overall Evaluation Remarks
				</Typography>
				<Paper elevation={0} variant="outlined" sx={{ p: 4, bgcolor: '#fcfcfc', borderRadius: 2.5 }}>
					<Remarks
						placeholder="Provide overall summary comments, candidate suitability, and general observations..."
						value={remarks}
						onChange={setRemarks}
						disabled={viewMode}
						analystName={analystName}
					/>
				</Paper>
			</Box>

			{/* Final Recommendation and Status cards */}
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
					Analysis Status
				</Typography>
				<Paper elevation={0} variant="outlined" sx={{ p: 4, bgcolor: '#fcfcfc', borderRadius: 2 }}>
					<Grid container spacing={3}>
						{/* Status Select */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
								Analysis Status *
							</Typography>
							<TextField
								select
								fullWidth
								size="small"
								required
								disabled={viewMode}
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								sx={inputSx}
							>
								<MenuItem value="in-progress">In Progress</MenuItem>
								<MenuItem value="completed">Completed</MenuItem>
							</TextField>
						</Grid>
					</Grid>
				</Paper>
			</Box>
		</Stack>
	);
});

PerformanceRatingsTab.displayName = 'PerformanceRatingsTab';

export default memo(PerformanceRatingsTab);
