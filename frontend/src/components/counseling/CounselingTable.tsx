import React, { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	TextField,
	Button,
	InputAdornment,
	Typography,
	useTheme,
	Tooltip,
	Chip,
	TableSortLabel
} from '@mui/material';
import { Search, Edit, Accessible, VerifiedUser, AssignmentTurnedIn } from '@mui/icons-material';
import { format } from 'date-fns';
import candidateService from '../../services/candidateService';
import type { CandidateListItem } from '../../models/candidate';

interface CounselingTableProps {
	type: 'pending' | 'counseled';
	onAction: (action: 'counsel' | 'edit', candidate: CandidateListItem) => void;
	refreshKey?: number; // Prop to trigger refresh
}

const CounselingTable: React.FC<CounselingTableProps> = ({ type, onAction, refreshKey }) => {
	const theme = useTheme();
	const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof CandidateListItem>('created_at');

	useEffect(() => {
		fetchCandidates();
	}, [page, rowsPerPage, type, refreshKey]);

	const fetchCandidates = async () => {
		setLoading(true);
		try {
			// Both tabs rely on 'profiled' candidates list, but filtered by counseling status
			const response = await candidateService.getProfiled(page * rowsPerPage, rowsPerPage * 5); // Fetch more to client filter

			// Filter based on type
			const filtered = response.filter(c => {
				if (type === 'pending') {
					return !c.counseling_status || c.counseling_status === 'pending';
				} else {
					return c.counseling_status && c.counseling_status !== 'pending';
				}
			});

			setCandidates(filtered);
		} catch (error) {
			console.error(`Failed to fetch ${type} candidates:`, error);
		} finally {
			setLoading(false);
		}
	};

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(0);
	};

	const handleRequestSort = (property: keyof CandidateListItem) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	// Client-side filtering on the retained page 
	const processedCandidates = candidates
		.filter(candidate => {
			const search = searchTerm.toLowerCase();
			return (
				candidate.name.toLowerCase().includes(search) ||
				candidate.email.toLowerCase().includes(search) ||
				candidate.phone.includes(search) ||
				candidate.city.toLowerCase().includes(search)
			);
		})
		.sort((a, b) => {
			const isAsc = order === 'asc';
			if (orderBy === 'created_at') {
				return isAsc
					? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					: new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			}
			const aValue = (a[orderBy] as string | number) ?? '';
			const bValue = (b[orderBy] as string | number) ?? '';

			if (aValue < bValue) return isAsc ? -1 : 1;
			if (aValue > bValue) return isAsc ? 1 : -1;
			return 0;
		});

	// Pagination on filtered list
	const paginatedCandidates = processedCandidates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			{/* Header with Search */}
			<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d5dbdb', bgcolor: '#fafafa' }}>
				<TextField
					placeholder={`Search candidates...`}
					value={searchTerm}
					onChange={handleSearch}
					size="small"
					sx={{
						width: '300px',
						'& .MuiOutlinedInput-root': {
							bgcolor: 'white',
							'& fieldset': {
								borderColor: '#d5dbdb',
							},
							'&:hover fieldset': {
								borderColor: theme.palette.primary.main,
							},
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search sx={{ color: 'text.secondary', fontSize: 20 }} />
							</InputAdornment>
						),
					}}
				/>
			</Box>

			<TableContainer>
				<Table sx={{ minWidth: 650 }} aria-label="counseling table">
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							{(() => {
								const headers = [
									{ id: 'name', label: 'Name' },
									{ id: 'phone', label: 'Phone' },
									{ id: 'city', label: 'Location' },
									{ id: 'education_level', label: 'Education' },
									{ id: 'counseling_status', label: 'Status' },
								];
								if (type === 'counseled') {
									headers.push(
										{ id: 'counselor_name', label: 'Counselor' },
										{ id: 'counseling_date', label: 'Date' }
									);
								}
								return headers;
							})().map((headCell) => (
								<TableCell
									key={headCell.id}
									sortDirection={orderBy === headCell.id ? order : false}
									sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}
								>
									<TableSortLabel
										active={orderBy === headCell.id}
										direction={orderBy === headCell.id ? order : 'asc'}
										onClick={() => handleRequestSort(headCell.id as keyof CandidateListItem)}
									>
										{headCell.label}
									</TableSortLabel>
								</TableCell>
							))}
							<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">Loading...</Typography>
								</TableCell>
							</TableRow>
						) : paginatedCandidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">No candidates found</Typography>
								</TableCell>
							</TableRow>
						) : (
							paginatedCandidates.map((candidate) => (
								<TableRow
									key={candidate.public_id}
									sx={{
										'&:hover': {
											bgcolor: '#f5f8fa',
										},
										'&:last-child td': {
											borderBottom: 0
										}
									}}
								>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Typography variant="body2" sx={{ fontWeight: 500 }}>
												{candidate.name}
											</Typography>
											{candidate.is_disabled && (
												<Tooltip title="Person with Disability">
													<Accessible color="primary" fontSize="small" />
												</Tooltip>
											)}
											<Tooltip title="Verified Profile">
												<VerifiedUser sx={{ color: '#4caf50', fontSize: 20 }} />
											</Tooltip>
										</Box>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{candidate.phone}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{candidate.city}, {candidate.state}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{candidate.education_level || '-'}
										</Typography>
									</TableCell>
									{/* Status Column */}
									<TableCell>
										{candidate.counseling_status === 'selected' && <Chip label="Selected" color="success" size="small" />}
										{candidate.counseling_status === 'rejected' && <Chip label="Rejected" color="error" size="small" />}
										{candidate.counseling_status === 'pending' && <Chip label="Pending" color="warning" size="small" />}
										{!candidate.counseling_status && <Chip label="Not Started" size="small" />}
									</TableCell>

									{/* Counselor Name & Date (Only for Counseled) */}
									{type === 'counseled' && (
										<>
											<TableCell>{candidate.counselor_name || '-'}</TableCell>
											<TableCell>{candidate.counseling_date ? format(new Date(candidate.counseling_date), 'dd MMM yyyy') : '-'}</TableCell>
										</>
									)}

									{/* Actions */}
									<TableCell align="right">
										{type === 'pending' ? (
											<Button
												variant="contained"
												size="small"
												startIcon={<AssignmentTurnedIn />}
												onClick={() => onAction('counsel', candidate)}
												sx={{
													textTransform: 'none',
													bgcolor: '#1976d2',
													'&:hover': { bgcolor: '#115293' }
												}}
											>
												Counsel
											</Button>
										) : (
											<Button
												variant="outlined"
												size="small"
												startIcon={<Edit fontSize="small" />}
												onClick={() => onAction('edit', candidate)}
												sx={{ textTransform: 'none' }}
											>
												Edit
											</Button>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={processedCandidates.length}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[10, 25, 50, 100]}
				sx={{
					borderTop: '1px solid #d5dbdb',
					'.MuiTablePagination-toolbar': {
						paddingLeft: 2,
						paddingRight: 2,
					}
				}}
			/>
		</Paper>
	);
};

export default CounselingTable;
