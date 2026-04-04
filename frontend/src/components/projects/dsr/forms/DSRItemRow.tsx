import React from 'react';
import {
	Autocomplete,
	TextField,
	Typography,
	IconButton,
	Box,
	useTheme,
	useMediaQuery
} from '@mui/material';
import {
	Delete as DeleteIcon,
	EditNote as EditIcon,
	AccessTime as TimeIcon,
	Description as DescriptionIcon,
	Work as ProjectIcon
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import type { DSRItem, DSRProject, DSRActivity, DSRActivityType } from '../../../../models/dsr';
import { GENERAL_PROJECT_ID } from '../hooks/useDSRSubmission';

interface DSRItemRowProps {
	index: number;
	item: Partial<DSRItem>;
	projects: DSRProject[];
	activityTypes: DSRActivityType[];
	activities: DSRActivity[];
	loading: boolean;
	onRowChange: (index: number, field: keyof DSRItem, value: any) => void;
	onRemoveRow: (index: number) => void;
	isDeleteDisabled: boolean;
	readOnly?: boolean;
	reportDate: string;
}

const OTHER_ID = '__other__';

const OTHER_ACTIVITY: Partial<DSRActivity> = {
	public_id: OTHER_ID,
	name: 'Other (Specify...)'
};

const DSRItemRow: React.FC<DSRItemRowProps> = ({
	index,
	item,
	projects,
	activityTypes,
	activities,
	onRowChange,
	onRemoveRow,
	isDeleteDisabled,
	readOnly = false,
	reportDate
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));

	const isCategoryProject = item.project_public_id?.startsWith('category:');
	const categoryName = isCategoryProject ? item.project_public_id?.split(':')[1] : null;

	const activityOptions = React.useMemo(() => {
		if (isCategoryProject) {
			return activityTypes.filter(at => at.category === categoryName);
		}
		const filtered = activities.filter(a => {
			if (a.public_id === item.activity_public_id) return true;
			if (!a.is_active || a.status === 'cancelled') return false;
			if (a.start_date && a.start_date > reportDate) return false;
			if (a.status === 'completed') {
				const endDate = a.actual_end_date || a.end_date;
				if (endDate && reportDate > endDate) return false;
			}
			return true;
		});
		return [...filtered, OTHER_ACTIVITY as DSRActivity];
	}, [activities, reportDate, item.activity_public_id, isCategoryProject, categoryName, activityTypes]);

	const selectedProject = React.useMemo(() => {
		if (!item.project_public_id) return null;
		if (item.project_public_id === GENERAL_PROJECT_ID) {
			const project = projects.find(p => p.public_id === GENERAL_PROJECT_ID);
			if (project) return project;
			return { public_id: GENERAL_PROJECT_ID, name: 'General / Internal Work' } as DSRProject;
		}
		return projects.find(p => p.public_id === item.project_public_id) || null;
	}, [item.project_public_id, projects]);

	const isOtherActivity = (item.activity_name_other !== undefined && item.activity_name_other !== null);
	const isGeneralProject = item.project_public_id === GENERAL_PROJECT_ID;

	const selectedActivityOption = React.useMemo(() => {
		if (isCategoryProject) {
			return activityOptions.find(at => at.name === item.activity_type_name) || null;
		}
		if (isOtherActivity) return OTHER_ACTIVITY;
		return activities.find(a => a.public_id === item.activity_public_id) || null;
	}, [isCategoryProject, isOtherActivity, item.activity_type_name, item.activity_public_id, activityOptions, activities]);

	const renderMobileField = (label: string, icon: React.ReactNode, content: React.ReactNode) => (
		<Box sx={{ mb: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
				<Box sx={{ color: '#ec7211', display: 'flex', alignItems: 'center' }}>{icon}</Box>
				<Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
					{label}
				</Typography>
			</Box>
			{content}
		</Box>
	);

	if (isMobile) {
		return (
			<Box sx={{ 
				p: 2, 
				position: 'relative',
				'&:hover': { bgcolor: '#fafafa' },
				borderBottom: '1px solid #f3f4f6'
			}}>
				{!readOnly && (
					<IconButton
						onClick={() => onRemoveRow(index)}
						disabled={isDeleteDisabled}
						size="small"
						sx={{
							position: 'absolute',
							top: 8,
							right: 8,
							color: '#9ca3af',
							'&:hover': { color: '#ef4444', bgcolor: '#fef2f2' }
						}}
					>
						<DeleteIcon fontSize="small" />
					</IconButton>
				)}

				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
					{renderMobileField('Project', <ProjectIcon sx={{ fontSize: 16 }} />, 
						readOnly ? (
							<Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedProject?.name || item.project_name || '-'}</Typography>
						) : (
							<Autocomplete
								options={projects}
								getOptionLabel={(option) => option.name || ''}
								groupBy={(option: any) => option.group}
								value={selectedProject}
								onChange={(_, val) => onRowChange(index, 'project_public_id', val?.public_id || null)}
								renderInput={(params) => <TextField {...params} size="small" placeholder="Project" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }} />}
							/>
						)
					)}

					{renderMobileField('Activity', <EditIcon sx={{ fontSize: 16 }} />, 
						isGeneralProject ? (
							<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>N/A</Typography>
						) : readOnly ? (
							<Typography variant="body2">{isOtherActivity ? item.activity_name_other : (selectedActivityOption?.name || '-')}</Typography>
						) : (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Autocomplete
									options={activityOptions as any[]}
									getOptionLabel={(option) => option.name || ''}
									value={selectedActivityOption as any}
									onChange={(_, val: any) => {
										if (isCategoryProject) {
											onRowChange(index, 'activity_type_name', val?.name || null);
											onRowChange(index, 'activity_public_id', null);
											onRowChange(index, 'activity_name_other', undefined);
										} else {
											if (val?.public_id === OTHER_ID) {
												onRowChange(index, 'activity_public_id', null);
												onRowChange(index, 'activity_name_other', '');
											} else {
												onRowChange(index, 'activity_public_id', val?.public_id || null);
												onRowChange(index, 'activity_name_other', undefined);
											}
										}
									}}
									renderInput={(params) => <TextField {...params} size="small" placeholder="Activity" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }} />}
								/>
								{isOtherActivity && (
									<TextField
										size="small"
										fullWidth
										placeholder="Specify..."
										value={item.activity_name_other || ''}
										onChange={(e) => onRowChange(index, 'activity_name_other', e.target.value)}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: '#fffbeb' } }}
									/>
								)}
							</Box>
						)
					)}
				</Box>

				{renderMobileField('Description', <DescriptionIcon sx={{ fontSize: 16 }} />, 
					readOnly ? (
						<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{item.description || '-'}</Typography>
					) : (
						<TextField
							fullWidth
							size="small"
							multiline
							maxRows={4}
							placeholder="What did you do?"
							value={item.description}
							onChange={(e) => onRowChange(index, 'description', e.target.value)}
							sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
						/>
					)
				)}

				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, alignItems: 'end' }}>
					{renderMobileField('Start', <TimeIcon sx={{ fontSize: 16 }} />, 
						readOnly ? (
							<Typography variant="body2">{item.start_time || '-'}</Typography>
						) : (
							<TimePicker
								slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '6px' } } } }}
								value={item.start_time ? dayjs(`2024-01-01T${item.start_time}`) : null}
								onChange={(v) => v && onRowChange(index, 'start_time', dayjs(v).format('HH:mm'))}
							/>
						)
					)}
					{renderMobileField('End', <TimeIcon sx={{ fontSize: 16 }} />, 
						readOnly ? (
							<Typography variant="body2">{item.end_time || '-'}</Typography>
						) : (
							<TimePicker
								slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '6px' } } } }}
								value={item.end_time ? dayjs(`2024-01-01T${item.end_time}`) : null}
								onChange={(v) => v && onRowChange(index, 'end_time', dayjs(v).format('HH:mm'))}
							/>
						)
					)}
					<Box sx={{ mb: 2, textAlign: 'center' }}>
						<Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', display: 'block', mb: 0.5 }}>HRS</Typography>
						<Typography variant="body2" sx={{ fontWeight: 800, color: '#111827' }}>{item.hours?.toFixed(1) || '0.0'}</Typography>
					</Box>
				</Box>
			</Box>
		);
	}

	// Desktop View
	return (
		<Box sx={{ 
			display: 'flex', 
			px: 2, 
			py: 1.5, 
			gap: 2, 
			alignItems: 'flex-start',
			transition: 'background-color 0.2s',
			'&:hover': { bgcolor: '#fafafa' }
		}}>
			{/* Project */}
			<Box sx={{ width: '20%' }}>
				{readOnly ? (
					<Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', py: 1 }}>
						{selectedProject?.name || item.project_name || '-'}
					</Typography>
				) : (
					<Autocomplete
						options={projects}
						getOptionLabel={(option) => option.name || ''}
						groupBy={(option: any) => option.group}
						value={selectedProject}
						onChange={(_, val) => onRowChange(index, 'project_public_id', val?.public_id || null)}
						isOptionEqualToValue={(option, value) => option.public_id === value.public_id}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' }, '& .MuiOutlinedInput-input': { fontSize: '0.85rem' } }}
						renderInput={(params) => <TextField {...params} size="small" placeholder="Project" />}
					/>
				)}
			</Box>

			{/* Activity */}
			<Box sx={{ width: '20%' }}>
				{isGeneralProject ? (
					!readOnly && (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.75rem' }}>
							N/A
						</Typography>
					)
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{readOnly ? (
							<Typography variant="body2" sx={{ color: '#4b5563', py: 1 }}>
								{isOtherActivity ? item.activity_name_other : (selectedActivityOption?.name || '-')}
							</Typography>
						) : (
							<>
								<Autocomplete
									options={activityOptions as any[]}
									getOptionLabel={(option) => option.name || ''}
									value={selectedActivityOption as any}
									onChange={(_, val: any) => {
										if (isCategoryProject) {
											onRowChange(index, 'activity_type_name', val?.name || null);
											onRowChange(index, 'activity_public_id', null);
											onRowChange(index, 'activity_name_other', undefined);
										} else {
											if (val?.public_id === OTHER_ID) {
												onRowChange(index, 'activity_public_id', null);
												onRowChange(index, 'activity_name_other', '');
											} else {
												onRowChange(index, 'activity_public_id', val?.public_id || null);
												onRowChange(index, 'activity_name_other', undefined);
											}
										}
									}}
									disabled={!item.project_public_id}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' }, '& .MuiOutlinedInput-input': { fontSize: '0.85rem' } }}
									renderInput={(params) => <TextField {...params} size="small" placeholder="Activity" />}
								/>
								{isOtherActivity && (
									<TextField
										size="small"
										fullWidth
										autoFocus
										placeholder="Specify..."
										value={item.activity_name_other || ''}
										onChange={(e) => onRowChange(index, 'activity_name_other', e.target.value)}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: '#fffbeb' } }}
									/>
								)}
							</>
						)}
					</Box>
				)}
			</Box>

			{/* Description */}
			<Box sx={{ flexGrow: 1 }}>
				{readOnly ? (
					<Typography variant="body2" sx={{ color: '#4b5563', py: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
						{item.description || '-'}
					</Typography>
				) : (
					<TextField
						fullWidth
						size="small"
						multiline
						maxRows={4}
						placeholder="What did you do?"
						value={item.description}
						onChange={(e) => onRowChange(index, 'description', e.target.value)}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' }, '& .MuiOutlinedInput-input': { fontSize: '0.8125rem' } }}
					/>
				)}
			</Box>

			{/* Times & Hours */}
			<Box sx={{ display: 'flex', width: '200px', gap: 1, alignItems: 'flex-start' }}>
				<Box sx={{ width: '70px' }}>
					{!readOnly && (
						<TimePicker
							slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '6px' }, '& .MuiOutlinedInput-input': { p: '8.5px 8px', fontSize: '0.75rem' } } } }}
							value={item.start_time ? dayjs(`2024-01-01T${item.start_time}`) : null}
							onChange={(v) => v && onRowChange(index, 'start_time', dayjs(v).format('HH:mm'))}
						/>
					) || <Typography sx={{ py: 1, fontSize: '0.85rem', textAlign: 'center' }}>{item.start_time}</Typography>}
				</Box>
				<Box sx={{ width: '70px' }}>
					{!readOnly && (
						<TimePicker
							slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '6px' }, '& .MuiOutlinedInput-input': { p: '8.5px 8px', fontSize: '0.75rem' } } } }}
							value={item.end_time ? dayjs(`2024-01-01T${item.end_time}`) : null}
							onChange={(v) => v && onRowChange(index, 'end_time', dayjs(v).format('HH:mm'))}
						/>
					) || <Typography sx={{ py: 1, fontSize: '0.85rem', textAlign: 'center' }}>{item.end_time}</Typography>}
				</Box>
				<Box sx={{ width: '40px', textAlign: 'center', py: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 800, color: (item.hours || 0) > 0 ? '#111827' : '#9ca3af' }}>
						{item.hours?.toFixed(1) || '0.0'}
					</Typography>
				</Box>
			</Box>

			{/* Delete Action */}
			<Box sx={{ width: '40px', py: 0.5 }}>
				{!readOnly && (
					<IconButton
						onClick={() => onRemoveRow(index)}
						disabled={isDeleteDisabled}
						size="small"
						sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
					>
						<DeleteIcon fontSize="small" />
					</IconButton>
				)}
			</Box>
		</Box>
	);
};

export default DSRItemRow;
