import React from 'react';
import {
	Grid,
	TextField,
	Autocomplete,
	Chip,
} from '@mui/material';
import { disabilityTypes } from '../../../../../data/Disabilities';

interface RequirementsCompensationTabProps {
	formData: any;
	handleNestedChange: (parent: string, field: string, value: any) => void;
}

const COMMON_SKILLS = [
	'Java', 'Python', 'JavaScript', 'React', 'Angular', 'Node.js', 'SQL', 'NoSQL',
	'C++', 'C#', '.NET', 'HTML/CSS', 'AWS', 'Azure', 'Data Analytics',
	'Soft Skills', 'Communication', 'Customer Support', 'BPO', 'Accounting', 
	'Tally', 'Excel', 'Data Entry', 'Project Management', 'Agile'
];

const RequirementsCompensationTab: React.FC<RequirementsCompensationTabProps> = ({
	formData,
	handleNestedChange
}) => {
	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12 }}>
				<Autocomplete
					multiple
					options={QUALIFICATIONS_LIST}
					value={formData.requirements?.qualifications || []}
					onChange={(_, newValue) => handleNestedChange('requirements', 'qualifications', newValue)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={index} />
						))
					}
					renderInput={(params) => <TextField {...params} label="Minimum Qualifications" size="small" required />}
				/>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<Autocomplete
					multiple
					freeSolo
					options={COMMON_SKILLS}
					value={formData.requirements?.skills || []}
					onChange={(_, newValue) => handleNestedChange('requirements', 'skills', newValue)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={index} />
						))
					}
					renderInput={(params) => <TextField {...params} label="Required Skills (Select or Type and press Enter)" size="small" placeholder="Select multiple skills" />}
				/>
			</Grid>
			<Grid size={{ xs: 12 }}>
				<Autocomplete
					multiple
					options={disabilityTypes}
					value={formData.requirements?.disability_preferred || []}
					onChange={(_, newValue) => handleNestedChange('requirements', 'disability_preferred', newValue)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" key={index} />
						))
					}
					renderInput={(params) => <TextField {...params} label="Disability Preferred" size="small" required />}
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

const QUALIFICATIONS_LIST = ['Any Graduation', 'B.E/B.Tech', 'B.Sc', 'B.A', 'B.Com', 'M.Tech', 'MCA', 'MBA', 'M.Sc', 'Diploma'];

export default RequirementsCompensationTab;
