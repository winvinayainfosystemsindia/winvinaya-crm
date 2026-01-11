import React, { memo } from 'react';
import {
	TableRow,
	TableCell,
	Box,
	Typography,
	FormControl,
	Select,
	MenuItem,
	Tooltip,
	IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { CandidateAllocation } from '../../../models/training';

interface CandidateAllocationTableRowProps {
	allocation: CandidateAllocation;
	updatingStatusId: string | null;
	onStatusChange: (publicId: string, status: string) => void;
	onRemove: (publicId: string, name: string) => void;
	getAllocationStatusColor: (status: string) => string;
	ALLOCATION_STATUSES: string[];
}

const CandidateAllocationTableRow: React.FC<CandidateAllocationTableRowProps> = memo(({
	allocation,
	updatingStatusId,
	onStatusChange,
	onRemove,
	getAllocationStatusColor,
	ALLOCATION_STATUSES
}) => {
	return (
		<TableRow hover>
			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: '50%',
							bgcolor: allocation.is_dropout ? '#fdecea' : '#eaeded',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontWeight: 700,
							color: allocation.is_dropout ? '#d32f2f' : '#545b64',
							fontSize: '0.875rem'
						}}
					>
						{allocation.candidate?.name?.[0] || 'C'}
					</Box>
					<Box>
						<Typography sx={{ fontWeight: 600, color: allocation.is_dropout ? '#d32f2f' : 'inherit' }}>
							{allocation.candidate?.name}
						</Typography>
						{allocation.is_dropout && (
							<Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
								DROPOUT
							</Typography>
						)}
					</Box>
				</Box>
			</TableCell>
			<TableCell>
				<Typography variant="body2" sx={{ fontWeight: 500 }}>{allocation.candidate?.email}</Typography>
				<Typography variant="caption" color="text.secondary">{allocation.candidate?.phone}</Typography>
			</TableCell>
			<TableCell>
				<Typography variant="body2">{new Date(allocation.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</Typography>
			</TableCell>
			<TableCell>
				<FormControl size="small" sx={{ minWidth: 160 }}>
					<Select
						value={allocation.is_dropout ? 'dropout' : (allocation.status?.current || 'allocated')}
						onChange={(e) => onStatusChange(allocation.public_id, e.target.value)}
						disabled={updatingStatusId === allocation.public_id}
						sx={{
							fontSize: '0.875rem',
							fontWeight: 600,
							'& .MuiSelect-select': { py: '6px' },
							bgcolor: allocation.is_dropout ? '#fdecea' : 'transparent'
						}}
					>
						{ALLOCATION_STATUSES.map(s => (
							<MenuItem key={s} value={s} sx={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
								<Box component="span" sx={{
									display: 'inline-block',
									width: 10,
									height: 10,
									borderRadius: '50%',
									bgcolor: getAllocationStatusColor(s),
									mr: 1.5
								}} />
								{s}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				{allocation.dropout_remark && (
					<Tooltip title={allocation.dropout_remark}>
						<Typography
							variant="caption"
							sx={{
								display: 'block',
								maxWidth: 160,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								color: 'text.secondary',
								mt: 0.5
							}}
						>
							Remark: {allocation.dropout_remark}
						</Typography>
					</Tooltip>
				)}
			</TableCell>
			<TableCell align="right">
				<Tooltip title="Remove from batch">
					<IconButton
						size="small"
						color="error"
						onClick={() => onRemove(allocation.public_id, allocation.candidate?.name || 'Candidate')}
					>
						<DeleteIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			</TableCell>
		</TableRow>
	);
});

CandidateAllocationTableRow.displayName = 'CandidateAllocationTableRow';

export default CandidateAllocationTableRow;
