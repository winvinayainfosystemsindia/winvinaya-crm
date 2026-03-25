import React from 'react';
import {
	TableRow,
	TableCell,
	Autocomplete,
	TextField,
	Typography,
	IconButton,
	Box,
	InputAdornment
} from '@mui/material';
import { 
	Delete as DeleteIcon,
	EditNote as EditIcon
} from '@mui/icons-material';
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
	loading,
	onRowChange,
	onRemoveRow,
	isDeleteDisabled,
	readOnly = false,
	reportDate
}) => {
	const activityOptions = React.useMemo(() => {
		const filtered = activities.filter(a => {
			// Always keep the currently selected activity to avoid UI break
			if (a.public_id === item.activity_public_id) return true;

			// Exclude inactive or cancelled
			if (!a.is_active || a.status === 'cancelled') return false;

			// Exclude future activities
			if (a.start_date > reportDate) return false;

			// Handle completed activities
			if (a.status === 'completed') {
				const endDate = a.actual_end_date || a.end_date;
				// If report date is after completion date, hide it
				if (reportDate > endDate) return false;
			}

			return true;
		});
		return [...filtered, OTHER_ACTIVITY as DSRActivity];
	}, [activities, reportDate, item.activity_public_id]);

	const selectedProject = React.useMemo(() => {
		if (!item.project_public_id) return null;
		// Handle the virtual general project
		if (item.project_public_id === GENERAL_PROJECT_ID) {
			const project = projects.find(p => p.public_id === GENERAL_PROJECT_ID);
			if (project) return project;
			return { public_id: GENERAL_PROJECT_ID, name: 'General / Internal Work' } as DSRProject;
		}
		return projects.find(p => p.public_id === item.project_public_id) || null;
	}, [item.project_public_id, projects]);

	const selectedType = React.useMemo(() => {
		return activityTypes.find(at => at.name === item.activity_type_name) || null;
	}, [item.activity_type_name, activityTypes]);

	const selectedActivity = React.useMemo(() => {
		if (item.activity_name_other !== undefined && item.activity_name_other !== null) return OTHER_ACTIVITY;
		return activities.find(a => a.public_id === item.activity_public_id) || null;
	}, [item.activity_public_id, item.activity_name_other, activities]);

	const isOtherActivity = selectedActivity?.public_id === OTHER_ID;
	const isGeneralProject = item.project_public_id === GENERAL_PROJECT_ID;
	const isCategoryProject = item.project_public_id?.startsWith('category:');
	const selectedCategoryName = isCategoryProject ? item.project_public_id?.split(':')[1] : null;

	const filteredActivityTypesChoice = React.useMemo(() => {
		if (isCategoryProject) {
			return activityTypes.filter(at => at.category === selectedCategoryName);
		}
		if (isGeneralProject) {
			return activityTypes;
		}
		return [];
	}, [activityTypes, isCategoryProject, selectedCategoryName, isGeneralProject]);

	return (
		<TableRow sx={{ '&:hover': { bgcolor: readOnly ? 'transparent' : '#f9fafb' } }}>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top', minWidth: 180 }}>
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
						onChange={(_, val) => {
							onRowChange(index, 'project_public_id', val?.public_id || null);
						}}
						loading={loading && projects.length === 0}
						isOptionEqualToValue={(option, value) => option.public_id === value.public_id}
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '6px' },
							'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
						}}
						renderInput={(params) => <TextField {...params} size="small" placeholder="Project" />}
					/>
				)}
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top', minWidth: 140 }}>
				{isGeneralProject ? (
					readOnly ? (
						<Typography variant="body2" sx={{ color: '#4b5563', py: 1 }}>
							{selectedType?.name || '-'}
						</Typography>
					) : (
						<Autocomplete
							options={activityTypes}
							getOptionLabel={(option) => option.name || ''}
							value={selectedType}
							onChange={(_, val) => {
								onRowChange(index, 'activity_type_name', val?.name || null);
							}}
							isOptionEqualToValue={(option, value) => option.name === value.name}
							sx={{
								'& .MuiOutlinedInput-root': { borderRadius: '6px' },
								'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
							}}
							renderInput={(params) => <TextField {...params} size="small" placeholder="Type" required />}
						/>
					)
				) : isCategoryProject ? (
					readOnly ? (
						<Typography variant="body2" sx={{ color: '#4b5563', py: 1 }}>
							{selectedType?.name || '-'}
						</Typography>
					) : (
						<Autocomplete
							options={filteredActivityTypesChoice}
							getOptionLabel={(option) => option.name || ''}
							value={selectedType}
							onChange={(_, val) => {
								onRowChange(index, 'activity_type_name', val?.name || null);
							}}
							isOptionEqualToValue={(option, value) => option.name === value.name}
							sx={{
								'& .MuiOutlinedInput-root': { borderRadius: '6px' },
								'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
							}}
							renderInput={(params) => <TextField {...params} size="small" placeholder="Type" required />}
						/>
					)
				) : (
					!readOnly && (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.75rem' }}>
							N/A for Projects
						</Typography>
					)
				)}
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top', minWidth: 180 }}>
				{!isGeneralProject && !isCategoryProject ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{readOnly ? (
							<Typography variant="body2" sx={{ color: '#4b5563', py: 1 }}>
								{isOtherActivity ? item.activity_name_other : (selectedActivity?.name || '-')}
							</Typography>
						) : (
							<>
								<Autocomplete
									options={activityOptions}
									getOptionLabel={(option) => option.name || ''}
									value={selectedActivity}
									onChange={(_, val) => {
										if (val?.public_id === OTHER_ID) {
											onRowChange(index, 'activity_public_id', null);
											onRowChange(index, 'activity_name_other', '');
										} else {
											onRowChange(index, 'activity_public_id', val?.public_id || null);
											onRowChange(index, 'activity_name_other', undefined);
										}
									}}
									disabled={!item.project_public_id}
									isOptionEqualToValue={(option, value) => option.public_id === value.public_id}
									sx={{
										'& .MuiOutlinedInput-root': { borderRadius: '6px' },
										'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
									}}
									renderInput={(params) => <TextField {...params} size="small" placeholder="Activity / Task" />}
								/>
								{isOtherActivity && (
									<TextField
										size="small"
										fullWidth
										autoFocus
										placeholder="Specify activity..."
										value={item.activity_name_other || ''}
										onChange={(e) => onRowChange(index, 'activity_name_other', e.target.value)}
										sx={{
											'& .MuiOutlinedInput-root': { 
												borderRadius: '6px',
												bgcolor: '#fffbeb',
												borderColor: '#fbbf24'
											},
											'& .MuiOutlinedInput-input': { fontSize: '0.8125rem' }
										}}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<EditIcon sx={{ fontSize: '1rem', color: '#d97706' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							</>
						)}
					</Box>
				) : isCategoryProject ? (
					!readOnly && (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.75rem' }}>
							Selected in 'Type'
						</Typography>
					)
				) : (
					!readOnly && (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.75rem' }}>
							N/A for General
						</Typography>
					)
				)}
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top' }}>
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
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '6px' },
							'& .MuiOutlinedInput-input': { fontSize: '0.8125rem' }
						}}
					/>
				)}
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top' }}>
				{readOnly ? (
					<Typography variant="body2" sx={{ color: '#6b7280', py: 1, textAlign: 'center' }}>
						{item.start_time || '-'}
					</Typography>
				) : (
					<TextField
						type="time"
						size="small"
						fullWidth
						value={item.start_time}
						onChange={(e) => onRowChange(index, 'start_time', e.target.value)}
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '6px' },
							'& .MuiOutlinedInput-input': { fontSize: '0.8125rem', p: '8.5px 12px' }
						}}
					/>
				)}
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top' }}>
				{readOnly ? (
					<Typography variant="body2" sx={{ color: '#6b7280', py: 1, textAlign: 'center' }}>
						{item.end_time || '-'}
					</Typography>
				) : (
					<TextField
						type="time"
						size="small"
						fullWidth
						value={item.end_time}
						onChange={(e) => onRowChange(index, 'end_time', e.target.value)}
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '6px' },
							'& .MuiOutlinedInput-input': { fontSize: '0.8125rem', p: '8.5px 12px' }
						}}
					/>
				)}
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, textAlign: 'center', verticalAlign: 'top' }}>
				<Typography variant="body2" sx={{ fontWeight: 700, color: (item.hours || 0) > 0 ? '#111827' : '#9ca3af', py: 1 }}>
					{item.hours?.toFixed(1) || '0.0'}
				</Typography>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top' }}>
				{!readOnly && (
					<IconButton
						onClick={() => onRemoveRow(index)}
						disabled={isDeleteDisabled}
						size="small"
						sx={{
							mt: 0.5,
							color: '#9ca3af',
							transition: 'all 0.2s',
							'&:hover': { color: '#ef4444', bgcolor: '#fef2f2' },
							'&.Mui-disabled': { color: '#f3f4f6' }
						}}
					>
						<DeleteIcon fontSize="inherit" sx={{ fontSize: '1.1rem' }} />
					</IconButton>
				)}
			</TableCell>
		</TableRow>
	);
};

export default DSRItemRow;
