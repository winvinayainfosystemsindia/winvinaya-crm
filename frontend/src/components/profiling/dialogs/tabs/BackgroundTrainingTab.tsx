import React from 'react';
import {
	Box,
	Typography,
	Stack,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	TextField,
	Checkbox
} from '@mui/material';

interface BackgroundTrainingTabProps {
	formData: any;
	onUpdateField: (section: string, field: string, value: any) => void;
}

const BackgroundTrainingTab: React.FC<BackgroundTrainingTabProps> = ({
	formData,
	onUpdateField
}) => {
	const sectionTitleStyle = {
		fontWeight: 700,
		fontSize: '0.875rem',
		color: '#545b64',
		mb: 2,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.025em'
	};

	const awsPanelStyle = {
		border: '1px solid #d5dbdb',
		borderRadius: '2px',
		p: 3,
		bgcolor: '#ffffff'
	};

	return (
		<Box sx={awsPanelStyle}>
			<Typography sx={sectionTitleStyle}>Training Info</Typography>
			<Stack spacing={3}>
				<FormControl component="fieldset">
					<FormLabel sx={{ fontSize: '0.875rem', mb: 1, color: '#545b64', fontWeight: 500 }}>
						Have you attended any training previously?
					</FormLabel>
					<RadioGroup
						row
						value={formData.previous_training?.attended_any_training ? 'yes' : 'no'}
						onChange={(e) => onUpdateField('previous_training', 'attended_any_training', e.target.value === 'yes')}
					>
						<FormControlLabel
							value="yes"
							control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
							label={<Typography variant="body2">Yes</Typography>}
						/>
						<FormControlLabel
							value="no"
							control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
							label={<Typography variant="body2">No</Typography>}
						/>
					</RadioGroup>
				</FormControl>

				{formData.previous_training?.attended_any_training && (
					<TextField
						label="Training Details"
						placeholder="Mention course name, institute, etc."
						fullWidth
						multiline
						rows={2}
						size="small"
						value={formData.previous_training?.training_details}
						onChange={(e) => onUpdateField('previous_training', 'training_details', e.target.value)}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
					/>
				)}

				<FormControlLabel
					control={
						<Checkbox
							size="small"
							checked={formData.previous_training?.is_winvinaya_student}
							onChange={(e) => onUpdateField('previous_training', 'is_winvinaya_student', e.target.checked)}
							sx={{ '&.Mui-checked': { color: '#ec7211' } }}
						/>
					}
					label={<Typography variant="body2">Are you a WinVinaya Student?</Typography>}
				/>
			</Stack>
		</Box>
	);
};

export default BackgroundTrainingTab;
