import {
	TableHead,
	TableRow,
	TableCell
} from '@mui/material';

interface Props {
	widths: {
		candidate: string;
		score: string;
		disability: string;
		qualification: string;
		experience: string;
		mappings: string;
		status: string;
		skills: string;
		actions: string;
	};
}

const CandidateMatchTableHead = ({ widths }: Props) => {
	const headCellStyle = {
		fontWeight: 600,
		color: '#475569',
		fontSize: '0.75rem',
		letterSpacing: '0.05em',
		py: 2,
		px: 2,
		borderBottom: '2px solid #e2e8f0',
		bgcolor: '#f8fafc',
	};

	return (
		<TableHead>
			<TableRow>
				<TableCell sx={{ 
                    ...headCellStyle, 
                    width: widths.candidate, 
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 25, 
                    borderRight: '2px solid #e2e8f0', // Single stronger border
                }}>Candidate</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.score }}>Score</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.disability }}>Disability</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.qualification }}>Qualification</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.experience }}>Experience</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.mappings }}>Active Mappings</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.status }}>Status</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.skills }}>Skills</TableCell>
				<TableCell align="right" sx={{ 
                    ...headCellStyle, 
                    width: widths.actions, 
                    position: 'sticky', 
                    right: 0, 
                    zIndex: 25, 
                    borderLeft: '2px solid #e2e8f0',
                }}>Actions</TableCell>
			</TableRow>
		</TableHead>
	);
};

export default CandidateMatchTableHead;
