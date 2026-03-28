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
		mappings: string;
		skills: string;
		actions: string;
	};
}

const CandidateMatchTableHead = ({ widths }: Props) => {
	const headCellStyle = {
		fontWeight: 600,
		color: 'text.secondary',
		fontSize: '0.75rem',
		py: 2,
		borderBottom: (t: any) => `1px solid ${t.palette.divider}`,
		bgcolor: '#f8f9fa',
		zIndex: 2,
		position: 'sticky' as const,
		top: 0
	};

	return (
		<TableHead>
			<TableRow>
				<TableCell sx={{ ...headCellStyle, width: widths.candidate }}>Candidate</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.score }}>Score</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.disability }}>Disability</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.qualification }}>Qualification</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.mappings }}>Other Active Mappings</TableCell>
				<TableCell sx={{ ...headCellStyle, width: widths.skills }}>Skills</TableCell>
				<TableCell align="right" sx={{ ...headCellStyle, width: widths.actions }}>Actions</TableCell>
			</TableRow>
		</TableHead>
	);
};

export default CandidateMatchTableHead;
