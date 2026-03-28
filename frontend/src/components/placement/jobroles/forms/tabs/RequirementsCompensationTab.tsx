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
	InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../../theme/theme';
import { disabilityTypes } from '../../../../../data/Disabilities';
import { COMMON_SKILLS, QUALIFICATIONS } from '../../../../../data/jobRoleData';
import type { JobRole } from '../../../../../models/jobRole';

interface RequirementsCompensationTabProps {
	formData: Partial<JobRole>;
	handleNestedChange: (parent: string, field: string, value: any) => void;
}



const RequirementsCompensationTab: React.FC<RequirementsCompensationTabProps> = ({
	formData,
	handleNestedChange
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
							<Typography variant="awsFieldLabel">Required Qualifications</Typography>
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
								renderInput={(params) => <TextField {...params} placeholder="Select Education" {...commonTextFieldProps} />}
							/>
						</Box>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Key Technical Skills</Typography>
							<Autocomplete
								multiple
								freeSolo
								options={COMMON_SKILLS}
								value={formData.requirements?.skills || []}
								onChange={(_, v) => handleNestedChange('requirements', 'skills', v)}
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
								renderInput={(params) => <TextField {...params} placeholder="Type or select skills" {...commonTextFieldProps} />}
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
							<Typography variant="awsFieldLabel">Disability Types Preferred</Typography>
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
								renderInput={(params) => <TextField {...params} placeholder="Select Disability Preferences" {...commonTextFieldProps} />}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Stack>
	);
};

export default RequirementsCompensationTab;
