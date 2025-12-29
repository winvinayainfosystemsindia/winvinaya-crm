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
	Badge
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
import FilterDrawer, { type FilterField } from '../common/FilterDrawer';
import candidateService from '../../services/candidateService';

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

	// Filter state - must be declared before fetchCandidatesData
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [filters, setFilters] = useState({
		disability_type: [] as string[],
		education_level: [] as string[],
		city: [] as string[],
		counseling_status: '' as string
	});
	const [filterOptions, setFilterOptions] = useState<{
		disability_types: string[];
		education_levels: string[];
		cities: string[];
		counseling_statuses: string[];
	}>({ disability_types: [], education_levels: [], cities: [], counseling_statuses: [] });

	const fetchCandidatesData = async () => {
		// Build filter query parameters
		const filterParams: any = {
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: debouncedSearchTerm,
			sortBy: orderBy,
			sortOrder: order
		};

		// Add filter parameters if they have values
		if (filters.disability_type.length > 0) {
			filterParams.disability_types = filters.disability_type.join(',');
		}
		if (filters.education_level.length > 0) {
			filterParams.education_levels = filters.education_level.join(',');
		}
		if (filters.city.length > 0) {
			filterParams.cities = filters.city.join(',');
		}
		if (filters.counseling_status) {
			filterParams.counseling_status = filters.counseling_status;
		}

		dispatch(fetchCandidates(filterParams));
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
	}, [page, rowsPerPage, debouncedSearchTerm, order, orderBy, filters]);

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

	// Fetch filter options on component mount
	useEffect(() => {
		const fetchFilterOptions = async () => {
			try {
				const options = await candidateService.getFilterOptions();
				setFilterOptions(options);
			} catch (error) {
				console.error('Failed to fetch filter options:', error);
			}
		};
		fetchFilterOptions();
	}, []);

	const handleFilterOpen = () => {
		setFilterDrawerOpen(true);
	};

	const handleFilterClose = () => {
		setFilterDrawerOpen(false);
	};

	const handleFilterChange = (key: string, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }));
	};

	const applyFilters = () => {
		setPage(0);
		handleFilterClose();
	};

	const clearFilters = () => {
		setFilters({
			disability_type: [],
			education_level: [],
			city: [],
			counseling_status: ''
		});
		setPage(0);
	};

	// Calculate active filter count
	const activeFilterCount = (
		filters.disability_type.length +
		filters.education_level.length +
		filters.city.length +
		(filters.counseling_status ? 1 : 0)
	);

	// Configure filter fields for FilterDrawer
	const filterFields: FilterField[] = [
		{
			key: 'disability_type',
			label: 'Disability Type',
			type: 'multi-select',
			options: filterOptions.disability_types.map(type => ({ value: type, label: type }))
		},
		{
			key: 'education_level',
			label: 'Education/Degree',
			type: 'multi-select',
			options: filterOptions.education_levels.map(edu => ({ value: edu, label: edu }))
		},
		{
			key: 'counseling_status',
			label: 'Counseling Status',
			type: 'single-select',
			options: filterOptions.counseling_statuses.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))
		},
		{
			key: 'city',
			label: 'Location (City)',
			type: 'multi-select',
			options: filterOptions.cities.map(city => ({ value: city, label: city }))
		}
	];

	// No client-side filtering needed - all filtering is done server-side
	const filteredCandidates = candidates;

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

						<Badge badgeContent={activeFilterCount} color="primary">
							<Button
								variant="outlined"
								startIcon={<FilterList />}
								onClick={handleFilterOpen}
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
						</Badge>
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

					{/* Reusable Filter Drawer */}
					<FilterDrawer
						open={filterDrawerOpen}
						onClose={handleFilterClose}
						fields={filterFields}
						activeFilters={filters}
						onFilterChange={handleFilterChange}
						onClearFilters={clearFilters}
						onApplyFilters={applyFilters}
					/>
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
