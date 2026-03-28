import React from 'react';
import {
	Grid,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Autocomplete,
	FormControlLabel,
	Switch,
	Typography,
} from '@mui/material';
import { JOB_ROLE_STATUS } from '../../../../../models/jobRole';

interface GeneralInfoTabProps {
	formData: any;
	handleChange: (field: string, value: any) => void;
	companies: any[];
	contacts: any[];
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({
	formData,
	handleChange,
	companies,
	contacts
}) => {
	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12 }}>
				<TextField
					required
					fullWidth
					label="Job Title"
					value={formData.title || ''}
					onChange={(e) => handleChange('title', e.target.value)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<TextField
					fullWidth
					multiline
					rows={3}
					label="Job Description"
					value={formData.description || ''}
					onChange={(e) => handleChange('description', e.target.value)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					options={companies}
					getOptionLabel={(option: any) => option.name || ''}
					value={companies.find((c: any) => c.id === formData.company_id) || null}
					onChange={(_, newValue) => {
						handleChange('company_id', newValue?.id);
						handleChange('contact_id', undefined);
					}}
					renderInput={(params) => <TextField {...params} required label="Associated Company" size="small" />}
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					options={contacts}
					getOptionLabel={(option: any) => `${option.first_name} ${option.last_name}`}
					value={contacts.find((c: any) => c.id === formData.contact_id) || null}
					onChange={(_, newValue) => handleChange('contact_id', newValue?.id)}
					disabled={!formData.company_id}
					renderInput={(params) => <TextField {...params} required label="Contact Person" size="small" />}
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<FormControl fullWidth size="small">
					<InputLabel>Status</InputLabel>
					<Select
						value={formData.status || JOB_ROLE_STATUS.ACTIVE}
						label="Status"
						onChange={(e) => handleChange('status', e.target.value)}
					>
						<MenuItem value={JOB_ROLE_STATUS.ACTIVE}>Active</MenuItem>
						<MenuItem value={JOB_ROLE_STATUS.INACTIVE}>Inactive</MenuItem>
						<MenuItem value={JOB_ROLE_STATUS.CLOSED}>Closed</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<TextField
					fullWidth
					type="number"
					label="No. of Vacancies"
					value={formData.no_of_vacancies || ''}
					onChange={(e) => handleChange('no_of_vacancies', parseInt(e.target.value) || undefined)}
					size="small"
				/>
			</Grid>
			<Grid size={{ xs: 12, md: 4 }}>
				<TextField
					fullWidth
					type="date"
					label="Close Date"
					value={formData.close_date || ''}
					onChange={(e) => handleChange('close_date', e.target.value)}
					size="small"
					InputLabelProps={{ shrink: true }}
				/>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<FormControlLabel
					control={
						<Switch
							checked={formData.is_visible ?? true}
							onChange={(e) => handleChange('is_visible', e.target.checked)}
							color="primary"
						/>
					}
					label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Available for Mapping</Typography>}
				/>
			</Grid>
		</Grid>
	);
};

export default GeneralInfoTab;
