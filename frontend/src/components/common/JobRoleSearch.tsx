import React from 'react';
import {
	Box,
	Typography,
	TextField,
	Autocomplete,
	CircularProgress,
	Chip
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchX0PAJobs } from '../../store/slices/x0paSlice';
import type { X0PAJob } from '../../services/x0paService';
import { awsStyles } from '../../theme/theme';

interface JobRoleSearchProps {
	value: string[];
	onChange: (roles: string[]) => void;
	placeholder?: string;
}

/**
 * JobRoleSearch - Standalone component for professional job role selection.
 * Handles high-performance searching using X0PA API and displays selections with enterprise-grade chips.
 */
const JobRoleSearch: React.FC<JobRoleSearchProps> = ({ 
	value, 
	onChange, 
	placeholder = "Search by job name or company ID..." 
}) => {
	const dispatch = useAppDispatch();
	const { jobs: jobOptions, loading: loadingJobs } = useAppSelector((state) => state.x0pa);
	const [inputValue, setInputValue] = React.useState('');
	const { fieldLabel } = awsStyles;

	// Initial load and debounced search
	React.useEffect(() => {
		const timer = setTimeout(() => {
			dispatch(fetchX0PAJobs({ searchKey: inputValue, limit: 100 }));
		}, 500);
		return () => clearTimeout(timer);
	}, [dispatch, inputValue]);

	const formatJobRole = (job: X0PAJob | any) => {
		if (typeof job === 'string') return job;
		if (!job) return '';
		return `${job.jobName} - ${job.companyId} (${job.statusName})`;
	};

	const parseJobRole = (role: string) => {
		const parts = role.split(' (');
		const main = parts[0] || '';
		const status = parts[1]?.replace(')', '') || '';
		const subparts = main.split(' - ');
		const name = subparts[0] || '';
		const company = subparts[1] || '';
		const id = role; // Use full string as ID for consistency
		return { jobId: id, jobName: name, companyId: company, statusName: status } as X0PAJob;
	};

	return (
		<Box>
			<Typography sx={fieldLabel}>Suitable Job Roles / Placement Recommendations</Typography>
			<Autocomplete
				multiple
				freeSolo
				options={jobOptions || []}
				loading={loadingJobs}
				filterOptions={(x) => x}
				getOptionLabel={formatJobRole}
				inputValue={inputValue}
				onInputChange={(_, newInputValue) => {
					setInputValue(newInputValue);
				}}
				isOptionEqualToValue={(option, val) => {
					const optStr = typeof option === 'string' ? option : formatJobRole(option);
					const valStr = typeof val === 'string' ? val : formatJobRole(val);
					return optStr === valStr;
				}}
				value={value.map(parseJobRole)}
				onChange={(_, newValue) => {
					const roles = newValue.map(v => typeof v === 'string' ? v : formatJobRole(v));
					onChange(roles);
					setInputValue('');
				}}
				renderOption={(props, option) => (
					<li {...props} key={option.jobId}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', py: 0.5 }}>
							<Box sx={{ display: 'flex', flexDirection: 'column' }}>
								<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#232f3e' }}>
									{option.jobName}
								</Typography>
								<Typography sx={{ fontSize: '0.75rem', color: '#545b64' }}>
									Job ID: {option.jobId} {option.companyId ? `| Company: ${option.companyId}` : ''}
								</Typography>
							</Box>
							<Chip
								label={option.statusName}
								size="small"
								sx={{
									fontSize: '0.65rem',
									fontWeight: 700,
									height: 20,
									borderRadius: '2px',
									bgcolor: option.statusName.toLowerCase() === 'active' ? '#e7f4e4' : '#f2f3f3',
									color: option.statusName.toLowerCase() === 'active' ? '#1d8102' : '#545b64',
									border: '1px solid',
									borderColor: option.statusName.toLowerCase() === 'active' ? '#1d8102' : '#d5dbdb'
								}}
							/>
						</Box>
					</li>
				)}
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder={value.length === 0 ? placeholder : ""}
						size="small"
						fullWidth
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: '2px',
								bgcolor: '#fcfcfc',
								'& fieldset': { borderColor: '#d5dbdb' },
								'&:hover fieldset': { borderColor: '#879596' },
								'&.Mui-focused fieldset': { borderColor: '#ec7211' }
							}
						}}
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<React.Fragment>
									{loadingJobs ? <CircularProgress color="inherit" size={16} /> : null}
									{params.InputProps.endAdornment}
								</React.Fragment>
							),
						}}
					/>
				)}
				renderTags={(tagValue, getTagProps) =>
					tagValue.map((option: X0PAJob | string, index: number) => {
						const roleObj = typeof option === 'string' ? parseJobRole(option) : option;
						const isActive = roleObj.statusName.toLowerCase() === 'active';

						return (
							<Chip
								{...getTagProps({ index })}
								key={index}
								label={
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
											{roleObj.jobName}
										</Typography>
										<Box
											sx={{
												px: 0.75,
												py: 0.1,
												bgcolor: isActive ? '#1d8102' : '#545b64',
												color: '#ffffff',
												borderRadius: '2px',
												fontSize: '0.65rem',
												fontWeight: 700,
												textTransform: 'uppercase'
											}}
										>
											{roleObj.statusName}
										</Box>
									</Box>
								}
								sx={{
									borderRadius: '2px',
									bgcolor: '#ffffff',
									color: '#232f3e',
									border: '1px solid #d5dbdb',
									height: 28,
									'& .MuiChip-deleteIcon': {
										color: '#545b64',
										'&:hover': { color: '#d91d11' }
									}
								}}
							/>
						);
					})
				}
				sx={{ 
					'& .MuiAutocomplete-listbox': { 
						p: 1,
						'& .MuiAutocomplete-option': {
							borderRadius: '2px',
							'&[aria-selected="true"]': { bgcolor: '#f1faff' },
							'&:hover': { bgcolor: '#f2f3f3' }
						}
					} 
				}}
			/>
		</Box>
	);
};

export default JobRoleSearch;
