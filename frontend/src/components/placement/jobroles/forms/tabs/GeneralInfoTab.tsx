import React from 'react';
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
	FormControlLabel,
	Switch
} from '@mui/material';
import {
	InfoOutlined as InfoIcon,
	Business as BusinessIcon,
	AssignmentIndOutlined as IdentificationIcon,
	VisibilityOutlined as VisibilityIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../../theme/theme';
import { JOB_ROLE_STATUS } from '../../../../../models/jobRole';
import type { JobRole } from '../../../../../models/jobRole';
import type { Company } from '../../../../../models/company';
import type { Contact } from '../../../../../models/contact';

interface GeneralInfoTabProps {
	formData: Partial<JobRole>;
	handleChange: (field: string, value: any) => void;
	handleNestedChange: (parent: string, field: string, value: any) => void;
	companies: Company[];
	contacts: Contact[];
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({
	formData,
	handleChange,
	handleNestedChange,
	companies,
	contacts
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

	return (
		<Stack spacing={4}>
			{/* Identification Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<IdentificationIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Standard Job Identification</Typography>
				</Stack>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
						Define the internal requisition title and the external-facing designation for accurate candidate mapping.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Job Title</Typography>
							<TextField
								fullWidth
								value={formData.title || ''}
								onChange={(e) => handleChange('title', e.target.value)}
								placeholder="e.g. Senior Software Engineer"
								inputProps={{ maxLength: 100 }}
								helperText={`${(formData.title || '').length}/100`}
								{...commonTextFieldProps}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Designation</Typography>
							<TextField
								fullWidth
								value={(formData as any).job_details?.designation || ''}
								onChange={(e) => handleNestedChange('job_details', 'designation', e.target.value)}
								placeholder="e.g. SDE-II"
								inputProps={{ maxLength: 100 }}
								helperText={`${((formData as any).job_details?.designation || '').length}/100`}
								{...commonTextFieldProps}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">Status</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={formData.status || JOB_ROLE_STATUS.ACTIVE}
									onChange={(e) => handleChange('status', e.target.value)}
									sx={commonTextFieldProps.sx}
								>
									<MenuItem value={JOB_ROLE_STATUS.ACTIVE}>Active</MenuItem>
									<MenuItem value={JOB_ROLE_STATUS.INACTIVE}>Inactive</MenuItem>
									<MenuItem value={JOB_ROLE_STATUS.CLOSED}>Closed</MenuItem>
								</Select>
							</FormControl>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">No. of Vacancies</Typography>
							<TextField
								fullWidth
								type="number"
								value={formData.no_of_vacancies ?? ''}
								onChange={(e) => handleChange('no_of_vacancies', parseInt(e.target.value) || 0)}
								{...commonTextFieldProps}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">Requisition Close Date</Typography>
							<TextField
								fullWidth
								type="date"
								value={formData.close_date || ''}
								onChange={(e) => handleChange('close_date', e.target.value)}
								slotProps={{ inputLabel: { shrink: true } }}
								{...commonTextFieldProps}
							/>
						</Box>
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
							label={
								<Stack direction="row" spacing={1} alignItems="center">
									<VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
									<Typography variant="body2" sx={{ fontWeight: 600 }}>Available for Mapping</Typography>
								</Stack>
							}
						/>
					</Grid>
				</Grid>
			</Paper>

			{/* Corporate Alignment Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<BusinessIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Corporate Alignment</Typography>
				</Stack>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Hiring Company</Typography>
							<Autocomplete
								options={companies}
								getOptionLabel={(option) => option.name || ''}
								value={companies.find((c) => c.id === formData.company_id) || null}
								onChange={(_, newValue) => {
									handleChange('company_id', newValue?.id);
									handleChange('contact_id', null);
								}}
								renderInput={(params) => (
									<TextField {...params} placeholder="Select Company" {...commonTextFieldProps} />
								)}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Primary Contact Person</Typography>
							<Autocomplete
								options={contacts}
								getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
								value={contacts.find((c) => c.id === formData.contact_id) || null}
								onChange={(_, newValue) => handleChange('contact_id', newValue?.id)}
								disabled={!formData.company_id}
								renderInput={(params) => (
									<TextField
										{...params}
										placeholder={formData.company_id ? "Select Contact" : "Select a company first"}
										{...commonTextFieldProps}
									/>
								)}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Stack>
	);
};

export default GeneralInfoTab;
