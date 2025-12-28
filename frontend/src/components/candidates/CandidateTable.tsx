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
	IconButton,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	Typography,
	useTheme,
	Tooltip,
	Chip,
	TableSortLabel,
	Popover
} from '@mui/material';
import { Search, Add, Edit, Visibility, Accessible, FilterList, Refresh } from '@mui/icons-material';
import {
	CircularProgress,
	Stack
} from '@mui/material';
import { format, isToday, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidates } from '../../store/slices/candidateSlice';
import type { CandidateListItem } from '../../models/candidate';

interface CandidateTableProps {
	onAddCandidate?: () => void;
	onEditCandidate?: (candidateId: string) => void;
	onViewCandidate?: (candidateId: string) => void;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ onAddCandidate, onEditCandidate, onViewCandidate }) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { list: candidates, loading, total: totalCount } = useAppSelector((state) => state.candidates);

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof CandidateListItem>('created_at');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

	const fetchCandidatesData = async () => {
		dispatch(fetchCandidates({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: debouncedSearchTerm,
			sortBy: orderBy,
			sortOrder: order
		}));
	};

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Initial fetch and fetch on pagination change
	useEffect(() => {
		fetchCandidatesData();
	}, [page, rowsPerPage, debouncedSearchTerm, order, orderBy]);

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

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [filters, setFilters] = useState({
		disability_type: [] as string[],
		education_level: [] as string[],
		city: [] as string[]
	});

	const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleFilterClose = () => {
		setAnchorEl(null);
	};

	const handleFilterChange = (field: keyof typeof filters, value: string) => {
		setFilters(prev => {
			const current = prev[field];
			const newValues = current.includes(value)
				? current.filter(item => item !== value)
				: [...current, value];
			return { ...prev, [field]: newValues };
		});
		setPage(0);
	};

	const clearFilters = () => {
		setFilters({
			disability_type: [],
			education_level: [],
			city: []
		});
		setPage(0);
		handleFilterClose();
	};

	// Unique values for filters
	const uniqueDisabilities = Array.from(new Set(candidates.map(c => c.disability_type).filter(Boolean))) as string[];
	const uniqueEducation = Array.from(new Set(candidates.map(c => c.education_level).filter(Boolean))) as string[];
	const uniqueCities = Array.from(new Set(candidates.map(c => c.city).filter(Boolean))) as string[];

	// Filtering logic (now strictly for specific category filters)
	// Sorting and Search are handled by the backend
	const filteredCandidates = candidates.filter(candidate => {
		const matchesFilters =
			(filters.disability_type.length === 0 || filters.disability_type.includes(candidate.disability_type || '')) &&
			(filters.education_level.length === 0 || filters.education_level.includes(candidate.education_level || '')) &&
			(filters.city.length === 0 || filters.city.includes(candidate.city));

		return matchesFilters;
	});

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'd MMM yyyy');
		} catch {
			return '-';
		}
	};

	const toTitleCase = (str: string) => {
		if (!str) return '';
		return str.replace(
			/\w\S*/g,
			(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
		);
	};

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			{/* Header with Search and Add Button */}
			<Box sx={{
				p: 2,
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				justifyContent: 'space-between',
				alignItems: { xs: 'stretch', sm: 'center' },
				gap: 2,
				borderBottom: '1px solid #d5dbdb',
				bgcolor: '#fafafa'
			}}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
					<TextField
						placeholder="Search candidates..."
						value={searchTerm}
						onChange={handleSearch}
						size="small"
						fullWidth={true}
						sx={{
							maxWidth: { xs: '100%', sm: '300px' },
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

				<Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Tooltip title="Refresh Data">
							<IconButton
								onClick={fetchCandidatesData}
								disabled={loading}
								sx={{
									border: '1px solid #d5dbdb',
									borderRadius: 1,
									color: 'text.secondary',
									'&:hover': {
										borderColor: theme.palette.primary.main,
										color: theme.palette.primary.main,
										bgcolor: 'white'
									}
								}}
							>
								<Refresh fontSize="small" className={loading ? 'spin-animation' : ''} />
							</IconButton>
						</Tooltip>

						<Button
							variant="outlined"
							startIcon={<FilterList />}
							onClick={handleFilterClick}
							sx={{
								borderColor: '#d5dbdb',
								color: 'text.secondary',
								textTransform: 'none',
								px: { xs: 1, sm: 2 },
								'&:hover': {
									borderColor: theme.palette.primary.main,
									color: theme.palette.primary.main,
									bgcolor: 'white'
								}
							}}
						>
							Filter
						</Button>
					</Box>

					<style>
						{`
							@keyframes spin {
								from { transform: rotate(0deg); }
								to { transform: rotate(360deg); }
							}
							.spin-animation {
								animation: spin 1s linear infinite;
							}
						`}
					</style>

					<Popover
						open={Boolean(anchorEl)}
						anchorEl={anchorEl}
						onClose={handleFilterClose}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
					>
						<Box sx={{ p: 2, width: 300 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography variant="subtitle1" fontWeight="bold">Filters</Typography>
								<Button size="small" onClick={clearFilters}>Clear all</Button>
							</Box>

							{/* Disability Type Filter */}
							<Typography variant="body2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Disability Type</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{uniqueDisabilities.map((type) => (
									<Chip
										key={type}
										label={type}
										size="small"
										onClick={() => handleFilterChange('disability_type', type)}
										color={filters.disability_type.includes(type) ? 'primary' : 'default'}
										variant={filters.disability_type.includes(type) ? 'filled' : 'outlined'}
										sx={{ cursor: 'pointer' }}
									/>
								))}
							</Box>

							{/* Education Level Filter */}
							<Typography variant="body2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Education/Degree</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{uniqueEducation.map((edu) => (
									<Chip
										key={edu}
										label={edu}
										size="small"
										onClick={() => handleFilterChange('education_level', edu)}
										color={filters.education_level.includes(edu) ? 'primary' : 'default'}
										variant={filters.education_level.includes(edu) ? 'filled' : 'outlined'}
										sx={{ cursor: 'pointer' }}
									/>
								))}
							</Box>

							{/* City Filter */}
							<Typography variant="body2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>City</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{uniqueCities.slice(0, 10).map((city) => (
									<Chip
										key={city}
										label={city}
										size="small"
										onClick={() => handleFilterChange('city', city)}
										color={filters.city.includes(city) ? 'primary' : 'default'}
										variant={filters.city.includes(city) ? 'filled' : 'outlined'}
										sx={{ cursor: 'pointer' }}
									/>
								))}
							</Box>
						</Box>
					</Popover>
					<Button
						variant="contained"
						startIcon={<Add />}
						onClick={onAddCandidate}
						sx={{
							bgcolor: '#ec7211',
							color: 'white',
							textTransform: 'none',
							fontWeight: 600,
							px: { xs: 1, sm: 2 },
							'&:hover': {
								bgcolor: '#eb5f07',
							}
						}}
					>
						Add Candidate
					</Button>
				</Box>
			</Box>

			{/* Table */}
			<TableContainer>
				<Table sx={{ minWidth: 650 }} aria-label="candidate table">
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							{[
								{ id: 'name', label: 'Name', hideOnMobile: false },
								{ id: 'email', label: 'Email', hideOnMobile: true },
								{ id: 'phone', label: 'Phone', hideOnMobile: true },
								{ id: 'city', label: 'Location', hideOnMobile: true },
								{ id: 'disability_type', label: 'Disability', hideOnMobile: false },
								{ id: 'created_at', label: 'Date', hideOnMobile: true },
							].map((headCell) => (
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
							Array.from(new Array(rowsPerPage)).map((_, index) => (
								<TableRow key={`skeleton-${index}`}>
									<TableCell colSpan={7} sx={{ py: 2.5 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<CircularProgress size={20} thickness={5} />
											<Typography variant="body2" color="text.secondary">Loading data...</Typography>
										</Box>
									</TableCell>
								</TableRow>
							))
						) : filteredCandidates.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} align="center" sx={{ py: 10 }}>
									<Stack spacing={1} alignItems="center">
										<Typography variant="h6" color="text.secondary">No candidates found</Typography>
										<Typography variant="body2" color="text.disabled">
											Try adjusting your filters or search terms
										</Typography>
									</Stack>
								</TableCell>
							</TableRow>
						) : (
							filteredCandidates.map((candidate) => (
								<TableRow
									key={candidate.public_id}
									sx={{
										height: '60px', // Fixed height for stability
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
												{toTitleCase(candidate.name)}
											</Typography>
											{(candidate.is_disabled || candidate.disability_type) && (
												<Tooltip title={candidate.disability_type || "Person with Disability"}>
													<Accessible color="primary" fontSize="small" />
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
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
										<Typography variant="body2" color="text.secondary">
											{candidate.email}
										</Typography>
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
									<TableCell>
										<Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '120px' }}>
											{candidate.is_disabled || candidate.disability_type
												? (candidate.disability_type || 'Unspecified')
												: 'Non-PwD'
											}
										</Typography>
									</TableCell>
									<TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
										<Typography variant="body2" color="text.secondary">
											{formatDate(candidate.created_at)}
										</Typography>
									</TableCell>
									<TableCell align="right">
										<Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
											<Tooltip title="View Details">
												<IconButton
													size="small"
													onClick={() => onViewCandidate?.(candidate.public_id)}
													sx={{
														color: 'text.secondary',
														'&:hover': { color: 'primary.main' }
													}}
												>
													<Visibility fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Edit Candidate">
												<IconButton
													size="small"
													onClick={() => onEditCandidate?.(candidate.public_id)}
													sx={{
														color: 'text.secondary',
														'&:hover': { color: 'warning.main' }
													}}
												>
													<Edit fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
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

export default CandidateTable;
