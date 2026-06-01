import React, { memo } from 'react';
import {
	Stack,
	Box,
	Typography,
	TextField,
	Grid,
	MenuItem
} from '@mui/material';

interface BasicDetailsTabProps {
	candidateId: number | '';
	setCandidateId: (val: number | '') => void;
	analystName: string;
	analysisDate: string;
	candidates: Array<{ id: number; name: string }>;
	viewMode: boolean;
	isEdit: boolean;
}

const BasicDetailsTab: React.FC<BasicDetailsTabProps> = memo(({
	candidateId,
	setCandidateId,
	analystName,
	analysisDate,
	candidates,
	viewMode,
	isEdit
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
		<Stack spacing={4} sx={{ maxWidth: 800, mx: 'auto' }}>
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
					Evaluation Metadata
				</Typography>
				<Grid container spacing={3}>
					{/* Candidate Name Select */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Candidate Name *
						</Typography>
						<TextField
							select
							fullWidth
							size="small"
							required
							disabled={viewMode || isEdit}
							value={candidateId}
							onChange={(e) => setCandidateId(Number(e.target.value))}
							sx={inputSx}
						>
							{candidates.map(c => (
								<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
							))}
						</TextField>
					</Grid>

					{/* Analyst Name */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Evaluator / Analyst *
						</Typography>
						<TextField
							fullWidth
							size="small"
							required
							disabled={true}
							value={analystName}
							sx={inputSx}
						/>
					</Grid>

					{/* Evaluation Date */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block', color: 'text.secondary' }}>
							Evaluation Date *
						</Typography>
						<TextField
							type="date"
							fullWidth
							size="small"
							required
							disabled={true}
							value={analysisDate}
							sx={inputSx}
						/>
					</Grid>
				</Grid>
			</Box>
		</Stack>
	);
});

BasicDetailsTab.displayName = 'BasicDetailsTab';

export default BasicDetailsTab;
