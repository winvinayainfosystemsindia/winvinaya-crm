import React, { memo } from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	CircularProgress,
	FormControl,
	Select,
	MenuItem,
	TextField,
	InputAdornment
} from '@mui/material';
import {
	Search as SearchIcon,
	People as PeopleIcon
} from '@mui/icons-material';
import type { CandidateAllocation } from '../../../models/training';
import CandidateAllocationTableRow from './CandidateAllocationTableRow';

const ALLOCATION_STATUSES = [
	'allocated',
	'training',
	'completed',
	'dropout',
	'not interested'
];

const getAllocationStatusColor = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'completed': return '#2e7d32';
		case 'dropout': return '#d32f2f';
		case 'not interested': return '#757575';
		case 'training': return '#0288d1';
		default: return '#fb8c00';
	}
};

interface CandidateAllocationTableProps {
	allocations: CandidateAllocation[];
	loading: boolean;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	filterDropout: boolean | 'all';
	onFilterChange: (value: boolean | 'all') => void;
	updatingStatusId: string | null;
	onStatusChange: (publicId: string, status: string) => void;
	onRemove: (publicId: string, name: string) => void;
}

const CandidateAllocationTable: React.FC<CandidateAllocationTableProps> = memo(({
	allocations,
	loading,
	searchQuery,
	onSearchChange,
	filterDropout,
	onFilterChange,
	updatingStatusId,
	onStatusChange,
	onRemove
}) => {
	return (
		<Box>
			{/* Filter and Search Bar */}
			<Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
				<TextField
					placeholder="Search candidates..."
					size="small"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					sx={{ flexGrow: 1, maxWidth: 400, bgcolor: 'white' }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
				<FormControl size="small" sx={{ minWidth: 200 }}>
					<Select
						value={filterDropout}
						onChange={(e) => onFilterChange(e.target.value as any)}
						sx={{ bgcolor: 'white' }}
					>
						<MenuItem value="all">All Candidates</MenuItem>
						<MenuItem value={false as any}>Active Only</MenuItem>
						<MenuItem value={true as any}>Dropouts Only</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d5dbdb', borderRadius: '4px' }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f8f9fa' }}>
							<TableCell sx={{ fontWeight: 700, py: 2 }}>Candidate Name</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Contact Info</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Allocation Date</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Current Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 8 }}>
									<CircularProgress size={32} thickness={4} />
									<Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">Loading candidate data...</Typography>
								</TableCell>
							</TableRow>
						) : allocations.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 10 }}>
									<Box sx={{ opacity: 0.5 }}>
										<PeopleIcon sx={{ fontSize: 64, mb: 1 }} />
										<Typography variant="h6">No candidates in this batch</Typography>
										<Typography variant="body2">Use the "Add New Allocation" tab to enroll candidates.</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							allocations.map((allocation) => (
								<CandidateAllocationTableRow
									key={allocation.public_id}
									allocation={allocation}
									updatingStatusId={updatingStatusId}
									onStatusChange={onStatusChange}
									onRemove={onRemove}
									getAllocationStatusColor={getAllocationStatusColor}
									ALLOCATION_STATUSES={ALLOCATION_STATUSES}
								/>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
});

CandidateAllocationTable.displayName = 'CandidateAllocationTable';

export default CandidateAllocationTable;
