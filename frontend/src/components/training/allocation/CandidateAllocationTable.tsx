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
	InputAdornment,
	Button,
	Stack
} from '@mui/material';
import {
	Search as SearchIcon,
	People as PeopleIcon,
	PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { CandidateAllocation } from '../../../models/training';
import CandidateAllocationTableRow from './CandidateAllocationTableRow';
import DropoutReasonDialog from '../../common/DropoutReasonDialog';

const ALLOCATION_STATUSES = [
	'in_training',
	'completed',
	'dropped_out',
	'placed'
];

const getAllocationStatusColor = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'completed': return '#2e7d32';
		case 'dropped_out': return '#d32f2f';
		case 'placed': return '#00a3bf';
		case 'in_training': return '#0288d1';
		default: return '#fb8c00'; // allocated or others
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
	onStatusChange: (publicId: string, status: string, reason?: string) => void;
	onRemove: (publicId: string, name: string) => void;
	onAddClick: () => void;
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
	onRemove,
	onAddClick
}) => {
	const [dropoutDialog, setDropoutDialog] = useState<{ open: boolean, publicId: string, name: string } | null>(null);

	const handleStatusChangeInternal = (publicId: string, status: string) => {
		if (status === 'dropped_out') {
			const candidate = allocations.find(a => a.public_id === publicId);
			setDropoutDialog({
				open: true,
				publicId,
				name: candidate?.candidate?.name || 'Candidate'
			});
		} else {
			onStatusChange(publicId, status);
		}
	};

	const handleDropoutConfirm = (reason: string) => {
		if (dropoutDialog) {
			onStatusChange(dropoutDialog.publicId, 'dropped_out', reason);
			setDropoutDialog(null);
		}
	};

	return (
		<Box>
			{/* Command Bar */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 3,
					bgcolor: 'white',
					border: '1px solid #d5dbdb',
					borderRadius: '2px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 2
				}}
			>
				<Box sx={{ display: 'flex', gap: 2, flexGrow: 1, maxWidth: 800 }}>
					<TextField
						placeholder="Search candidates by name, email or ID..."
						size="small"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						sx={{ flexGrow: 1, bgcolor: '#fbfbfb' }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon fontSize="small" sx={{ color: '#545b64' }} />
								</InputAdornment>
							),
							sx: { borderRadius: '2px', height: 36, fontSize: '0.875rem' }
						}}
					/>
					<FormControl size="small" sx={{ minWidth: 180 }}>
						<Select
							value={filterDropout}
							onChange={(e) => onFilterChange(e.target.value as any)}
							sx={{ bgcolor: '#fbfbfb', borderRadius: '2px', height: 36, fontSize: '0.875rem' }}
						>
							<MenuItem value="all">Filter: All Candidates</MenuItem>
							<MenuItem value={false as any}>Filter: Active Only</MenuItem>
							<MenuItem value={true as any}>Filter: Dropouts Only</MenuItem>
						</Select>
					</FormControl>
				</Box>

				<Stack direction="row" spacing={2} alignItems="center">
					<Typography variant="body2" sx={{ fontWeight: 700, color: '#545b64', mr: 1 }}>
						{allocations.length} {allocations.length === 1 ? 'candidate' : 'candidates'}
					</Typography>
					<Button
						variant="contained"
						startIcon={<PersonAddIcon />}
						onClick={onAddClick}
						sx={{
							bgcolor: '#ec7211',
							color: '#ffffff',
							textTransform: 'none',
							fontWeight: 700,
							px: 3,
							'&:hover': { bgcolor: '#eb5f07' },
							boxShadow: 'none',
							borderRadius: '2px',
							height: 36
						}}
					>
						Enroll Candidate
					</Button>
				</Stack>
			</Paper>

			<TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d5dbdb', borderRadius: '2px' }}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: '#f8f9fa' }}>
							<TableCell sx={{ fontWeight: 700, py: 1.5, color: '#545b64', fontSize: '0.75rem', textTransform: 'uppercase' }}>Candidate Name</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64', fontSize: '0.75rem', textTransform: 'uppercase' }}>Gender</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64', fontSize: '0.75rem', textTransform: 'uppercase' }}>Disability</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64', fontSize: '0.75rem', textTransform: 'uppercase' }}>Qualification</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64', fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact Info</TableCell>
							<TableCell sx={{ fontWeight: 700, color: '#545b64', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700, color: '#545b64', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
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
										<PeopleIcon sx={{ fontSize: 48, mb: 1, color: '#d5dbdb' }} />
										<Typography variant="h6" sx={{ fontWeight: 600, color: '#232f3e' }}>No candidates found</Typography>
										<Typography variant="body2">Try adjusting your search or filters, or enroll a new candidate.</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							allocations.map((allocation) => (
								<CandidateAllocationTableRow
									key={allocation.public_id}
									allocation={allocation}
									updatingStatusId={updatingStatusId}
									onStatusChange={handleStatusChangeInternal}
									onRemove={onRemove}
									getAllocationStatusColor={getAllocationStatusColor}
									ALLOCATION_STATUSES={ALLOCATION_STATUSES}
								/>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{dropoutDialog && (
				<DropoutReasonDialog
					open={dropoutDialog.open}
					onClose={() => setDropoutDialog(null)}
					onConfirm={handleDropoutConfirm}
					candidateName={dropoutDialog.name}
				/>
			)}
		</Box>
	);
});

CandidateAllocationTable.displayName = 'CandidateAllocationTable';

export default CandidateAllocationTable;
