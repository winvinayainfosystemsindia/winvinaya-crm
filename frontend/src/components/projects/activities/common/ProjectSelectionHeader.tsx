import React, { memo } from 'react';
import {
	Box,
	Typography,
	Autocomplete,
	TextField
} from '@mui/material';
import type { DSRProject } from '../../../../models/dsr';

interface ProjectSelectionHeaderProps {
	projects: DSRProject[];
	selectedProject: DSRProject | null;
	onProjectChange: (project: DSRProject | null) => void;
}

const ProjectSelectionHeader: React.FC<ProjectSelectionHeaderProps> = memo(({
	projects,
	selectedProject,
	onProjectChange,
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
				Select Project
			</Typography>
			<Autocomplete
				options={projects}
				getOptionLabel={(option) => option.name}
				value={selectedProject}
				onChange={(_e, newValue) => onProjectChange(newValue)}
				size="small"
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder="Search projects..."
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

ProjectSelectionHeader.displayName = 'ProjectSelectionHeader';

export default ProjectSelectionHeader;
