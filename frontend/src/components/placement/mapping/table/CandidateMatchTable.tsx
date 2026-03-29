import {
	Table,
	TableBody,
	TableContainer,
	Box
} from '@mui/material';
import { type CandidateMatchResult } from '../../../../store/slices/placementMappingSlice';

// Modular Components
import CandidateMatchTableHead from './modular/CandidateMatchTableHead';
import CandidateMatchTableRow from './modular/CandidateMatchTableRow';
import CandidateMatchTableEmpty from './modular/CandidateMatchTableEmpty';

interface Props {
	candidates: CandidateMatchResult[];
	onMapClick: (candidate: CandidateMatchResult) => void;
	onUnmapClick: (candidate: CandidateMatchResult) => void;
	emptyMsg: string;
}

const CandidateMatchTable = ({ candidates, onMapClick, onUnmapClick, emptyMsg }: Props) => {
	// Standardized fixed widths for perfect alignment
	const COL_WIDTHS = {
		candidate: '220px',
		score: '85px',
		disability: '140px',
		qualification: '140px',
		experience: '110px',
		mappings: '150px',
		status: '150px',
		skills: '150px',
		actions: '160px'
	};

	return (
		<Box sx={{ width: '100%', bgcolor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
			<TableContainer
				sx={{
					maxHeight: 500,
					overflowX: 'auto',
					overflowY: 'auto',
					bgcolor: 'white',
					// Custom scrollbar
					'&::-webkit-scrollbar': { width: '8px', height: '8px' },
					'&::-webkit-scrollbar-track': { background: '#f8f9fa' },
					'&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px', '&:hover': { background: '#94a3b8' } },
				}}
			>
				<Table stickyHeader sx={{ minWidth: 1200, tableLayout: 'fixed' }} size="medium">
					<CandidateMatchTableHead widths={COL_WIDTHS} />
					<TableBody>
						{candidates.length > 0 ? (
							candidates.map((candidate) => (
								<CandidateMatchTableRow
									key={candidate.public_id}
									candidate={candidate}
									widths={COL_WIDTHS}
									onMap={onMapClick}
									onUnmap={onUnmapClick}
								/>
							))
						) : (
							<CandidateMatchTableEmpty message={emptyMsg} />
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default CandidateMatchTable;
