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
	Chip
} from '@mui/material';
import {
	SchoolOutlined as EducationIcon,
	AccessibleOutlined as DisabilityIcon,
	InfoOutlined as InfoIcon,
	WorkHistoryOutlined as ExperienceIcon,
	PaymentsOutlined as SalaryIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../../theme/theme';
import { disabilityTypes } from '../../../../../data/Disabilities';
import { QUALIFICATIONS } from '../../../../../data/jobRoleData';
import type { JobRole } from '../../../../../models/jobRole';
import SkillDropdown from '../../../../common/SkillDropdown';

interface RequirementsCompensationTabProps {
	formData: Partial<JobRole>;
	handleNestedChange: (parent: string, field: string, value: any) => void;
	highlightMissing?: boolean;
}

const RequirementsCompensationTab: React.FC<RequirementsCompensationTabProps> = ({
	formData,
	handleNestedChange,
	highlightMissing
}) => {
	const { awsPanel, helperBox } = awsStyles;

	const getFieldStyle = (value: any, isRequired: boolean = false) => {
		const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
		const isMissing = highlightMissing && isRequired && isEmpty;
		return {
			...commonTextFieldProps.sx,
			'& .MuiInputBase-root': {
				...commonTextFieldProps.sx['& .MuiInputBase-root'],
				border: isMissing ? '1px dashed #ec7211' : 'none',
				bgcolor: isMissing ? 'rgba(236, 114, 17, 0.03)' : '#fcfcfc',
			}
		};
	};

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
			{/* Core Requirements Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<EducationIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Candidate Mandatory Qualifications</Typography>
				</Stack>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
						Specify the educational background and core technical skills required for this role.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
								<Typography variant="awsFieldLabel" sx={{ mb: 0 }}>Required Qualifications</Typography>
								{highlightMissing && !formData.requirements?.qualifications?.length && (
									<Typography variant="caption" sx={{ color: '#ec7211', fontWeight: 700 }}>VERIFICATION REQUIRED</Typography>
								)}
							</Stack>
							<Autocomplete
								multiple
								options={QUALIFICATIONS}
								value={formData.requirements?.qualifications || []}
								onChange={(_, v) => handleNestedChange('requirements', 'qualifications', v)}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => {
										const { key: _key, ...rest } = getTagProps({ index });
										return (
											<Chip
												key={option}
												label={option}
												size="small"
												{...rest}
												sx={{ borderRadius: '2px' }}
											/>
										);
									})
								}
								renderInput={(params) => (
									<TextField 
										{...params} 
										placeholder="Select Education" 
										{...commonTextFieldProps} 
										sx={getFieldStyle(formData.requirements?.qualifications, true)}
									/>
								)}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<SkillDropdown
								multiple
								value={formData.requirements?.skills || []}
								onChange={(newValue) => handleNestedChange('requirements', 'skills', newValue)}
								label="Key Technical Skills"
								placeholder="Type or select skills"
								size="small"
								renderTags={(value, getTagProps) =>
									value.map((option, index) => {
										const { key: _key, ...rest } = getTagProps({ index });
										return (
											<Chip
												key={index}
												label={option}
												size="small"
												{...rest}
												sx={{ borderRadius: '2px' }}
											/>
										);
									})
								}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			{/* Disability Preference Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<DisabilityIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Disability Inclusion Preferences</Typography>
				</Stack>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12 }}>
						<Box>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
								<Typography variant="awsFieldLabel" sx={{ mb: 0 }}>Disability Types Preferred</Typography>
							</Stack>
							<Autocomplete
								multiple
								options={disabilityTypes}
								value={formData.requirements?.disability_preferred || []}
								onChange={(_, v) => handleNestedChange('requirements', 'disability_preferred', v)}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => {
										const { key: _key, ...rest } = getTagProps({ index });
										return (
											<Chip
												key={option}
												label={option}
												size="small"
												{...rest}
												sx={{ borderRadius: '2px' }}
											/>
										);
									})
								}
								renderInput={(params) => (
									<TextField 
										{...params} 
										placeholder="Select Disability Preferences" 
										{...commonTextFieldProps} 
										sx={getFieldStyle(formData.requirements?.disability_preferred, false)}
									/>
								)}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			{/* Experience Requirements Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<ExperienceIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Experience Requirements</Typography>
				</Stack>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Minimum Experience (Years)</Typography>
							<TextField
								type="number"
								placeholder="0"
								inputProps={{ min: 0, step: 0.5 }}
								value={formData.experience?.min ?? ''}
								onChange={(e) => {
									const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
									handleNestedChange('experience', 'min', val);
								}}
								{...commonTextFieldProps}
								fullWidth
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, sm: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Maximum Experience (Years)</Typography>
							<TextField
								type="number"
								placeholder="e.g. 5"
								inputProps={{ min: 0, step: 0.5 }}
								value={formData.experience?.max ?? ''}
								onChange={(e) => {
									const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
									handleNestedChange('experience', 'max', val);
								}}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			{/* Compensation Details Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'secondary.main', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<SalaryIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Compensation Details</Typography>
				</Stack>

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, sm: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">Minimum Salary</Typography>
							<TextField
								type="number"
								placeholder="e.g. 300000"
								inputProps={{ min: 0, step: 10000 }}
								value={formData.salary_range?.min ?? ''}
								onChange={(e) => {
									const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
									handleNestedChange('salary_range', 'min', val);
								}}
								{...commonTextFieldProps}
								fullWidth
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">Maximum Salary</Typography>
							<TextField
								type="number"
								placeholder="e.g. 600000"
								inputProps={{ min: 0, step: 10000 }}
								value={formData.salary_range?.max ?? ''}
								onChange={(e) => {
									const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
									handleNestedChange('salary_range', 'max', val);
								}}
								{...commonTextFieldProps}
								fullWidth
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, sm: 4 }}>
						<Box>
							<Typography variant="awsFieldLabel">Currency</Typography>
							<TextField
								select
								value={formData.salary_range?.currency || 'INR'}
								onChange={(e) => handleNestedChange('salary_range', 'currency', e.target.value)}
								SelectProps={{ native: true }}
								{...commonTextFieldProps}
								fullWidth
							>
								<option value="INR">INR (₹)</option>
								<option value="USD">USD ($)</option>
								<option value="EUR">EUR (€)</option>
								<option value="GBP">GBP (£)</option>
							</TextField>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Stack>
	);
};

export default RequirementsCompensationTab;
