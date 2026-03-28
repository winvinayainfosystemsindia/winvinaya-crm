import React, { useMemo } from 'react';
import {
	Grid,
	TextField,
	Autocomplete,
	Box,
	Paper,
	Stack,
	Typography,
	Divider,
	FormControl,
	Select,
	MenuItem,
	Chip
} from '@mui/material';
import {
	LocationOnOutlined as PlaceIcon,
	WorkOutline as WorkplaceIcon,
	InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { Country, State, City } from 'country-state-city';
import { awsStyles } from '../../../../../theme/theme';
import type { JobRole } from '../../../../../models/jobRole';

interface LocationWorkplaceTabProps {
	formData: Partial<JobRole>;
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
	const { awsPanel, helperBox } = awsStyles;

	const commonTextFieldProps = {
		size: 'small' as const,
		sx: {
			'& .MuiInputBase-root': {
				borderRadius: '2px',
				bgcolor: '#fcfcfc',
			},
			'& .MuiOutlinedInput-notchedOutline': { borderColor: '#d5dbdb' },
			'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#879596' },
			'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ec7211' }
		}
	};

	// Dynamic Location Data Fetching
	const countries = useMemo(() => Country.getAllCountries(), []);
	
	const selectedCountryObj = useMemo(() => 
		countries.find(c => c.name === formData.location?.country),
		[countries, formData.location?.country]
	);

	const states = useMemo(() => 
		selectedCountryObj ? State.getStatesOfCountry(selectedCountryObj.isoCode) : [],
		[selectedCountryObj]
	);

	const selectedStateObj = useMemo(() => 
		states.find(s => s.name === formData.location?.state),
		[states, formData.location?.state]
	);

	const cities = useMemo(() => 
		(selectedCountryObj && selectedStateObj) 
			? City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode) 
			: [],
		[selectedCountryObj, selectedStateObj]
	);

	return (
		<Stack spacing={4}>
			{/* Location Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<PlaceIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Workplace & Geospatial Details</Typography>
				</Stack>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
						Select the country and state to define the primary work geography. Multiple cities can be assigned for mobile or field roles.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">Primary Country</Typography>
							<Autocomplete
								options={countries}
								getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
								value={selectedCountryObj || null}
								isOptionEqualToValue={(option, value) => option.name === (typeof value === 'string' ? value : value?.name)}
								onChange={(_, v) => {
									const countryName = v && typeof v !== 'string' ? v.name : '';
									handleNestedChange('location', 'country', countryName);
									// Cascading reset
									handleNestedChange('location', 'state', '');
									handleNestedChange('location', 'cities', []);
								}}
								renderInput={(params) => <TextField {...params} placeholder="Select Country" {...commonTextFieldProps} />}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">State/Province</Typography>
							<Autocomplete
								options={states}
								getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
								value={selectedStateObj || null}
								isOptionEqualToValue={(option, value) => option.name === (typeof value === 'string' ? value : value?.name)}
								disabled={!selectedCountryObj}
								onChange={(_, v) => {
									const stateName = v && typeof v !== 'string' ? v.name : '';
									handleNestedChange('location', 'state', stateName);
									// Cascading reset
									handleNestedChange('location', 'cities', []);
								}}
								renderInput={(params) => <TextField {...params} placeholder={selectedCountryObj ? "Select State" : "Select Country first"} {...commonTextFieldProps} />}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">City (Multiple Selection)</Typography>
							<Autocomplete
								multiple
								options={cities.map(c => c.name)}
								getOptionLabel={(option) => option}
								value={formData.location?.cities || []}
								disabled={!selectedStateObj}
								onChange={(_, v) => handleNestedChange('location', 'cities', v)}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => {
										const { key: _key, ...rest } = getTagProps({ index });
										return (
											<Chip
												key={`${option}-${index}`}
												label={option}
												size="small"
												{...rest}
												variant="outlined"
												sx={{ borderRadius: '2px' }}
											/>
										);
									})
								}
								renderInput={(params) => <TextField {...params} placeholder={selectedStateObj ? "Select cities" : "Select State first"} {...commonTextFieldProps} />}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			{/* Workplace Settings Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<WorkplaceIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Employment Configuration</Typography>
				</Stack>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Workplace Type</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={(formData as any).job_details?.workplace_type || 'Onsite'}
									onChange={(e) => handleNestedChange('job_details', 'workplace_type', e.target.value)}
									sx={commonTextFieldProps.sx}
								>
									{workplaceTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
								</Select>
							</FormControl>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Job Classification</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={(formData as any).job_details?.job_type || 'Full Time'}
									onChange={(e) => handleNestedChange('job_details', 'job_type', e.target.value)}
									sx={commonTextFieldProps.sx}
								>
									{jobTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
								</Select>
							</FormControl>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Stack>
	);
};

export default LocationWorkplaceTab;
