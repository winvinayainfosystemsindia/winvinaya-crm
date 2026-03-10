import React from 'react';
import {
	TableRow,
	TableCell,
	Autocomplete,
	TextField,
	Typography,
	IconButton,
	Box,
	Tooltip,
	InputAdornment
} from '@mui/material';
import { 
	Delete as DeleteIcon,
	InfoOutlined as InfoIcon,
	EditNote as EditIcon
} from '@mui/icons-material';
import type { DSRItem, DSRProject, DSRActivity } from '../../../../models/dsr';

interface DSRItemRowProps {
	index: number;
	item: Partial<DSRItem>;
	projects: DSRProject[];
	activities: DSRActivity[];
	loading: boolean;
	onRowChange: (index: number, field: keyof DSRItem, value: any) => void;
	onRemoveRow: (index: number) => void;
	isDeleteDisabled: boolean;
	readOnly?: boolean;
}

const OTHER_ID = '__other__';

const OTHER_PROJECT: Partial<DSRProject> = {
	public_id: OTHER_ID,
	name: 'Other (Specify...)'
};

const OTHER_ACTIVITY: Partial<DSRActivity> = {
	public_id: OTHER_ID,
	name: 'Other (Specify...)'
};

const DSRItemRow: React.FC<DSRItemRowProps> = ({
	index,
	item,
	projects,
	activities,
	loading,
	onRowChange,
	onRemoveRow,
	isDeleteDisabled,
	readOnly = false
}) => {
	const projectOptions = React.useMemo(() => [...projects, OTHER_PROJECT as DSRProject], [projects]);
	
	const activityOptions = React.useMemo(() => {
		return [...activities, OTHER_ACTIVITY as DSRActivity];
	}, [activities]);

	const selectedProject = React.useMemo(() => {
		if (item.project_name_other !== undefined && item.project_name_other !== null) return OTHER_PROJECT;
		return projects.find(p => p.public_id === item.project_public_id) || null;
	}, [item.project_public_id, item.project_name_other, projects]);

	const selectedActivity = React.useMemo(() => {
		if (item.activity_name_other !== undefined && item.activity_name_other !== null) return OTHER_ACTIVITY;
		return activities.find(a => a.public_id === item.activity_public_id) || null;
	}, [item.activity_public_id, item.activity_name_other, activities]);

	const isOtherProject = selectedProject?.public_id === OTHER_ID;
	const isOtherActivity = selectedActivity?.public_id === OTHER_ID;

	return (
		<TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top', minWidth: 200 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					<Autocomplete
						options={projectOptions}
						getOptionLabel={(option) => option.name || ''}
						value={selectedProject}
						onChange={(_, val) => {
							if (val?.public_id === OTHER_ID) {
								onRowChange(index, 'project_public_id', null);
								onRowChange(index, 'project_name_other', '');
							} else {
								onRowChange(index, 'project_public_id', val?.public_id || null);
								onRowChange(index, 'project_name_other', undefined);
							}
						}}
						loading={loading && projects.length === 0}
						disabled={readOnly}
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '6px' },
							'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
						}}
						renderInput={(params) => (
							<TextField 
								{...params} 
								size="small" 
								placeholder="Project"
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<React.Fragment>
											{params.InputProps.endAdornment}
											<Tooltip title="Select a project from the list, or choose 'Other' to enter a custom name." arrow>
												<InputAdornment position="end" sx={{ mr: 1, cursor: 'help' }}>
													<InfoIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />
												</InputAdornment>
											</Tooltip>
										</React.Fragment>
									),
								}}
							/>
						)}
					/>
					{isOtherProject && (
						<Box sx={{ position: 'relative' }}>
							<TextField
								size="small"
								fullWidth
								autoFocus
								placeholder="Enter Custom Project Name"
								value={item.project_name_other || ''}
								onChange={(e) => onRowChange(index, 'project_name_other', e.target.value)}
								disabled={readOnly}
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
						</Box>
					)}
				</Box>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top', minWidth: 200 }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
						disabled={readOnly || (!item.project_public_id && item.project_name_other === undefined)}
						sx={{
							'& .MuiOutlinedInput-root': { borderRadius: '6px' },
							'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
						}}
						renderInput={(params) => <TextField {...params} size="small" placeholder="Activity" />}
					/>
					{isOtherActivity && (
						<TextField
							size="small"
							fullWidth
							autoFocus
							placeholder="Enter Custom Activity Name"
							value={item.activity_name_other || ''}
							onChange={(e) => onRowChange(index, 'activity_name_other', e.target.value)}
							disabled={readOnly}
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
				</Box>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top' }}>
				<TextField
					fullWidth
					size="small"
					multiline
					maxRows={4}
					placeholder="Describe your work..."
					value={item.description}
					onChange={(e) => onRowChange(index, 'description', e.target.value)}
					disabled={readOnly}
					sx={{
						'& .MuiOutlinedInput-root': { borderRadius: '6px' },
						'& .MuiOutlinedInput-input': { fontSize: '0.8125rem' }
					}}
				/>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top' }}>
				<TextField
					type="time"
					size="small"
					fullWidth
					value={item.start_time}
					onChange={(e) => onRowChange(index, 'start_time', e.target.value)}
					disabled={readOnly}
					sx={{
						'& .MuiOutlinedInput-root': { borderRadius: '6px' },
						'& .MuiOutlinedInput-input': { fontSize: '0.8125rem', p: '8.5px 12px' }
					}}
				/>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, verticalAlign: 'top' }}>
				<TextField
					type="time"
					size="small"
					fullWidth
					value={item.end_time}
					onChange={(e) => onRowChange(index, 'end_time', e.target.value)}
					disabled={readOnly}
					sx={{
						'& .MuiOutlinedInput-root': { borderRadius: '6px' },
						'& .MuiOutlinedInput-input': { fontSize: '0.8125rem', p: '8.5px 12px' }
					}}
				/>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, textAlign: 'center', verticalAlign: 'top' }}>
				<Typography variant="body2" sx={{ fontWeight: 600, color: (item.hours || 0) > 0 ? '#111827' : '#9ca3af', mt: 1 }}>
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
