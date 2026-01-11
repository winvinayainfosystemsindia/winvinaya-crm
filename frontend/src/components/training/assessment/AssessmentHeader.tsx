import React from 'react';
import {
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	CircularProgress
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';

interface AssessmentHeaderProps {
	assessmentNames: string[];
	activeAssessmentName: string;
	onSelectAssessment: (name: string) => void;
	onCreateNew: () => void;
	onSave: () => void;
	onDelete: () => void;
	saving: boolean;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
	assessmentNames,
	activeAssessmentName,
	onSelectAssessment,
	onCreateNew,
	onSave,
	onDelete,
	saving
}) => {
	return (
		<Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
			<Grid size={{ xs: 12, md: 4 }}>
				<FormControl fullWidth size="small">
					<InputLabel>Select Assessment</InputLabel>
					<Select
						value={assessmentNames.includes(activeAssessmentName) ? activeAssessmentName : ''}
						label="Select Assessment"
						onChange={(e) => onSelectAssessment(e.target.value)}
						sx={{ bgcolor: 'white' }}
					>
						{assessmentNames.map(name => (
							<MenuItem key={name} value={name}>{name}</MenuItem>
						))}
						{assessmentNames.length === 0 && <MenuItem disabled>No assessments found</MenuItem>}
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={onCreateNew}
					sx={{
						bgcolor: 'white',
						color: '#545b64',
						border: '1px solid #aab7b8',
						'&:hover': { bgcolor: '#f2f3f3', borderColor: '#879196' },
						textTransform: 'none',
						fontWeight: 700,
						boxShadow: 'none'
					}}
				>
					Create New
				</Button>
				<Button
					variant="contained"
					startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
					onClick={onSave}
					disabled={saving || !activeAssessmentName}
					sx={{
						bgcolor: '#ff9900',
						color: '#232f3e',
						'&:hover': { bgcolor: '#ec7211' },
						'&.Mui-disabled': { bgcolor: '#f2f3f3', color: '#aab7b8' },
						textTransform: 'none',
						boxShadow: 'none',
						fontWeight: 700,
						minWidth: 140
					}}
				>
					{saving ? 'Saving...' : 'Save changes'}
				</Button>
				{activeAssessmentName && assessmentNames.includes(activeAssessmentName) && (
					<Button
						variant="outlined"
						onClick={onDelete}
						disabled={saving}
						sx={{
							color: '#d13212',
							borderColor: '#d13212',
							'&:hover': { bgcolor: '#fdedf0', borderColor: '#d13212' },
							textTransform: 'none',
							fontWeight: 700
						}}
					>
						Delete Assessment
					</Button>
				)}
			</Grid>
		</Grid>
	);
};

export default AssessmentHeader;
