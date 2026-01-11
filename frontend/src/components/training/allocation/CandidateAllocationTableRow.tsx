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
	IconButton,
	Avatar,
	Stack
} from '@mui/material';
import {
	Delete as DeleteIcon,
	MailOutline as MailIcon,
	PhoneIphone as PhoneIcon,
	History as HistoryIcon
} from '@mui/icons-material';
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
	const isDropout = allocation.is_dropout;
	const currentStatus = isDropout ? 'dropout' : (allocation.status?.current || 'allocated');

	const getDisplayStatus = (status: string) => {
		switch (status) {
			case 'allocated': return 'In Training';
			case 'completed': return 'Certified';
			case 'dropout': return 'Withdrawn';
			default: return status.charAt(0).toUpperCase() + status.slice(1);
		}
	};

	return (
		<TableRow
			hover
			sx={{
				'&:hover': { bgcolor: '#fbfbfb' },
				transition: 'background-color 0.2s ease',
				'& td': { py: 1.5, borderBottom: '1px solid #eaeded' }
			}}
		>
			<TableCell>
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar
						sx={{
							width: 32,
							height: 32,
							fontSize: '0.75rem',
							fontWeight: 700,
							bgcolor: isDropout ? '#eaeced' : '#007eb9',
							color: 'white'
						}}
					>
						{allocation.candidate?.name?.[0] || 'C'}
					</Avatar>
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: isDropout ? '#879196' : '#232f3e' }}>
							{allocation.candidate?.name}
						</Typography>
						{isDropout && (
							<Typography variant="caption" sx={{ fontWeight: 700, color: '#d13212', fontSize: '0.65rem', letterSpacing: '0.02em' }}>
								DROPOUT
							</Typography>
						)}
					</Box>
				</Stack>
			</TableCell>
			<TableCell>
				<Stack spacing={0.5}>
					<Stack direction="row" spacing={1} alignItems="center">
						<MailIcon sx={{ fontSize: 14, color: '#879196' }} />
						<Typography variant="body2" sx={{ color: '#545b64', fontSize: '0.8125rem' }}>{allocation.candidate?.email}</Typography>
					</Stack>
					<Stack direction="row" spacing={1} alignItems="center">
						<PhoneIcon sx={{ fontSize: 14, color: '#879196' }} />
						<Typography variant="caption" sx={{ color: '#879196' }}>{allocation.candidate?.phone}</Typography>
					</Stack>
				</Stack>
			</TableCell>
			<TableCell>
				<Stack direction="row" spacing={1} alignItems="center">
					<HistoryIcon sx={{ fontSize: 14, color: '#879196' }} />
					<Typography variant="body2" sx={{ color: '#545b64', fontSize: '0.8125rem' }}>
						{new Date(allocation.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
					</Typography>
				</Stack>
			</TableCell>
			<TableCell>
				<FormControl size="small" sx={{ minWidth: 160 }}>
					<Select
						value={currentStatus}
						onChange={(e) => onStatusChange(allocation.public_id, e.target.value)}
						disabled={updatingStatusId === allocation.public_id}
						variant="outlined"
						sx={{
							height: 28,
							fontSize: '0.75rem',
							fontWeight: 700,
							bgcolor: 'white',
							'& .MuiSelect-select': {
								py: 0,
								display: 'flex',
								alignItems: 'center',
								gap: 1
							},
							'& fieldset': {
								borderColor: '#d5dbdb',
								borderRadius: '14px'
							},
							'&:hover fieldset': { borderColor: '#879196 !important' }
						}}
						renderValue={(selected) => (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box sx={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									bgcolor: getAllocationStatusColor(selected as string)
								}} />
								{getDisplayStatus(selected as string)}
							</Box>
						)}
					>
						{ALLOCATION_STATUSES.map(s => (
							<MenuItem key={s} value={s} sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
								<Box component="span" sx={{
									display: 'inline-block',
									width: 8,
									height: 8,
									borderRadius: '50%',
									bgcolor: getAllocationStatusColor(s),
									mr: 1.5
								}} />
								{getDisplayStatus(s)}
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
								color: '#d13212',
								fontWeight: 500,
								mt: 0.5,
								fontSize: '0.65rem'
							}}
						>
							Reason: {allocation.dropout_remark}
						</Typography>
					</Tooltip>
				)}
			</TableCell>
			<TableCell align="right">
				<Tooltip title="Remove candidate from batch">
					<IconButton
						size="small"
						sx={{
							color: '#545b64',
							'&:hover': { color: '#d13212', bgcolor: '#fdeeea' }
						}}
						onClick={() => onRemove(allocation.public_id, allocation.candidate?.name || 'Candidate')}
					>
						<DeleteIcon sx={{ fontSize: 18 }} />
					</IconButton>
				</Tooltip>
			</TableCell>
		</TableRow>
	);
});

CandidateAllocationTableRow.displayName = 'CandidateAllocationTableRow';

export default CandidateAllocationTableRow;
