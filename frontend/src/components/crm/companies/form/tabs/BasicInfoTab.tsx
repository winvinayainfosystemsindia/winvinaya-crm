import React from 'react';
import {
	Grid,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Autocomplete,
} from '@mui/material';
import type { Company } from '../../../../../models/company';
import { COMPANY_SIZES, COMPANY_STATUSES, COMPANY_INDUSTRIES } from '../../../../../data/companyData';

interface BasicInfoTabProps {
	formData: Partial<Company>;
	onChange: (field: string, value: unknown) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, onChange }) => {
	const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 1 } };

	return (
		<Grid container spacing={3}>
			{/* Company Name */}
			<Grid size={{ xs: 12, md: 8 }}>
				<TextField
					required
					fullWidth
					label="Company Name"
					value={formData.name ?? ''}
					onChange={(e) => onChange('name', e.target.value)}
					variant="outlined"
					size="small"
					sx={inputSx}
				/>
			</Grid>

			{/* Status */}
			<Grid size={{ xs: 12, md: 4 }}>
				<FormControl fullWidth size="small">
					<InputLabel>Status</InputLabel>
					<Select
						value={formData.status ?? 'prospect'}
						label="Status"
						onChange={(e) => onChange('status', e.target.value)}
						sx={{ borderRadius: 1 }}
					>
						{COMPANY_STATUSES.map((s: { value: string; label: string }) => (
							<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>

			{/* Industry */}
			<Grid size={{ xs: 12, md: 6 }}>
				<Autocomplete
					fullWidth
					size="small"
					options={COMPANY_INDUSTRIES}
					value={formData.industry || null}
					onChange={(_event, newValue) => onChange('industry', newValue)}
					renderInput={(params) => (
						<TextField {...params} label="Industry" variant="outlined" sx={inputSx} />
					)}
				/>
			</Grid>

			{/* Company Size */}
			<Grid size={{ xs: 12, md: 6 }}>
				<FormControl fullWidth size="small">
					<InputLabel>Company Size</InputLabel>
					<Select
						value={formData.company_size ?? 'micro'}
						label="Company Size"
						onChange={(e) => onChange('company_size', e.target.value)}
						sx={{ borderRadius: 1 }}
					>
						{COMPANY_SIZES.map((s: { value: string; label: string }) => (
							<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
		</Grid>
	);
};

export default BasicInfoTab;
