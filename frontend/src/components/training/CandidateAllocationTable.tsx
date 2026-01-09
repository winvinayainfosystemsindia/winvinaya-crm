import React from 'react';
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
	IconButton,
	Tooltip,
	CircularProgress,
	FormControl,
	Select,
	MenuItem,
	TextField,
	InputAdornment
} from '@mui/material';
import {
	Delete as DeleteIcon,
	Search as SearchIcon,
	People as PeopleIcon
} from '@mui/icons-material';
import type { CandidateAllocation } from '../../models/training';

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

const CandidateAllocationTable: React.FC<CandidateAllocationTableProps> = ({
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
								<TableRow key={allocation.public_id} hover>
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
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default CandidateAllocationTable;
