import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Stack,
	MenuItem,
	IconButton,
	Paper,
	Grid,
	Select,
	FormControl,
	InputLabel,
	Autocomplete,
	Chip,
	Box,
	Fade
} from '@mui/material';
import {
	Close as CloseIcon,
	Info as InfoIcon,
	School as SchoolIcon,
	Assignment as AssignmentIcon,
	Category as CategoryIcon,
	Language as LanguageIcon,
	People as PeopleIcon,
	History as HistoryIcon,
	Assessment as AssessmentIcon,
	LabelOutlined as TagIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchUsers } from '../../../../store/slices/userSlice';
import { settingsService } from '../../../../services/settingsService';
import type { TrainingBatch } from '../../../../models/training';
import { disabilityTypes } from '../../../../data/Disabilities';
import { COURSES } from '../../../../data/Courses';
import { TRAINING_MODES, DOMAINS } from '../../../../data/Training';

interface TrainingBatchFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<TrainingBatch>) => void;
	initialData?: TrainingBatch;
}

const TrainingBatchFormDialog: React.FC<TrainingBatchFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData
}) => {
	const dispatch = useAppDispatch();
	const { users: allUsers, loading: usersLoading } = useAppSelector((state) => state.users);

	const [formData, setFormData] = useState<Partial<TrainingBatch>>({
		batch_name: '',
		courses: [],
		disability_types: [],
		start_date: '',
		approx_close_date: '',
		domain: '',
		training_mode: '',
		duration: {
			start_date: '',
			end_date: '',
			weeks: 0,
			days: 0
		},
		status: 'planned',
		other: {}
	});

	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [tagsLoading, setTagsLoading] = useState(false);

	useEffect(() => {
		if (open) {
			if (allUsers.length === 0) {
				dispatch(fetchUsers({ skip: 0, limit: 1000 }));
			}
			loadTags();
		}
	}, [open, allUsers.length, dispatch]);

	const loadTags = async () => {
		setTagsLoading(true);
		try {
			const settings = await settingsService.getSystemSettings();
			const tagSetting = settings.find(s => s.key === 'TRAINING_BATCH_TAGS');
			if (tagSetting && tagSetting.value) {
				const tags = tagSetting.value.split(',')
					.map(t => t.trim())
					.filter(t => t.length > 0);
				setAvailableTags(tags);
			}
		} catch (error) {
			console.error('Failed to load training tags', error);
		} finally {
			setTagsLoading(false);
		}
	};

	useEffect(() => {
		if (open) {
			const today = new Date().toISOString().split('T')[0];
			const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

			if (initialData) {
				setFormData({
					...initialData,
					domain: initialData.domain || '',
					training_mode: initialData.training_mode || '',
					duration: initialData.duration ? {
						...initialData.duration,
						start_date: initialData.duration.start_date.split('T')[0],
						end_date: initialData.duration.end_date.split('T')[0]
					} : {
						start_date: today,
						end_date: thirtyDaysLater,
						weeks: 4,
						days: 2
					}
				});
			} else {
				setFormData({
					batch_name: '',
					disability_types: [],
					courses: [],
					start_date: today,
					approx_close_date: thirtyDaysLater,
					domain: '',
					training_mode: '',
					duration: {
						start_date: today,
						end_date: thirtyDaysLater,
						weeks: 4,
						days: 2
					},
					status: 'planned',
					other: {}
				});
			}
		}
	}, [initialData, open]);

	const handleChange = (field: keyof TrainingBatch, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleOtherChange = (key: string, value: any) => {
		setFormData((prev) => ({
			...prev,
			other: {
				...(prev.other || {}),
				[key]: value
			}
		}));
	};

	const calculateDuration = (start: string, end: string): { weeks: number; days: number; totalDays: number } => {
		if (!start || !end) return { weeks: 0, days: 0, totalDays: 0 };
		const s = new Date(start);
		const e = new Date(end);
		const diffMs = e.getTime() - s.getTime();
		const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
		if (totalDays <= 0) return { weeks: 0, days: 0, totalDays: 0 };

		return {
			weeks: Math.floor(totalDays / 7),
			days: totalDays % 7,
			totalDays
		};
	};

	const handleDurationChange = (field: string, value: string | number) => {
		setFormData((prev) => {
			const currentDuration = prev.duration || { start_date: '', end_date: '', weeks: 0, days: 0 };
			const newDuration = {
				...currentDuration,
				[field]: value
			};

			if (field === 'start_date' || field === 'end_date') {
				const start = field === 'start_date' ? (value as string) : newDuration.start_date;
				const end = field === 'end_date' ? (value as string) : newDuration.end_date;
				const dur = calculateDuration(start, end);
				newDuration.weeks = dur.weeks;
				newDuration.days = dur.days;
			}

			const topLevelUpdates: Partial<TrainingBatch> = {};
			if (field === 'start_date') topLevelUpdates.start_date = value as string;
			if (field === 'end_date') topLevelUpdates.approx_close_date = value as string;

			return { ...prev, duration: newDuration, ...topLevelUpdates };
		});
	};

	const handleSubmit = () => {
		onSubmit(formData);
		onClose();
	};

	const renderTrainerAssignment = () => {
		if (!formData.courses || formData.courses.length === 0) return null;

		return (
			<Box sx={{ mt: 3, mb: 2 }}>
				<Box sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					mb: 2,
					pb: 1,
					borderBottom: '1px solid #eaeded'
				}}>
					<PeopleIcon sx={{ color: '#0073bb', fontSize: 18 }} />
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
						Trainer Assignments
					</Typography>
				</Box>

				<Stack spacing={1.5}>
					{formData.courses.map((course: any, index: number) => {
						const courseName = typeof course === 'string' ? course : course.name;
						const trainerName = typeof course === 'string' ? '' : course.trainer;

						return (
							<Box
								key={index}
								sx={{
									display: 'grid',
									gridTemplateColumns: '1fr 1.5fr',
									alignItems: 'center',
									gap: 3,
									p: 1.5,
									borderRadius: '2px',
									bgcolor: '#f5f8fa',
									border: '1px solid #eaeded',
									'&:hover': { bgcolor: '#eff3f6', borderColor: '#d5dbdb' }
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Box sx={{
										width: 6,
										height: 6,
										borderRadius: '50%',
										bgcolor: '#0073bb'
									}} />
									<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e' }}>
										{courseName}
									</Typography>
								</Box>

								<Autocomplete
									size="small"
									loading={usersLoading}
									options={allUsers.map(t => t.full_name || t.username)}
									value={trainerName}
									onChange={(_e, val) => {
										const updatedCourses = [...(formData.courses || [])];
										updatedCourses[index] = {
											name: courseName,
											trainer: val || ''
										};
										handleChange('courses', updatedCourses);
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											placeholder="Select a trainer..."
											variant="outlined"
											size="small"
											sx={{
												bgcolor: '#ffffff',
												'& .MuiOutlinedInput-root': {
													borderRadius: '2px',
													fontSize: '0.8125rem'
												}
											}}
										/>
									)}
								/>
							</Box>
						);
					})}
				</Stack>
			</Box>
		);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			TransitionComponent={Fade}
			TransitionProps={{ timeout: 400 }}
			PaperProps={{
				sx: {
					borderRadius: '4px',
					boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
					minHeight: '60vh'
				}
			}}
		>
			<DialogTitle sx={{
				bgcolor: '#232f3e',
				color: '#ffffff',
				py: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<SchoolIcon />
					<Box>
						<Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
							{initialData ? 'Edit Training Batch' : 'Create New Training Batch'}
						</Typography>
						<Typography variant="caption" sx={{ color: '#879196', display: 'block' }}>
							{initialData ? `Batch ID: ${initialData.public_id}` : 'Configure a new learning path'}
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={onClose} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers sx={{ p: 4, bgcolor: '#fbfbfb' }}>
				<Box component="form" sx={{ mt: 1 }}>
					<Grid container spacing={4}>
						{/* Left Column - Core Config */}
						<Grid size={{ xs: 12, md: 7 }}>
							<Stack spacing={3}>
								<Box>
									<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
										<InfoIcon sx={{ color: '#879196', fontSize: 14 }} />
										<Typography variant="caption" color="textSecondary">Operational Details</Typography>
									</Stack>
									<TextField
										fullWidth
										label="Batch Display Name"
										name="batch_name"
										value={formData.batch_name}
										onChange={(e) => handleChange('batch_name', e.target.value)}
										placeholder="e.g. IT-JAN-2024-WIN"
										size="small"
										variant="outlined"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Box>

								<FormControl fullWidth size="small">
									<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
										<CategoryIcon sx={{ color: '#879196', fontSize: 14 }} />
										<Typography variant="caption" color="textSecondary">Target Candidate Category</Typography>
									</Stack>
									<Autocomplete
										multiple
										options={disabilityTypes}
										value={Array.isArray(formData.disability_types) ? formData.disability_types : []}
										onChange={(_e, val) => handleChange('disability_types', val)}
										isOptionEqualToValue={(option, value) => option === value}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder="Select Disability Types"
												size="small"
												variant="outlined"
												sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
											/>
										)}
										renderTags={(tagValue, getTagProps) =>
											tagValue.map((option, index) => {
												const { key, ...tagProps } = getTagProps({ index });
												return (
													<Chip
														key={key}
														label={option}
														{...tagProps}
														size="small"
														sx={{ borderRadius: '2px', bgcolor: '#e8f5e9', m: 0.5 }}
													/>
												);
											})
										}
									/>
								</FormControl>

								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<Box>
											<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
												<AssignmentIcon sx={{ color: '#879196', fontSize: 14 }} />
												<Typography variant="caption" color="textSecondary">Strategic Domain</Typography>
											</Stack>
											<FormControl fullWidth size="small">
												<InputLabel>Select Domain</InputLabel>
												<Select
													value={formData.domain || ''}
													label="Select Domain"
													onChange={(e) => handleChange('domain', e.target.value)}
													sx={{ borderRadius: '2px' }}
												>
													{DOMAINS.map(d => (
														<MenuItem key={d} value={d}>{d}</MenuItem>
													))}
												</Select>
											</FormControl>
										</Box>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<Box>
											<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
												<LanguageIcon sx={{ color: '#879196', fontSize: 14 }} />
												<Typography variant="caption" color="textSecondary">Delivery Channel</Typography>
											</Stack>
											<FormControl fullWidth size="small">
												<InputLabel>Training Mode</InputLabel>
												<Select
													value={formData.training_mode || ''}
													label="Training Mode"
													onChange={(e) => handleChange('training_mode', e.target.value)}
													sx={{ borderRadius: '2px' }}
												>
													{TRAINING_MODES.map(mode => (
														<MenuItem key={mode} value={mode}>{mode}</MenuItem>
													))}
												</Select>
											</FormControl>
										</Box>
									</Grid>
								</Grid>

								<Box>
									<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
										<TagIcon sx={{ color: '#879196', fontSize: 14 }} />
										<Typography variant="caption" color="textSecondary">Batch Tag / Category</Typography>
									</Stack>
									<FormControl fullWidth size="small">
										<InputLabel>Select Tag</InputLabel>
										<Select
											value={formData.other?.tag || ''}
											label="Select Tag"
											onChange={(e) => handleOtherChange('tag', e.target.value)}
											sx={{ borderRadius: '2px' }}
											disabled={tagsLoading}
										>
											<MenuItem value=""><em>None</em></MenuItem>
											{availableTags.map(tag => (
												<MenuItem key={tag} value={tag}>{tag}</MenuItem>
											))}
										</Select>
										{availableTags.length === 0 && !tagsLoading && (
											<Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
												No tags configured in System Settings.
											</Typography>
										)}
									</FormControl>
								</Box>

								<Box>
									<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
										<SchoolIcon sx={{ color: '#879196', fontSize: 14 }} />
										<Typography variant="caption" color="textSecondary">Associated Courses</Typography>
									</Stack>
									<Autocomplete
										multiple
										freeSolo
										options={COURSES}
										value={(formData.courses || []).map(c => typeof c === 'string' ? c : c.name)}
										onChange={(_e, val) => {
											const newCourses = val.map(courseName => {
												const existing = (formData.courses || []).find(c =>
													(typeof c === 'string' ? c : c.name) === courseName
												);
												return typeof existing === 'object' ? existing : { name: courseName, trainer: '' };
											});
											handleChange('courses', newCourses);
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Select Courses"
												size="small"
												placeholder="Add courses..."
												variant="outlined"
												sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
											/>
										)}
										renderTags={(tagValue, getTagProps) =>
											tagValue.map((option, index) => {
												const { key, ...tagProps } = getTagProps({ index });
												return (
													<Chip
														key={key}
														label={option}
														{...tagProps}
														size="small"
														sx={{ borderRadius: '2px', bgcolor: '#e1f5fe', m: 0.5 }}
													/>
												);
											})
										}
									/>
								</Box>

								<Box sx={{ mt: 1 }}>
									<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
										<AssessmentIcon sx={{ color: '#879196', fontSize: 14 }} />
										<Typography variant="caption" color="textSecondary">Batch Lifecycle Status</Typography>
									</Stack>
									<FormControl fullWidth size="small">
										<InputLabel>Operational Status</InputLabel>
										<Select
											value={formData.status}
											label="Operational Status"
											onChange={(e) => handleChange('status', e.target.value)}
											sx={{ borderRadius: '2px' }}
										>
											<MenuItem value="planned">Planned</MenuItem>
											<MenuItem value="running">In Progress</MenuItem>
											<MenuItem value="closed">Completed</MenuItem>
										</Select>
									</FormControl>
								</Box>
							</Stack>
						</Grid>

						{/* Right Column - Schedule & Trainers */}
						<Grid size={{ xs: 12, md: 5 }}>
							<Stack spacing={3}>
								<Paper variant="outlined" sx={{ p: 2, borderRadius: '2px', bgcolor: '#faffff', border: '1px solid #c9dff0' }}>
									<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
										<HistoryIcon sx={{ color: '#0073bb', fontSize: 20 }} />
										<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>Timeline Schedule</Typography>
									</Stack>
									<Stack spacing={2}>
										<Box>
											<Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>Inauguration Date</Typography>
											<TextField
												fullWidth
												type="date"
												size="small"
												value={formData.duration?.start_date || ''}
												onChange={(e) => handleDurationChange('start_date', e.target.value)}
												sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' }, bgcolor: 'white' }}
											/>
										</Box>
										<Box>
											<Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>Estimated Conclusion</Typography>
											<TextField
												fullWidth
												type="date"
												size="small"
												value={formData.duration?.end_date || ''}
												onChange={(e) => handleDurationChange('end_date', e.target.value)}
												sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' }, bgcolor: 'white' }}
											/>
										</Box>
										<Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '2px', border: '1px solid #eaeded', textAlign: 'center', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
											<Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>Calculated Duration</Typography>
											<Typography variant="h5" sx={{ fontWeight: 500, color: '#ec7211' }}>
												{formData.duration?.weeks || 0} Weeks
											</Typography>
										</Box>
									</Stack>
								</Paper>

								{renderTrainerAssignment()}
							</Stack>
						</Grid>
					</Grid>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3, bgcolor: '#ffffff', borderTop: '1px solid #eaeded' }}>
				<Button
					onClick={onClose}
					sx={{
						color: '#545b64',
						textTransform: 'none',
						fontWeight: 700,
						'&:hover': { bgcolor: '#eaeded' }
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={!formData.batch_name}
					sx={{
						bgcolor: '#ec7211',
						color: '#ffffff',
						textTransform: 'none',
						fontWeight: 700,
						px: 4,
						py: 1,
						borderRadius: '2px',
						boxShadow: 'none',
						'&:hover': { bgcolor: '#eb5f07', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
						'&.Mui-disabled': { bgcolor: '#f2f3f3', color: '#959ba1' }
					}}
				>
					{initialData ? 'Commit Changes' : 'Initialize Batch'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TrainingBatchFormDialog;
