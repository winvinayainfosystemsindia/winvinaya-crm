import React from 'react';
import {
	TableRow,
	TableCell,
	Autocomplete,
	TextField,
	Typography,
	IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
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
	return (
		<TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5 }}>
				<Autocomplete
					options={projects}
					getOptionLabel={(option) => option.name}
					value={projects.find(p => p.public_id === item.project_public_id) || null}
					onChange={(_, val) => onRowChange(index, 'project_public_id', val?.public_id || '')}
					loading={loading && projects.length === 0}
					disabled={readOnly}
					sx={{
						'& .MuiOutlinedInput-root': { borderRadius: '6px' },
						'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
					}}
					renderInput={(params) => <TextField {...params} size="small" placeholder="Project" />}
				/>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5 }}>
				<Autocomplete
					options={activities}
					getOptionLabel={(option) => option.name}
					value={activities.find(a => a.public_id === item.activity_public_id) || null}
					onChange={(_, val) => onRowChange(index, 'activity_public_id', val?.public_id || '')}
					disabled={readOnly || !item.project_public_id}
					sx={{
						'& .MuiOutlinedInput-root': { borderRadius: '6px' },
						'& .MuiOutlinedInput-input': { fontSize: '0.85rem' }
					}}
					renderInput={(params) => <TextField {...params} size="small" placeholder="Activity" />}
				/>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5 }}>
				<TextField
					fullWidth
					size="small"
					multiline
					maxRows={3}
					placeholder="What did you work on?"
					value={item.description}
					onChange={(e) => onRowChange(index, 'description', e.target.value)}
					disabled={readOnly}
					sx={{
						'& .MuiOutlinedInput-root': { borderRadius: '6px' },
						'& .MuiOutlinedInput-input': { fontSize: '0.8125rem' }
					}}
				/>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5 }}>
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
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5 }}>
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
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5, textAlign: 'center' }}>
				<Typography variant="body2" sx={{ fontWeight: 800, color: (item.hours || 0) > 0 ? '#111827' : '#9ca3af' }}>
					{item.hours?.toFixed(1) || '0.0'}
				</Typography>
			</TableCell>
			<TableCell sx={{ borderBottom: '1px solid #f3f4f6', py: 1.5 }}>
				{!readOnly && (
					<IconButton
						onClick={() => onRemoveRow(index)}
						disabled={isDeleteDisabled}
						size="small"
						sx={{
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
