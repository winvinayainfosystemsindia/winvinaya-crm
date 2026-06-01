import React, { memo } from 'react';
import {
	Stack,
	Box,
	Typography,
	Grid,
	Paper,
	Rating,
	Divider,
	Chip,
	TextField,
	MenuItem
} from '@mui/material';
import Remarks from '../../../../common/Remarks';

interface PerformanceRatingsTabProps {
	strengthsRating: number;
	setStrengthsRating: (val: number) => void;
	weaknessesRating: number;
	setWeaknessesRating: (val: number) => void;
	opportunitiesRating: number;
	setOpportunitiesRating: (val: number) => void;
	threatsRating: number;
	setThreatsRating: (val: number) => void;
	remarks: string;
	setRemarks: (val: string) => void;
	overallRating: number;
	recommendation: string;
	setRecommendation: (val: string) => void;
	status: string;
	setStatus: (val: string) => void;
	viewMode: boolean;
	analystName: string;
}

const PerformanceRatingsTab: React.FC<PerformanceRatingsTabProps> = memo(({
	strengthsRating,
	setStrengthsRating,
	weaknessesRating,
	setWeaknessesRating,
	opportunitiesRating,
	setOpportunitiesRating,
	threatsRating,
	setThreatsRating,
	remarks,
	setRemarks,
	overallRating,
	recommendation,
	setRecommendation,
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
			{/* SWOT 4 ratings card */}
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
					SWOT Ratings Assessment
				</Typography>
				<Paper elevation={0} variant="outlined" sx={{ p: 4, bgcolor: '#fcfcfc', borderRadius: 2 }}>
					<Grid container spacing={3.5}>
						{/* Strengths Score */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Box sx={{ 
								textAlign: 'center', 
								p: 3, 
								border: '1px solid #f1f5f9', 
								borderRadius: 3, 
								bgcolor: '#ffffff',
								boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
							}}>
								<Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, color: 'success.main' }}>
									Strengths Score (S)
								</Typography>
								<Rating
									max={10}
									value={strengthsRating}
									onChange={(_, v) => !viewMode && setStrengthsRating(v || 0)}
									disabled={viewMode}
									size="medium"
									sx={{ color: 'success.main' }}
								/>
								<Typography variant="h6" fontWeight={800} color="success.main" sx={{ mt: 1 }}>
									{strengthsRating} / 10
								</Typography>
							</Box>
						</Grid>

						{/* Weaknesses Score */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Box sx={{ 
								textAlign: 'center', 
								p: 3, 
								border: '1px solid #f1f5f9', 
								borderRadius: 3, 
								bgcolor: '#ffffff',
								boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
							}}>
								<Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, color: 'error.main' }}>
									Weaknesses Score (W)
								</Typography>
								<Rating
									max={10}
									value={weaknessesRating}
									onChange={(_, v) => !viewMode && setWeaknessesRating(v || 0)}
									disabled={viewMode}
									size="medium"
									sx={{ color: 'error.main' }}
								/>
								<Typography variant="h6" fontWeight={800} color="error.main" sx={{ mt: 1 }}>
									{weaknessesRating} / 10
								</Typography>
							</Box>
						</Grid>

						{/* Opportunities Score */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Box sx={{ 
								textAlign: 'center', 
								p: 3, 
								border: '1px solid #f1f5f9', 
								borderRadius: 3, 
								bgcolor: '#ffffff',
								boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
							}}>
								<Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, color: 'info.main' }}>
									Opportunities Score (O)
								</Typography>
								<Rating
									max={10}
									value={opportunitiesRating}
									onChange={(_, v) => !viewMode && setOpportunitiesRating(v || 0)}
									disabled={viewMode}
									size="medium"
									sx={{ color: 'info.main' }}
								/>
								<Typography variant="h6" fontWeight={800} color="info.main" sx={{ mt: 1 }}>
									{opportunitiesRating} / 10
								</Typography>
							</Box>
						</Grid>

						{/* Threats Score */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Box sx={{ 
								textAlign: 'center', 
								p: 3, 
								border: '1px solid #f1f5f9', 
								borderRadius: 3, 
								bgcolor: '#ffffff',
								boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
							}}>
								<Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, color: 'warning.main' }}>
									Threats / Training Score (T)
								</Typography>
								<Rating
									max={10}
									value={threatsRating}
									onChange={(_, v) => !viewMode && setThreatsRating(v || 0)}
									disabled={viewMode}
									size="medium"
									sx={{ color: 'warning.main' }}
								/>
								<Typography variant="h6" fontWeight={800} color="warning.main" sx={{ mt: 1 }}>
									{threatsRating} / 10
								</Typography>
							</Box>
						</Grid>

						{/* Overall Score */}
						<Grid size={{ xs: 12 }}>
							<Divider sx={{ my: 2 }} />
							<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, pt: 1 }}>
								<Typography variant="subtitle1" fontWeight={800}>
									Overall SWOT Evaluation Rating:
								</Typography>
								<Chip
									label={`${overallRating} / 10`}
									color={overallRating >= 8 ? 'success' : overallRating >= 5 ? 'warning' : 'error'}
									sx={{ fontWeight: 800, fontSize: '1rem', px: 2, py: 2, borderRadius: 2 }}
								/>
							</Box>
						</Grid>
					</Grid>
				</Paper>
			</Box>

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
					Final Recommendation & Status
				</Typography>
				<Paper elevation={0} variant="outlined" sx={{ p: 4, bgcolor: '#fcfcfc', borderRadius: 2 }}>
					<Grid container spacing={3}>
						{/* Recommendation Select */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
								Placement Recommendation *
							</Typography>
							<TextField
								select
								fullWidth
								size="small"
								required
								disabled={viewMode}
								value={recommendation}
								onChange={(e) => setRecommendation(e.target.value)}
								sx={inputSx}
							>
								<MenuItem value="ready_for_placement">Ready for Placement</MenuItem>
								<MenuItem value="needs_additional_training">Needs Additional Training</MenuItem>
							</TextField>
						</Grid>

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
