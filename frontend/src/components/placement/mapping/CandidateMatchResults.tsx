import { useState } from 'react';
import { 
	Paper, 
	Box, 
	CircularProgress, 
	Typography, 
	Tabs, 
	Tab, 
	Stack 
} from '@mui/material';
import { type CandidateMatchResult } from '../../../services/placementMappingService';
import { AWS_COLORS } from './mappingTypes';
import CandidateMatchTable from './CandidateMatchTable';

interface Props {
	matches: CandidateMatchResult[];
	loading: boolean;
	onMapClick: (candidate: CandidateMatchResult) => void;
}

const CandidateMatchResults = ({ matches, loading, onMapClick }: Props) => {
	const [tabIndex, setTabIndex] = useState(0);

	const suggestedCandidates = matches.filter(c => !c.is_already_mapped && c.match_score >= 40);
	const mappedCandidates = matches.filter(c => c.is_already_mapped);
	const notSuggestedCandidates = matches.filter(c => !c.is_already_mapped && c.match_score < 40);

	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: '0px',
				borderColor: AWS_COLORS.border,
				bgcolor: 'white',
				minHeight: 550,
				display: 'flex',
				flexDirection: 'column'
			}}
		>
			{loading ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
					<CircularProgress size={40} sx={{ color: AWS_COLORS.primary, mb: 2 }} />
					<Typography variant="body2" sx={{ color: AWS_COLORS.secondaryText, fontWeight: 500 }}>Analyzing candidate pool and calculating affinity scores...</Typography>
				</Box>
			) : (
				<>
					<Box sx={{ px: 2, pt: 0.5, borderBottom: `1px solid ${AWS_COLORS.border}`, bgcolor: AWS_COLORS.surface }}>
						<Tabs
							value={tabIndex}
							onChange={(_, v) => setTabIndex(v)}
							sx={{
								minHeight: 48,
								'& .MuiTabs-indicator': { bgcolor: AWS_COLORS.primary, height: 3 },
								'& .MuiTab-root': {
									textTransform: 'none',
									fontWeight: 700,
									fontSize: '0.875rem',
									color: AWS_COLORS.secondaryText,
									minHeight: 48,
									px: 3,
									'&.Mui-selected': { color: AWS_COLORS.primary }
								}
							}}
						>
							<Tab label={`High Affinity (${suggestedCandidates.length})`} />
							<Tab label={`Already Mapped (${mappedCandidates.length})`} />
							<Tab label={`Lower Affinity (${notSuggestedCandidates.length})`} />
						</Tabs>
					</Box>

					<Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
						{tabIndex === 0 && (
							<CandidateMatchTable
								candidates={suggestedCandidates}
								onMapClick={onMapClick}
								emptyMsg="No candidates found with >40% affinity for this specification."
							/>
						)}
						{tabIndex === 1 && (
							<CandidateMatchTable
								candidates={mappedCandidates}
								onMapClick={onMapClick}
								emptyMsg="No candidates have been mapped to this resource."
							/>
						)}
						{tabIndex === 2 && (
							<CandidateMatchTable
								candidates={notSuggestedCandidates}
								onMapClick={onMapClick}
								emptyMsg="No candidates found in the low affinity threshold."
							/>
						)}
					</Box>

					<Box sx={{ p: 2, bgcolor: AWS_COLORS.surface, borderTop: `1px solid ${AWS_COLORS.border}` }}>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography variant="caption" sx={{ color: AWS_COLORS.secondaryText, fontWeight: 500 }}>
								Algorithm output: Based on screening and counseling data aggregation.
							</Typography>
							<Typography variant="caption" sx={{ color: AWS_COLORS.label, fontWeight: 700 }}>
								Total Resultset: {matches.length}
							</Typography>
						</Stack>
					</Box>
				</>
			)}
		</Paper>
	);
};

export default CandidateMatchResults;
