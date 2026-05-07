import React, { useState } from 'react';
import {
	Box,
	Typography,
	TextField,
	Autocomplete,
	Chip,
	useTheme,
	alpha,
} from '@mui/material';
import { Info as InfoIcon, Work as WorkIcon } from '@mui/icons-material';

interface JobRoleSearchProps {
	value: string[];
	onChange: (roles: string[]) => void;
	placeholder?: string;
}

/**
 * JobRoleSearch - Standalone component for professional job role selection.
 * Refactored to be a clean, free-text tag input for suggested job roles.
 */
const JobRoleSearch: React.FC<JobRoleSearchProps> = ({
	value,
	onChange,
	placeholder = "Type to add suggested job roles..."
}) => {
	const theme = useTheme();
	const [inputValue, setInputValue] = useState('');

	return (
		<Box>
			<Typography variant="awsFieldLabel">Suggested Job Roles / Recommendations</Typography>
			<Box sx={{
				display: 'flex',
				gap: 1.5,
				p: 2,
				bgcolor: alpha(theme.palette.primary.main, 0.05),
				border: '1px solid',
				borderColor: alpha(theme.palette.primary.main, 0.2),
				borderRadius: 1,
				mt: 1.5,
				mb: 2,
				alignItems: 'flex-start'
			}}>
				<InfoIcon sx={{ color: 'primary.main', mt: 0.25, fontSize: 20 }} />
				<Box>
					<Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 0.5 }}>Recommendation Instructions</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6, display: 'block' }}>
						• Type the job role name and press <strong>Enter</strong> to add it.<br />
						• Use formal designations (e.g., "Software Architect" instead of "Lead Dev").<br />
						• You can add multiple roles that are suitable for the candidate.
					</Typography>
				</Box>
			</Box>

			<Autocomplete
				multiple
				freeSolo
				options={[]} // No pre-defined options, entirely free-text for now
				inputValue={inputValue}
				onInputChange={(_, newInputValue) => {
					setInputValue(newInputValue);
				}}
				value={value}
				onChange={(_, newValue) => {
					onChange(newValue as string[]);
					setInputValue('');
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder={value.length === 0 ? placeholder : ""}
						size="small"
						fullWidth
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 1,
								bgcolor: 'background.paper',
								'& fieldset': { borderColor: 'divider' },
								'&:hover fieldset': { borderColor: theme.palette.primary.main },
								'&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
							}
						}}
					/>
				)}
				renderTags={(tagValue, getTagProps) =>
					tagValue.map((option, index: number) => (
						<Chip
							{...getTagProps({ index })}
							key={index}
							icon={<WorkIcon sx={{ fontSize: '1rem !important' }} />}
							label={option}
							sx={{
								borderRadius: 1,
								bgcolor: alpha(theme.palette.primary.main, 0.08),
								border: '1px solid',
								borderColor: alpha(theme.palette.primary.main, 0.2),
								color: 'primary.main',
								fontWeight: 600,
								height: 32,
								'& .MuiChip-deleteIcon': {
									color: 'primary.main',
									fontSize: 18,
									'&:hover': { color: 'error.main' }
								}
							}}
						/>
					))
				}
			/>
		</Box>
	);
};

export default JobRoleSearch;
