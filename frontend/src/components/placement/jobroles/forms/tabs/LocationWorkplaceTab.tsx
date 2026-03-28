import React from 'react';
import {
	Grid,
	TextField,
	Autocomplete,
	Chip,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';

interface LocationWorkplaceTabProps {
	formData: any;
	handleNestedChange: (parent: string, field: string, value: any) => void;
	workplaceTypes: string[];
	jobTypes: string[];
}

const LocationWorkplaceTab: React.FC<LocationWorkplaceTabProps> = ({
	formData,
	handleNestedChange,
	workplaceTypes,
	jobTypes
}) => {
	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12 }}>
				<Autocomplete
					multiple
					freeSolo
					options={[]}
					value={formData.location?.cities || []}
					onChange={(_, newValue) => handleNestedChange('location', 'cities', newValue)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={index} />
						))
					}
					renderInput={(params) => <TextField {...params} label="Cities (Type and press Enter)" size="small" placeholder="Select multiple cities" />}
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField
					fullWidth
					label="State"
					value={formData.location?.state || ''}
					onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField
					fullWidth
					label="Country"
					value={formData.location?.country || ''}
					onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<TextField
					fullWidth
					label="Designation"
					value={formData.job_details?.designation || ''}
					onChange={(e) => handleNestedChange('job_details', 'designation', e.target.value)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<FormControl fullWidth size="small">
					<InputLabel>Workplace Type</InputLabel>
					<Select
						value={formData.job_details?.workplace_type || ''}
						label="Workplace Type"
						onChange={(e) => handleNestedChange('job_details', 'workplace_type', e.target.value)}
					>
						{workplaceTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<FormControl fullWidth size="small">
					<InputLabel>Job Type</InputLabel>
					<Select
						value={formData.job_details?.job_type || ''}
						label="Job Type"
						onChange={(e) => handleNestedChange('job_details', 'job_type', e.target.value)}
					>
						{jobTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
					</Select>
				</FormControl>
			</Grid>
		</Grid>
	);
};

export default LocationWorkplaceTab;
