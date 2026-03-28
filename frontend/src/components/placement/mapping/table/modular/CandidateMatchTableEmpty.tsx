import {
	TableRow,
	TableCell,
	Typography,
	Box
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface Props {
	message: string;
}

const CandidateMatchTableEmpty = ({ message }: Props) => {
	return (
		<TableRow>
			<TableCell colSpan={6} align="center" sx={{ py: 12 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
					<InfoIcon sx={{ color: 'divider', fontSize: 64, mb: 2 }} />
					<Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>
						No Matching Resources
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400 }}>
						{message}
					</Typography>
				</Box>
			</TableCell>
		</TableRow>
	);
};

export default CandidateMatchTableEmpty;
