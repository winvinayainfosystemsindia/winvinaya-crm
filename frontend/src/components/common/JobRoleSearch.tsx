import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
	Box,
	Typography,
	TextField,
	Autocomplete,
	CircularProgress,
	Chip
} from '@mui/material';
import { x0paService } from '../../services/x0paService';
import type { X0PAJob } from '../../services/x0paService';
import { awsStyles } from '../../theme/theme';

const PAGE_SIZE = 50;

interface JobRoleSearchProps {
	value: string[];
	onChange: (roles: string[]) => void;
	placeholder?: string;
}

/**
 * JobRoleSearch - Standalone component for professional job role selection.
 * Supports server-side search through the entire X0PA database with lazy loading.
 * - Typing searches X0PA's full dataset via the `searchKey` param.
 * - Scrolling to the bottom of the dropdown loads the next page of results.
 */
const JobRoleSearch: React.FC<JobRoleSearchProps> = ({
	value,
	onChange,
	placeholder = "Search by job name or company ID..."
}) => {
	const { fieldLabel } = awsStyles;

	const [inputValue, setInputValue] = useState('');
	const [jobs, setJobs] = useState<X0PAJob[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);
	const currentSearch = useRef('');
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchJobs = useCallback(async (searchKey: string, newOffset: number, append: boolean) => {
		setLoading(true);
		try {
			const result = await x0paService.getJobs({
				searchKey: searchKey || undefined,
				limit: PAGE_SIZE,
				offset: newOffset,
			});
			const fetched = result.jobs || [];
			setJobs(prev => append ? [...prev, ...fetched] : fetched);
			setHasMore(fetched.length === PAGE_SIZE);
			setOffset(newOffset + fetched.length);
		} catch (e) {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounced search when input changes
	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => {
			currentSearch.current = inputValue;
			setOffset(0);
			setHasMore(true);
			fetchJobs(inputValue, 0, false);
		}, 400);
		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [inputValue, fetchJobs]);

	// Load more when user scrolls to bottom of dropdown
	const handleListboxScroll = useCallback((event: React.UIEvent<HTMLUListElement>) => {
		const el = event.currentTarget;
		const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
		if (nearBottom && !loading && hasMore) {
			fetchJobs(currentSearch.current, offset, true);
		}
	}, [loading, hasMore, offset, fetchJobs]);

	const formatJobRole = (job: X0PAJob | any) => {
		if (typeof job === 'string') return job;
		if (!job) return '';
		// If it's a custom role (no company or status), just return the name
		if (!job.companyId && !job.statusName) return job.jobName || job.jobId || '';
		return `${job.jobName} - ${job.companyId} (${job.statusName})`;
	};

	const parseJobRole = (role: string) => {
		if (!role) return { jobId: '', jobName: '', companyId: '', statusName: '' } as X0PAJob;
		
		// Try to parse back from format: Name - Company (Status)
		if (role.includes(' - ') && role.includes(' (')) {
			const parts = role.split(' (');
			const main = parts[0] || '';
			const status = parts[1]?.replace(')', '') || '';
			const subparts = main.split(' - ');
			const name = subparts[0] || '';
			const company = subparts[1] || '';
			return { jobId: role, jobName: name, companyId: company, statusName: status } as X0PAJob;
		}
		
		// Else it's a custom role
		return { jobId: role, jobName: role, companyId: '', statusName: '' } as X0PAJob;
	};

	return (
		<Box>
			<Typography sx={fieldLabel}>Suitable Job Roles / Placement Recommendations</Typography>
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
				ListboxProps={{
					onScroll: handleListboxScroll as any,
					style: { maxHeight: 320 }
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
									bgcolor: option.statusName?.toLowerCase() === 'active' ? '#e7f4e4' : '#f2f3f3',
									color: option.statusName?.toLowerCase() === 'active' ? '#1d8102' : '#545b64',
									border: '1px solid',
									borderColor: option.statusName?.toLowerCase() === 'active' ? '#1d8102' : '#d5dbdb'
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
									{loading ? <CircularProgress color="inherit" size={16} /> : null}
									{params.InputProps.endAdornment}
								</React.Fragment>
							),
						}}
					/>
				)}
				renderTags={(tagValue, getTagProps) =>
					tagValue.map((option: X0PAJob | string, index: number) => {
						const roleObj = typeof option === 'string' ? parseJobRole(option) : option;
						const isActive = roleObj.statusName?.toLowerCase() === 'active';

						return (
							<Chip
								{...getTagProps({ index })}
								key={index}
								label={
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
											{roleObj.jobName}
										</Typography>
										{roleObj.statusName && (
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
										)}
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
			{!loading && hasMore && jobs.length > 0 && (
				<Typography sx={{ fontSize: '0.72rem', color: '#879596', mt: 0.5, textAlign: 'right' }}>
					Scroll down in the dropdown to load more results
				</Typography>
			)}
		</Box>
	);
};

export default JobRoleSearch;
