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
import { type CandidateMatchResult } from '../../../../services/placementMappingService';
import CandidateMatchTable from './CandidateMatchTable';

interface Props {
	matches: CandidateMatchResult[];
	loading: boolean;
	onMapClick: (candidate: CandidateMatchResult) => void;
}

const CandidateMatchResults = ({ matches, loading, onMapClick }: Props) => {
	const [tabIndex, setTabIndex] = useState(0);

	const suggestedCandidates = matches.filter((c: CandidateMatchResult) => !c.is_already_mapped && c.match_score >= 40);
	const mappedCandidates = matches.filter((c: CandidateMatchResult) => c.is_already_mapped);
	const notSuggestedCandidates = matches.filter((c: CandidateMatchResult) => !c.is_already_mapped && c.match_score < 40);

	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: '0px',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				minHeight: 550,
				display: 'flex',
				flexDirection: 'column'
			}}
		>
			{loading ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
					<CircularProgress size={40} sx={{ color: 'primary.main', mb: 2 }} />
					<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Analyzing candidate pool and calculating affinity scores...</Typography>
				</Box>
			) : (
				<>
					<Box sx={{ px: 2, pt: 0.5, borderBottom: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'action.hover' }}>
						<Tabs
							value={tabIndex}
							onChange={(_, v) => setTabIndex(v)}
							sx={{
								minHeight: 48,
								'& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 },
								'& .MuiTab-root': {
									textTransform: 'none',
									fontWeight: 700,
									fontSize: '0.875rem',
									color: 'text.secondary',
									minHeight: 48,
									px: 3,
									'&.Mui-selected': { color: 'primary.main' }
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

					<Box sx={{ p: 2, bgcolor: 'action.hover', borderTop: (t) => `1px solid ${t.palette.divider}` }}>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
								Algorithm output: Based on screening and counseling data aggregation.
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
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
