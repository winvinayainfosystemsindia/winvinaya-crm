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
	// Standardized fixed widths for perfect alignment between head and body
	const COL_WIDTHS = {
		candidate: '220px',
		score: '110px',
		disability: '150px',
		qualification: '120px',
		mappings: '120px',
		skills: 'auto', // Grows to fill
		actions: '160px'
	};

	return (
		<Box sx={{ width: '100%', overflow: 'hidden' }}>
			{/* Static Header Row */}
			<Table sx={{ minWidth: 650, tableLayout: 'fixed' }} size="medium">
				<CandidateMatchTableHead widths={COL_WIDTHS} />
			</Table>
			
			{/* Scrollable Data Body Container */}
			<TableContainer 
				sx={{ 
					maxHeight: 500, 
					overflowY: 'auto',
					borderBottom: (t: any) => `1px solid ${t.palette.divider}`,
					// Custom scrollbar handling
					'&::-webkit-scrollbar': {
						width: '8px',
					},
					'&::-webkit-scrollbar-track': {
						background: 'transparent',
					},
					'&::-webkit-scrollbar-thumb': {
						background: '#ccc',
						borderRadius: '4px',
						'&:hover': {
							background: '#bbb',
						},
					},
				}}
			>
				<Table sx={{ minWidth: 650, tableLayout: 'fixed' }} size="medium">
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
