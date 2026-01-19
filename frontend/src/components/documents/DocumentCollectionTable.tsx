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
import { Search, CloudUpload as UploadIcon, Accessible, VerifiedUser } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchScreenedCandidates } from '../../store/slices/candidateSlice';
import type { CandidateListItem } from '../../models/candidate';

interface DocumentCollectionTableProps {
	type: 'pending' | 'collected';
}

const DocumentCollectionTable: React.FC<DocumentCollectionTableProps> = ({ type }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { list: candidates, loading, total: totalCount } = useAppSelector((state) => state.candidates);

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof CandidateListItem>('created_at');

	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

	const fetchCandidatesData = async () => {
		dispatch(fetchScreenedCandidates({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			counselingStatus: 'selected',
			search: debouncedSearchTerm,
			documentStatus: type,
			sortBy: orderBy,
			sortOrder: order
		}));
	};

	useEffect(() => {
		fetchCandidatesData();
	}, [page, rowsPerPage, type, debouncedSearchTerm, order, orderBy]);

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

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Helper to render document status chips
	const renderStatusChips = (candidate: CandidateListItem) => {
		const docs = candidate.documents_uploaded || [];
		const collected: string[] = [];
		const pending: string[] = [];

		if (docs.includes('resume')) collected.push('Resume'); else pending.push('Resume');
		if (candidate.is_disabled) {
			if (docs.includes('disability_certificate')) collected.push('Disability'); else pending.push('Disability');
		}
		if (docs.includes('10th_certificate')) collected.push('10th'); else pending.push('10th');
		if (docs.includes('12th_certificate')) collected.push('12th'); else pending.push('12th');
		if (docs.includes('degree_certificate')) collected.push('Degree'); else pending.push('Degree');
		if (docs.includes('pan_card')) collected.push('PAN'); else pending.push('PAN');
		if (docs.includes('aadhar_card')) collected.push('Aadhar'); else pending.push('Aadhar');

		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{collected.map(d => (
						<Chip key={d} label={d} size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
					))}
					{pending.map(d => (
						<Chip key={d} label={d} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', color: 'text.secondary', borderColor: '#e0e0e0' }} />
					))}
				</Box>
			</Box>
		);
	};

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
					placeholder={`Search ${type === 'pending' ? 'pending' : 'collected'} candidates...`}
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
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem' }}>
								<TableSortLabel
									active={orderBy === 'name'}
									direction={orderBy === 'name' ? order : 'asc'}
									onClick={() => handleRequestSort('name')}
								>
									Candidate
								</TableSortLabel>
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', display: { xs: 'none', md: 'table-cell' } }}>
								Contact
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', display: { xs: 'none', md: 'table-cell' } }}>
								Location
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem' }}>
								Documents
							</TableCell>
							<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem' }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">Loading...</Typography>
								</TableCell>
							</TableRow>
						) : candidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">No candidates found in this category.</Typography>
								</TableCell>
							</TableRow>
						) : (
							candidates.map((candidate) => (
								<TableRow key={candidate.public_id} sx={{ '&:hover': { bgcolor: '#f5f8fa' } }}>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Box>
												<Typography variant="body2" sx={{ fontWeight: 500 }}>
													{candidate.name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{candidate.email}
												</Typography>
											</Box>
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
										<Typography variant="body2" color="text.secondary">{candidate.phone}</Typography>
									</TableCell>
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
										<Typography variant="body2" color="text.secondary">
											{candidate.city}, {candidate.state}
										</Typography>
									</TableCell>
									<TableCell>
										{renderStatusChips(candidate)}
									</TableCell>
									<TableCell align="right">
										<Button
											variant="contained"
											size="small"
											startIcon={<UploadIcon />}
											onClick={() => navigate(`/candidates/documents/${candidate.public_id}`)}
											sx={{
												textTransform: 'none',
												bgcolor: '#1976d2',
												'&:hover': { bgcolor: '#115293' }
											}}
										>
											Collect
										</Button>
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
						}
					}}
				/>
			</Box>
		</Paper>
	);
};

export default DocumentCollectionTable;
