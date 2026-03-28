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

const INDIAN_STATES = [
	'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
	'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 
	'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 
	'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 
	'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 
	'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
	'Uttarakhand', 'West Bengal'
];

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Australia', 'Canada'];

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
					options={['Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Mumbai', 'Delhi', 'Coimbatore']}
					value={formData.location?.cities || []}
					onChange={(_, newValue) => handleNestedChange('location', 'cities', newValue)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={index} />
						))
					}
					renderInput={(params) => <TextField {...params} label="Cities (Select or Type and press Enter)" size="small" placeholder="Select multiple cities" />}
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					options={INDIAN_STATES}
					value={formData.location?.state || null}
					onChange={(_, newValue) => handleNestedChange('location', 'state', newValue)}
					renderInput={(params) => <TextField {...params} label="State" size="small" required />}
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					options={COUNTRIES}
					value={formData.location?.country || 'India'}
					onChange={(_, newValue) => handleNestedChange('location', 'country', newValue)}
					renderInput={(params) => <TextField {...params} label="Country" size="small" required />}
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
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
			<Grid size={{ xs: 12, md: 6 }}>
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
