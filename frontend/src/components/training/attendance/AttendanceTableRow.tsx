import React, { memo } from 'react';
import {
	TableRow,
	TableCell,
	Box,
	Avatar,
	Typography,
	FormControl,
	Select,
	MenuItem,
	TextField
} from '@mui/material';
import type { CandidateAllocation } from '../../../models/training';

interface AttendanceTableRowProps {
	allocation: CandidateAllocation;
	status: string;
	remark: string;
	isActive: boolean;
	statuses: Array<{ value: string; label: string; icon: React.ReactNode; color: string }>;
	onStatusChange: (candidateId: number, status: string) => void;
	onRemarkChange: (candidateId: number, remark: string) => void;
}

const AttendanceTableRow: React.FC<AttendanceTableRowProps> = memo(({
	allocation,
	status,
	remark,
	isActive,
	statuses,
	onStatusChange,
	onRemarkChange
}) => {
	return (
		<TableRow hover sx={{ opacity: isActive ? 1 : 0.6 }}>
			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Avatar sx={{ bgcolor: '#eaeded', color: '#545b64', fontSize: '0.875rem', fontWeight: 700 }}>
						{allocation.candidate?.name?.[0]}
					</Avatar>
					<Box>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>{allocation.candidate?.name}</Typography>
						<Typography variant="caption" color="text.secondary">{allocation.candidate?.email}</Typography>
					</Box>
				</Box>
			</TableCell>
			<TableCell align="center">
				<FormControl size="small" sx={{ minWidth: 150 }}>
					<Select
						value={status}
						onChange={(e) => onStatusChange(allocation.candidate_id, e.target.value)}
						disabled={!isActive}
						sx={{
							fontSize: '0.875rem',
							fontWeight: 600,
							'& .MuiOutlinedInput-root': { borderRadius: '2px' }
						}}
					>
						{statuses.map(s => (
							<MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.875rem' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									{s.icon}
									{s.label}
								</Box>
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</TableCell>
			<TableCell>
				<TextField
					fullWidth
					size="small"
					placeholder="Add remark..."
					value={remark}
					onChange={(e) => onRemarkChange(allocation.candidate_id, e.target.value)}
					disabled={!isActive}
					variant="standard"
					InputProps={{ disableUnderline: true, sx: { fontSize: '0.8125rem' } }}
				/>
			</TableCell>
		</TableRow>
	);
});

AttendanceTableRow.displayName = 'AttendanceTableRow';

export default AttendanceTableRow;
