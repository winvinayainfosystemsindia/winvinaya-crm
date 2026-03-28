import React from 'react';
import {
	Grid,
	TextField,
	Autocomplete,
	Chip,
} from '@mui/material';

interface RequirementsCompensationTabProps {
	formData: any;
	handleNestedChange: (parent: string, field: string, value: any) => void;
	qualifications: string[];
}

const RequirementsCompensationTab: React.FC<RequirementsCompensationTabProps> = ({
	formData,
	handleNestedChange,
	qualifications
}) => {
	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12 }}>
				<Autocomplete
					multiple
					options={qualifications}
					value={formData.requirements?.qualifications || []}
					onChange={(_, newValue) => handleNestedChange('requirements', 'qualifications', newValue)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={index} />
						))
					}
					renderInput={(params) => <TextField {...params} label="Minimum Qualifications" size="small" />}
				/>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<Autocomplete
					multiple
					freeSolo
					options={[]}
					value={formData.requirements?.skills || []}
					onChange={(_, newValue) => handleNestedChange('requirements', 'skills', newValue)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={index} />
						))
					}
					renderInput={(params) => <TextField {...params} label="Required Skills" size="small" placeholder="Type and press Enter" />}
				/>
			</Grid>
			<Grid size={{ xs: 6, md: 3 }}>
				<TextField
					fullWidth
					type="number"
					label="Exp Min (Years)"
					value={formData.experience?.min ?? ''}
					onChange={(e) => handleNestedChange('experience', 'min', parseFloat(e.target.value) || 0)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 6, md: 3 }}>
				<TextField
					fullWidth
					type="number"
					label="Exp Max (Years)"
					value={formData.experience?.max ?? ''}
					onChange={(e) => handleNestedChange('experience', 'max', parseFloat(e.target.value) || 0)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 6, md: 3 }}>
				<TextField
					fullWidth
					type="number"
					label="Sal Min (LPA)"
					value={formData.salary_range?.min ?? ''}
					onChange={(e) => handleNestedChange('salary_range', 'min', parseFloat(e.target.value) || 0)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 6, md: 3 }}>
				<TextField
					fullWidth
					type="number"
					label="Sal Max (LPA)"
					value={formData.salary_range?.max ?? ''}
					onChange={(e) => handleNestedChange('salary_range', 'max', parseFloat(e.target.value) || 0)}
					size="small"
				/>
			</Grid>
		</Grid>
	);
};

export default RequirementsCompensationTab;
