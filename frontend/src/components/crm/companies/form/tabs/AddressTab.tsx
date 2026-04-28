import React, { useMemo } from 'react';
import { Grid, TextField, Autocomplete } from '@mui/material';
import { Country, State, City } from 'country-state-city';
import type { Company } from '../../../../../models/company';

interface AddressTabProps {
	formData: Partial<Company>;
	onChange: (field: string, value: unknown) => void;
}

const AddressTab: React.FC<AddressTabProps> = ({ formData, onChange }) => {
	const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '2px' } };

	const countries = useMemo(() => Country.getAllCountries(), []);

	const selectedCountryObj = useMemo(
		() => countries.find((c) => c.name === formData.address?.country),
		[countries, formData.address?.country]
	);

	const states = useMemo(
		() => (selectedCountryObj ? State.getStatesOfCountry(selectedCountryObj.isoCode) : []),
		[selectedCountryObj]
	);

	const selectedStateObj = useMemo(
		() => states.find((s) => s.name === formData.address?.state),
		[states, formData.address?.state]
	);

	const cities = useMemo(
		() =>
			selectedCountryObj && selectedStateObj
				? City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode)
				: [],
		[selectedCountryObj, selectedStateObj]
	);

	return (
		<Grid container spacing={3}>
			{/* Street Address */}
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					label="Street Address"
					value={formData.address?.street ?? ''}
					onChange={(e) => onChange('address.street', e.target.value)}
					size="small"
					sx={inputSx}
				/>
			</Grid>

			{/* Country */}
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					options={countries}
					getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
					value={selectedCountryObj || null}
					isOptionEqualToValue={(option, value) =>
						option.name === (typeof value === 'string' ? value : value?.name)
					}
					onChange={(_, v) => {
						const countryName = v && typeof v !== 'string' ? v.name : '';
						onChange('address.country', countryName);
						onChange('address.state', '');
						onChange('address.city', '');
					}}
					renderInput={(params) => (
						<TextField {...params} label="Country" size="small" sx={inputSx} />
					)}
				/>
			</Grid>

			{/* State */}
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					options={states}
					getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
					value={selectedStateObj || null}
					isOptionEqualToValue={(option, value) =>
						option.name === (typeof value === 'string' ? value : value?.name)
					}
					disabled={!selectedCountryObj}
					onChange={(_, v) => {
						const stateName = v && typeof v !== 'string' ? v.name : '';
						onChange('address.state', stateName);
						onChange('address.city', '');
					}}
					renderInput={(params) => (
						<TextField {...params} label="State / Province" size="small" sx={inputSx} />
					)}
				/>
			</Grid>

			{/* City */}
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					options={cities}
					getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
					value={cities.find((c) => c.name === formData.address?.city) || null}
					isOptionEqualToValue={(option, value) =>
						option.name === (typeof value === 'string' ? value : value?.name)
					}
					disabled={!selectedStateObj}
					onChange={(_, v) => {
						const cityName = v && typeof v !== 'string' ? v.name : '';
						onChange('address.city', cityName);
					}}
					renderInput={(params) => (
						<TextField {...params} label="City" size="small" sx={inputSx} />
					)}
				/>
			</Grid>

			{/* Pincode */}
			<Grid size={{ xs: 12, md: 6 }}>
				<TextField
					fullWidth
					label="Pincode"
					value={formData.address?.pincode ?? ''}
					onChange={(e) => onChange('address.pincode', e.target.value)}
					size="small"
					sx={inputSx}
				/>
			</Grid>
		</Grid>
	);
};

export default AddressTab;
