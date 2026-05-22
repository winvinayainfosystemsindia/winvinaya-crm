import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
	Box,
	Typography,
	TextField,
	Autocomplete,
	Chip,
	useTheme,
	alpha,
	Stack,
	CircularProgress,
	Grid
} from '@mui/material';
import { 
	Info as InfoIcon, 
	Work as WorkIcon, 
	Business as BusinessIcon, 
	LocationOn as LocationIcon,
	Psychology as SkillsIcon,
	School as EducationIcon,
	AccessibilityNew as DisabilityIcon,
	CalendarToday as ExperienceIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJobRoles } from '../../store/slices/jobRoleSlice';
import type { JobRole } from '../../models/jobRole';

interface JobRoleSearchProps {
	value: string[];
	onChange: (roles: string[]) => void;
	placeholder?: string;
}

/**
 * JobRoleSearch - Standalone component for professional job role selection.
 * Integrated with the JobRole Redux slice for state management.
 */
const JobRoleSearch: React.FC<JobRoleSearchProps> = ({
	value,
	onChange,
	placeholder = "Search by job title or company..."
}) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const [inputValue, setInputValue] = useState('');
	
	// Get job roles from Redux store
	const { list: options, loading } = useAppSelector((state) => state.jobRoles);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const loadJobRoles = useCallback((search: string) => {
		dispatch(fetchJobRoles({
			search: search || undefined,
			limit: search ? 50 : 200, // Fetch up to 200 on mount/empty to get full metadata for existing recommendations
			skip: 0
		}));
	}, [dispatch]);

	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		
		// If user typed the first character, fetch immediately for responsiveness
		if (inputValue.length === 1) {
			loadJobRoles(inputValue);
			return;
		}

		debounceTimer.current = setTimeout(() => {
			loadJobRoles(inputValue);
		}, 300);

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [inputValue, loadJobRoles]);

	const formatValue = (val: string | JobRole) => {
		if (typeof val === 'string') return val;
		return val.title;
	};

	// Map selected strings to full JobRole metadata where available in options
	const selectedJobRolesDetails = value.map(title => {
		const matchedJob = options.find(j => j.title.toLowerCase() === title.toLowerCase());
		return matchedJob || { title } as Partial<JobRole>;
	});

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
						• Type to search our internal <strong>Placement Job Roles</strong>.<br />
						• Select a role from the list or press <strong>Enter</strong> to add a custom recommendation.<br />
						• Use formal designations (e.g., "Software Architect" instead of "Lead Dev").
					</Typography>
				</Box>
			</Box>

			<Autocomplete
				multiple
				freeSolo
				openOnFocus
				filterOptions={(x) => x}
				options={options}
				loading={loading}
				getOptionLabel={formatValue}
				inputValue={inputValue}
				onInputChange={(_, newInputValue) => {
					setInputValue(newInputValue);
				}}
				value={value}
				onChange={(_, newValue) => {
					const finalValue = newValue.map(v => typeof v === 'string' ? v : v.title);
					onChange(finalValue);
					setInputValue('');
				}}
				renderOption={(props, option) => {
					const { key, ...optionProps } = props;
					const job = option as JobRole;
					
					// Safely parse eligibility stats
					const skills = job.requirements?.skills || [];
					const disabilities = job.requirements?.disability_preferred || [];
					const qualifications = job.requirements?.qualifications || [];
					
					return (
						<li {...optionProps} key={key}>
							<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 1, px: 0.5 }}>
								<Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
									{job.title}
								</Typography>
								<Stack direction="row" spacing={2} sx={{ mt: 0.5, mb: 1 }}>
									{job.company && (
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
											<BusinessIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
											<Typography variant="caption" color="text.secondary">
												{job.company.name}
											</Typography>
										</Box>
									)}
									{job.location?.cities && job.location.cities.length > 0 && (
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
											<LocationIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
											<Typography variant="caption" color="text.secondary">
												{job.location.cities.join(', ')}
											</Typography>
										</Box>
									)}
								</Stack>
								
								{/* Small preview of requirements/eligibility inside search dropdown */}
								<Stack spacing={0.5} sx={{ pl: 1.5, borderLeft: '2px solid', borderColor: 'divider' }}>
									{skills.length > 0 && (
										<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
											<strong>Skills:</strong> {skills.join(', ')}
										</Typography>
									)}
									{(disabilities.length > 0 || qualifications.length > 0) && (
										<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
											{disabilities.length > 0 && (
												<span><strong>Disability:</strong> {disabilities.join(', ')} </span>
											)}
											{qualifications.length > 0 && (
												<span><strong>Education:</strong> {qualifications.join(', ')}</span>
											)}
										</Typography>
									)}
								</Stack>
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
						onFocus={() => {
							if (options.length === 0) loadJobRoles(inputValue);
						}}
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: 1,
								bgcolor: 'background.paper',
								'& fieldset': { borderColor: 'divider' },
								'&:hover fieldset': { borderColor: theme.palette.primary.main },
								'&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
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
						const label = typeof option === 'string' ? option : option.title;
						return (
							<Chip
								{...getTagProps({ index })}
								key={index}
								icon={<WorkIcon sx={{ fontSize: '1rem !important' }} />}
								label={label}
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
						);
					})
				}
			/>

			{/* Detailed Job Role Requirements / Eligibility Display */}
			{selectedJobRolesDetails.length > 0 && (
				<Box sx={{ mt: 3 }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2 }}>
						Job Role Details & Eligibility Criteria
					</Typography>
					<Stack spacing={2}>
						{selectedJobRolesDetails.map((job, idx) => {
							const hasFullDetails = 'public_id' in job;
							
							return (
								<Box
									key={idx}
									sx={{
										p: 2.5,
										borderRadius: 1.5,
										bgcolor: 'background.paper',
										border: '1px solid',
										borderColor: hasFullDetails ? alpha(theme.palette.primary.main, 0.25) : 'divider',
										boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
										position: 'relative',
										overflow: 'hidden',
										'&:hover': {
											borderColor: 'primary.main',
											boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
											transition: 'all 0.2s ease-in-out'
										}
									}}
								>
									{/* Top accent line if full details exist */}
									{hasFullDetails && (
										<Box sx={{
											position: 'absolute',
											top: 0,
											left: 0,
											right: 0,
											height: 3,
											bgcolor: 'primary.main'
										}} />
									)}
									
									<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
										<Box>
											<Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main' }}>
												{job.title}
											</Typography>
											{hasFullDetails && (
												<Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
													{job.company && (
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
															<BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
															<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
																{job.company.name}
															</Typography>
														</Box>
													)}
													{job.location?.cities && job.location.cities.length > 0 && (
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
															<LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
															<Typography variant="caption" color="text.secondary">
																{job.location.cities.join(', ')}
															</Typography>
														</Box>
													)}
												</Stack>
											)}
										</Box>
										
										<Chip
											label="Remove Recommendation"
											size="small"
											variant="outlined"
											color="error"
											onClick={() => {
												const newValue = value.filter(v => v.toLowerCase() !== job.title?.toLowerCase());
												onChange(newValue);
											}}
											sx={{ 
												fontSize: '0.7rem', 
												height: 22,
												borderRadius: 1,
												cursor: 'pointer',
												'&:hover': {
													bgcolor: alpha(theme.palette.error.main, 0.05)
												}
											}}
										/>
									</Stack>

									{hasFullDetails ? (
										<Stack spacing={2} sx={{ mt: 2 }}>
											{/* Required Skills */}
											{job.requirements?.skills && job.requirements.skills.length > 0 && (
												<Box>
													<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
														<SkillsIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
														<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
															REQUIRED SKILLS
														</Typography>
													</Stack>
													<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pl: 3.25 }}>
														{job.requirements.skills.map((s, sIdx) => (
															<Chip
																key={sIdx}
																label={s}
																size="small"
																variant="outlined"
																sx={{
																	fontSize: '0.7rem',
																	height: 20,
																	borderRadius: 0.5,
																	bgcolor: alpha(theme.palette.secondary.main, 0.02),
																	borderColor: alpha(theme.palette.secondary.main, 0.2),
																	color: 'secondary.main',
																	fontWeight: 600
																}}
															/>
														))}
													</Box>
												</Box>
											)}

											{/* Eligibility Grid */}
											<Grid container spacing={2} sx={{ pl: 3.25 }}>
												{/* Disabilities Preferred */}
												{job.requirements?.disability_preferred && job.requirements.disability_preferred.length > 0 && (
													<Grid size={{ xs: 12, sm: 6 }}>
														<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
															<DisabilityIcon sx={{ fontSize: 16, color: 'success.main' }} />
															<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
																PREFERRED DISABILITY
															</Typography>
														</Stack>
														<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
															{job.requirements.disability_preferred.map((d, dIdx) => (
																<Chip
																	key={dIdx}
																	label={d}
																	size="small"
																	sx={{
																		fontSize: '0.65rem',
																		height: 18,
																		borderRadius: 0.5,
																		bgcolor: alpha(theme.palette.success.main, 0.08),
																		color: 'success.dark',
																		fontWeight: 700
																	}}
																/>
															))}
														</Box>
													</Grid>
												)}

												{/* Qualifications / Education */}
												{job.requirements?.qualifications && job.requirements.qualifications.length > 0 && (
													<Grid size={{ xs: 12, sm: 6 }}>
														<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
															<EducationIcon sx={{ fontSize: 16, color: 'warning.main' }} />
															<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
																EDUCATION / QUALIFICATION
															</Typography>
														</Stack>
														<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
															{job.requirements.qualifications.map((q, qIdx) => (
																<Chip
																	key={qIdx}
																	label={q}
																	size="small"
																	sx={{
																		fontSize: '0.65rem',
																		height: 18,
																		borderRadius: 0.5,
																		bgcolor: alpha(theme.palette.warning.main, 0.08),
																		color: 'warning.dark',
																		fontWeight: 700
																	}}
																/>
															))}
														</Box>
													</Grid>
												)}

												{/* Experience Range */}
												{job.experience && (job.experience.min !== undefined || job.experience.max !== undefined) && (
													<Grid size={{ xs: 12, sm: 6 }}>
														<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
															<ExperienceIcon sx={{ fontSize: 16, color: 'info.main' }} />
															<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
																EXPERIENCE REQUIRED
															</Typography>
														</Stack>
														<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', pl: 0.25 }}>
															{job.experience.min !== undefined && job.experience.max !== undefined ? (
																`${job.experience.min} - ${job.experience.max} years`
															) : job.experience.min !== undefined ? (
																`Minimum ${job.experience.min} years`
															) : (
																`Maximum ${job.experience.max} years`
															)}
														</Typography>
													</Grid>
												)}
											</Grid>
										</Stack>
									) : (
										<Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: 'text.disabled', mt: 1 }}>
											Custom recommendation (no internal job role profile matched)
										</Typography>
									)}
								</Box>
							);
						})}
					</Stack>
				</Box>
			)}
		</Box>
	);
};

export default JobRoleSearch;
