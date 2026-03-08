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
		<TableRow>
			<TableCell>
				<Autocomplete
					options={projects}
					getOptionLabel={(option) => option.name}
					value={projects.find(p => p.public_id === item.project_public_id) || null}
					onChange={(_, val) => onRowChange(index, 'project_public_id', val?.public_id || '')}
					loading={loading && projects.length === 0}
					disabled={readOnly}
					renderInput={(params) => <TextField {...params} size="small" placeholder="Select Project" />}
				/>
			</TableCell>
			<TableCell>
				<Autocomplete
					options={activities}
					getOptionLabel={(option) => option.name}
					value={activities.find(a => a.public_id === item.activity_public_id) || null}
					onChange={(_, val) => onRowChange(index, 'activity_public_id', val?.public_id || '')}
					disabled={readOnly || !item.project_public_id}
					renderInput={(params) => <TextField {...params} size="small" placeholder="Select Activity" />}
				/>
			</TableCell>
			<TableCell>
				<TextField
					fullWidth
					size="small"
					multiline
					placeholder="What did you work on?"
					value={item.description}
					onChange={(e) => onRowChange(index, 'description', e.target.value)}
					disabled={readOnly}
				/>
			</TableCell>
			<TableCell>
				<TextField
					type="time"
					size="small"
					fullWidth
					value={item.start_time}
					onChange={(e) => onRowChange(index, 'start_time', e.target.value)}
					disabled={readOnly}
				/>
			</TableCell>
			<TableCell>
				<TextField
					type="time"
					size="small"
					fullWidth
					value={item.end_time}
					onChange={(e) => onRowChange(index, 'end_time', e.target.value)}
					disabled={readOnly}
				/>
			</TableCell>
			<TableCell>
				<Typography variant="body2" fontWeight={700}>
					{item.hours?.toFixed(1) || '0'}
				</Typography>
			</TableCell>
			<TableCell>
				{!readOnly && (
					<IconButton color="error" size="small" onClick={() => onRemoveRow(index)} disabled={isDeleteDisabled}>
						<DeleteIcon fontSize="small" />
					</IconButton>
				)}
			</TableCell>
		</TableRow>
	);
};

export default DSRItemRow;
