import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
	Box,
	Typography,
	TextField,
	Autocomplete,
	CircularProgress,
	Chip,
	useTheme,
	alpha,
	Stack
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchX0PAJobs } from '../../store/slices/x0paSlice';
import type { X0PAJob } from '../../services/x0paService';

const PAGE_SIZE = 50;

interface JobRoleSearchProps {
	value: string[];
	onChange: (roles: string[]) => void;
	placeholder?: string;
}

/**
 * JobRoleSearch - Standalone component for professional job role selection.
 * Supports server-side search through the entire X0PA database with lazy loading.
 * Integrated with x0paSlice for store-based state management.
 */
const JobRoleSearch: React.FC<JobRoleSearchProps> = ({
	value,
	onChange,
	placeholder = "Search by job name or company ID..."
}) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const [inputValue, setInputValue] = useState('');
	const { jobs, loading } = useAppSelector((state) => state.x0pa);
	
	const currentSearch = useRef('');
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const loadJobs = useCallback((searchKey: string, offset: number) => {
		dispatch(fetchX0PAJobs({
			searchKey: searchKey || undefined,
			limit: PAGE_SIZE,
			offset: offset,
		}));
	}, [dispatch]);

	// Debounced search when input changes
	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => {
			currentSearch.current = inputValue;
			loadJobs(inputValue, 0);
		}, 400);
		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [inputValue, loadJobs]);

	const formatJobRole = (job: X0PAJob | any) => {
		if (typeof job === 'string') return job;
		if (!job) return '';
		if (!job.companyId && !job.statusName) return job.jobName || job.jobId || '';
		return `${job.jobName} - ${job.companyId} (${job.statusName})`;
	};

	const parseJobRole = (role: string) => {
		if (!role) return { jobId: '', jobName: '', companyId: '', statusName: '' } as X0PAJob;

		if (role.includes(' - ') && role.includes(' (')) {
			const parts = role.split(' (');
			const main = parts[0] || '';
			const status = parts[1]?.replace(')', '') || '';
			const subparts = main.split(' - ');
			const name = subparts[0] || '';
			const company = subparts[1] || '';
			return { jobId: role, jobName: name, companyId: company, statusName: status } as X0PAJob;
		}

		return { jobId: role, jobName: role, companyId: '', statusName: '' } as X0PAJob;
	};

	return (
		<Box>
			<Typography variant="awsFieldLabel">Suitable X0PA Job Roles / Suggested Job Roles</Typography>
			<Box sx={{
				display: 'flex',
				gap: 1.5,
				p: 2,
				bgcolor: alpha(theme.palette.info.main, 0.05),
				border: '1px solid',
				borderColor: 'info.main',
				borderRadius: 0.5,
				mt: 1.5,
				mb: 2,
				alignItems: 'flex-start'
			}}>
				<InfoIcon sx={{ color: 'info.main', mt: 0.25, fontSize: 20 }} />
				<Box>
					<Typography variant="subtitle2" sx={{ color: 'info.main', fontWeight: 700, mb: 0.5 }}>Matching Instructions</Typography>
					<Typography variant="caption" sx={{ color: 'info.main', lineHeight: 1.6, display: 'block' }}>
						• Type to search the global X0PA registry.<br />
						• Press <strong>Enter</strong> to add a custom recommendation if not found.<br />
						• Use formal designations (e.g., "Software Architect" instead of "Lead Dev").
					</Typography>
				</Box>
			</Box>

			<Autocomplete
				multiple
				freeSolo
				options={jobs}
				loading={loading}
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
				renderOption={(props, option) => {
					const { key, ...optionProps } = props;
					const isActive = option.statusName?.toLowerCase() === 'active';
					return (
						<li {...optionProps} key={key}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', py: 0.5 }}>
								<Stack spacing={0.25}>
									<Typography variant="body2" sx={{ fontWeight: 700 }}>
										{option.jobName}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										ID: {option.jobId} {option.companyId ? `| Org: ${option.companyId}` : ''}
									</Typography>
								</Stack>
								<Chip
									label={option.statusName}
									size="small"
									sx={{
										fontSize: '0.65rem',
										fontWeight: 700,
										height: 18,
										borderRadius: 0.25,
										bgcolor: isActive ? alpha(theme.palette.success.main, 0.1) : 'action.hover',
										color: isActive ? 'success.main' : 'text.secondary',
										border: '1px solid',
										borderColor: isActive ? 'success.main' : 'divider'
									}}
								/>
							</Box>
						</li>
					);
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder={value.length === 0 ? placeholder : ""}
						size="small"
						fullWidth
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 0.5,
								bgcolor: 'background.paper',
								'& fieldset': { borderColor: 'divider' },
								'&:hover fieldset': { borderColor: 'text.secondary' },
								'&.Mui-focused fieldset': { borderColor: 'primary.main' }
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
				renderTags={(tagValue, getTagProps) =>
					tagValue.map((option, index: number) => {
						const roleObj = typeof option === 'string' ? parseJobRole(option) : option;
						const isActive = roleObj.statusName?.toLowerCase() === 'active';

						return (
							<Chip
								{...getTagProps({ index })}
								key={index}
								label={
									<Stack direction="row" spacing={1} alignItems="center">
										<Typography variant="caption" sx={{ fontWeight: 700 }}>
											{roleObj.jobName}
										</Typography>
										{roleObj.statusName && (
											<Box
												sx={{
													px: 0.5,
													py: 0.1,
													bgcolor: isActive ? 'success.main' : 'text.disabled',
													color: 'common.white',
													borderRadius: 0.25,
													fontSize: '0.6rem',
													fontWeight: 900,
													textTransform: 'uppercase'
												}}
											>
												{roleObj.statusName}
											</Box>
										)}
									</Stack>
								}
								sx={{
									borderRadius: 0.5,
									bgcolor: 'background.paper',
									border: '1px solid',
									borderColor: 'divider',
									height: 28,
									'& .MuiChip-deleteIcon': {
										color: 'text.secondary',
										fontSize: 18,
										'&:hover': { color: 'error.main' }
									}
								}}
							/>
						);
					})
				}
			/>
		</Box>
	);
};

export default JobRoleSearch;
