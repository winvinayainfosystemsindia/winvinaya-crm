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
	TableSortLabel,
	FormControl,
	Select,
	MenuItem
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
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof CandidateListItem>('created_at');

	const [totalCount, setTotalCount] = useState(0);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

	useEffect(() => {
		fetchCandidates();
	}, [page, rowsPerPage, type, refreshKey, debouncedSearchTerm, order, orderBy]);

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const fetchCandidates = async () => {
		setLoading(true);
		try {
			// Both tabs rely on 'profiled' candidates list, but filtered by counseling status on the server
			// Now using full server-side pagination, search, and sorting
			const response = await candidateService.getProfiled(
				page * rowsPerPage,
				rowsPerPage,
				type,
				debouncedSearchTerm,
				undefined, // documentStatus
				orderBy,
				order
			);

			setCandidates(response.items);
			setTotalCount(response.total);
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

	// Sorting and Search are handled by backend
	const filteredCandidates = candidates;


	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
			{/* Header with Search */}
			<Box sx={{
				p: 2,
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				justifyContent: 'space-between',
				alignItems: { xs: 'stretch', sm: 'center' },
				borderBottom: '1px solid #d5dbdb',
				bgcolor: '#fafafa'
			}}>
				<TextField
					placeholder={`Search candidates...`}
					value={searchTerm}
					onChange={handleSearch}
					size="small"
					fullWidth={true}
					sx={{
						maxWidth: { xs: '100%', sm: '350px' },
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
									{ id: 'name', label: 'Name', hideOnMobile: false },
									{ id: 'phone', label: 'Phone', hideOnMobile: true },
									{ id: 'city', label: 'Location', hideOnMobile: true },
									{ id: 'education_level', label: 'Education', hideOnMobile: true },
									{ id: 'counseling_status', label: 'Status', hideOnMobile: false },
								];
								if (type === 'counseled') {
									headers.push(
										{ id: 'counselor_name', label: 'Counselor', hideOnMobile: true },
										{ id: 'counseling_date', label: 'Date', hideOnMobile: true }
									);
								}
								return headers;
							})().map((headCell) => (
								<TableCell
									key={headCell.id}
									sortDirection={orderBy === headCell.id ? order : false}
									sx={{
										fontWeight: 'bold',
										color: 'text.secondary',
										fontSize: '0.875rem',
										borderBottom: '2px solid #d5dbdb',
										display: headCell.hideOnMobile ? { xs: 'none', md: 'table-cell' } : 'table-cell'
									}}
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
						) : filteredCandidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">No candidates found</Typography>
								</TableCell>
							</TableRow>
						) : (
							filteredCandidates.map((candidate) => (
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
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
										<Typography variant="body2" color="text.secondary">
											{candidate.phone}
										</Typography>
									</TableCell>
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
										<Typography variant="body2" color="text.secondary">
											{candidate.city}, {candidate.state}
										</Typography>
									</TableCell>
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
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
											<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{candidate.counselor_name || '-'}</TableCell>
											<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{candidate.counseling_date ? format(new Date(candidate.counseling_date), 'dd MMM yyyy') : '-'}</TableCell>
										</>
									)}

									{/* Actions */}
									<TableCell align="right">
										{(type === 'pending' && !candidate.counseling_status) ? (
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
												{type === 'pending' ? 'Edit Draft' : 'Edit'}
											</Button>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Pagination */}
			<Box sx={{
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				justifyContent: 'space-between',
				alignItems: 'center',
				p: 2,
				gap: 2,
				borderTop: '1px solid #d5dbdb',
				bgcolor: '#fafafa'
			}}>
				<Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
					<Typography variant="body2" color="text.secondary">
						Rows per page:
					</Typography>
					<FormControl size="small">
						<Select
							value={rowsPerPage}
							onChange={(e) => handleChangeRowsPerPage(e as any)}
							sx={{
								height: '32px',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: '#d5dbdb',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: theme.palette.primary.main,
								}
							}}
						>
							<MenuItem value={5}>5</MenuItem>
							<MenuItem value={10}>10</MenuItem>
							<MenuItem value={25}>25</MenuItem>
							<MenuItem value={50}>50</MenuItem>
							<MenuItem value={100}>100</MenuItem>
						</Select>
					</FormControl>
				</Box>

				<TablePagination
					component="div"
					count={totalCount}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[]}
					sx={{
						border: 'none',
						'.MuiTablePagination-toolbar': {
							paddingLeft: 0,
							paddingRight: 0,
							minHeight: '40px'
						},
						'.MuiTablePagination-actions': {
							marginLeft: { xs: 0, sm: 2 }
						}
					}}
				/>
			</Box>
		</Paper>
	);
};

export default CounselingTable;
