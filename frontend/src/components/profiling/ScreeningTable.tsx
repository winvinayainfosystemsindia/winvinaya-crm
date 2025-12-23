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
import { Search, Edit, Accessible, VerifiedUser } from '@mui/icons-material';
import { format, isToday, parseISO } from 'date-fns';
import candidateService from '../../services/candidateService';
import type { CandidateListItem } from '../../models/candidate';

interface ScreeningTableProps {
	type: 'unscreened' | 'screened';
	onAction: (action: 'screen' | 'edit', candidate: CandidateListItem) => void;
}

const ScreeningTable: React.FC<ScreeningTableProps> = ({ type, onAction }) => {
	const theme = useTheme();
	const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof CandidateListItem>('created_at');

	useEffect(() => {
		fetchCandidates();
	}, [page, rowsPerPage, type]);

	const fetchCandidates = async () => {
		setLoading(true);
		try {
			const fetcher = type === 'unscreened' ? candidateService.getUnscreened : candidateService.getScreened;
			const response = await fetcher(page * rowsPerPage, rowsPerPage);

			// If response is paginated (items, total), handle it
			const items = Array.isArray(response) ? response : response.items;
			const total = Array.isArray(response) ? items.length + (page * rowsPerPage) + (items.length === rowsPerPage ? 1 : 0) : response.total;

			setCandidates(items);
			setTotalCount(total);
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

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'd MMM yyyy');
		} catch {
			return '-';
		}
	};

	// Client-side filtering on the retained page (matching CandidateTable behavior)
	const filteredCandidates = candidates
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

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			{/* Header with Search */}
			<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d5dbdb', bgcolor: '#fafafa' }}>
				<TextField
					placeholder={`Search ${type === 'unscreened' ? 'unscreened' : 'screened'} candidates...`}
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
				<Table sx={{ minWidth: 650 }} aria-label="screening table">
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							{[
								{ id: 'name', label: 'Name' },
								{ id: 'email', label: 'Email' },
								{ id: 'phone', label: 'Phone' },
								{ id: 'city', label: 'Location' },
								{ id: 'created_at', label: 'Registered Date' },
							].map((headCell) => (
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
											{type === 'screened' && (
												<Tooltip title="Verified Screening">
													<VerifiedUser sx={{ color: '#4caf50', fontSize: 20 }} />
												</Tooltip>
											)}
											{isToday(parseISO(candidate.created_at)) && (
												<Chip
													label="New"
													size="small"
													color="primary"
													sx={{
														height: 20,
														fontSize: '0.65rem',
														fontWeight: 'bold',
														bgcolor: '#e3f2fd',
														color: '#1976d2'
													}}
												/>
											)}
										</Box>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{candidate.email}
										</Typography>
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
											{formatDate(candidate.created_at)}
										</Typography>
									</TableCell>
									<TableCell align="right">
										{type === 'unscreened' ? (
											<Button
												variant="contained"
												size="small"
												onClick={() => onAction('screen', candidate)}
												sx={{
													textTransform: 'none',
													bgcolor: '#1976d2',
													'&:hover': { bgcolor: '#115293' }
												}}
											>
												Screen
											</Button>
										) : (
											<Button
												variant="outlined"
												size="small"
												startIcon={<Edit fontSize="small" />}
												onClick={() => onAction('edit', candidate)}
												sx={{ textTransform: 'none' }}
											>
												Edit Screening
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
				count={totalCount}
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

export default ScreeningTable;
