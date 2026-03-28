import React, { memo } from 'react';
import {
	Box,
	Typography,
	Autocomplete,
	TextField,
	CircularProgress
} from '@mui/material';
import { type JobRole } from '../../../../models/jobRole';

interface JobRoleSelectionHeaderProps {
	jobRoles: JobRole[];
	selectedRole: JobRole | null;
	onRoleChange: (role: JobRole | null) => void;
	loading: boolean;
}

const JobRoleSelectionHeader: React.FC<JobRoleSelectionHeaderProps> = memo(({
	jobRoles,
	selectedRole,
	onRoleChange,
	loading
}) => {
	return (
		<Box sx={{ width: '100%', maxWidth: 320 }}>
			<Typography
				variant="caption"
				sx={{
					fontWeight: 800,
					color: '#aab7bd',
					display: 'block',
					mb: 0.75,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					fontSize: '0.65rem'
				}}
			>
				Select Resource / Target Role
			</Typography>
			<Autocomplete
				options={jobRoles}
				getOptionLabel={(option) => option.title}
				value={selectedRole}
				onChange={(_e, newValue) => onRoleChange(newValue)}
				loading={loading}
				size="small"
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder="Search job roles..."
						variant="outlined"
						sx={{
							'& .MuiOutlinedInput-root': {
								color: 'white',
								fontSize: '0.875rem',
								fontWeight: 500,
								bgcolor: 'rgba(255, 255, 255, 0.05)',
								borderRadius: '2px',
								transition: 'all 0.2s ease',
								height: 36,
								'& fieldset': {
									borderColor: 'rgba(255, 255, 255, 0.2)',
									borderWidth: '1px'
								},
								'&:hover fieldset': {
									borderColor: 'rgba(255, 255, 255, 0.4)'
								},
								'&.Mui-focused fieldset': {
									borderColor: '#ff9900',
									borderWidth: '1px'
								},
							},
							'& .MuiAutocomplete-input': {
								py: 0
							},
							'& .MuiInputBase-input::placeholder': {
								color: 'rgba(255, 255, 255, 0.4)',
								opacity: 1
							}
						}}
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<React.Fragment>
									{loading ? <CircularProgress color="inherit" size={16} /> : null}
									{params.InputProps.endAdornment}
								</React.Fragment>
							),
						}}
					/>
				)}
				sx={{
					width: '100%',
					'& .MuiAutocomplete-popupIndicator': { color: 'rgba(255, 255, 255, 0.6)' },
					'& .MuiAutocomplete-clearIndicator': { color: 'rgba(255, 255, 255, 0.6)' }
				}}
			/>
		</Box>
	);
});

JobRoleSelectionHeader.displayName = 'JobRoleSelectionHeader';

export default JobRoleSelectionHeader;
