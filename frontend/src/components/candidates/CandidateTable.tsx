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
import { Search, Add, Edit, Visibility, Accessible, FilterList } from '@mui/icons-material';
import { format, isToday, parseISO } from 'date-fns';
import candidateService from '../../services/candidateService';
import type { CandidateListItem } from '../../models/candidate';

interface CandidateTableProps {
	onAddCandidate?: () => void;
	onEditCandidate?: (candidateId: string) => void;
	onViewCandidate?: (candidateId: string) => void;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ onAddCandidate, onEditCandidate, onViewCandidate }) => {
	const theme = useTheme();
	const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [order, setOrder] = useState<'asc' | 'desc'>('desc');
	const [orderBy, setOrderBy] = useState<keyof CandidateListItem>('created_at');

	// Initial fetch and fetch on pagination change
	useEffect(() => {
		fetchCandidates();
	}, [page, rowsPerPage]);

	const fetchCandidates = async () => {
		setLoading(true);
		try {
			const response = await candidateService.getAll(page * rowsPerPage, rowsPerPage);
			setCandidates(response);
			// Assuming backend doesn't return total count in list response yet, 
			// we approximate or set it. If response length < rowsPerPage, we know limit.
			// For proper pagination, backend should return total count. 
			// For now, mirroring UserTable logic which seems to accumulate count or assume infinite scroll style?
			// Actually UserTable sets totalCount = response.length + (page * rowsPerPage). 
			// This works if we assume there are more pages until we get less than requested.
			setTotalCount(response.length + (page * rowsPerPage));
		} catch (error) {
			console.error('Failed to fetch candidates:', error);
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
	};

	const clearFilters = () => {
		setFilters({
			disability_type: [],
			education_level: [],
			city: []
		});
		handleFilterClose();
	};

	// Unique values for filters
	const uniqueDisabilities = Array.from(new Set(candidates.map(c => c.disability_type).filter(Boolean))) as string[];
	const uniqueEducation = Array.from(new Set(candidates.map(c => c.education_level).filter(Boolean))) as string[];
	const uniqueCities = Array.from(new Set(candidates.map(c => c.city).filter(Boolean))) as string[];

	// Sorting and Filtering logic
	const filteredCandidates = candidates
		.filter(candidate => {
			const matchesSearch =
				candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				candidate.phone.includes(searchTerm) ||
				candidate.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(candidate.disability_type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

			const matchesFilters =
				(filters.disability_type.length === 0 || filters.disability_type.includes(candidate.disability_type || '')) &&
				(filters.education_level.length === 0 || filters.education_level.includes(candidate.education_level || '')) &&
				(filters.city.length === 0 || filters.city.includes(candidate.city));

			return matchesSearch && matchesFilters;
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
			<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d5dbdb', bgcolor: '#fafafa' }}>
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
					<TextField
						placeholder="Search candidates..."
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

				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button
						variant="outlined"
						startIcon={<FilterList />}
						onClick={handleFilterClick}
						sx={{
							borderColor: '#d5dbdb',
							color: 'text.secondary',
							textTransform: 'none',
							'&:hover': {
								borderColor: theme.palette.primary.main,
								color: theme.palette.primary.main,
								bgcolor: 'white'
							}
						}}
					>
						Filter
					</Button>

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
								{ id: 'name', label: 'Name' },
								{ id: 'email', label: 'Email' },
								{ id: 'phone', label: 'Phone' },
								{ id: 'city', label: 'Location' },
								{ id: 'disability_type', label: 'Disability Type' },
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
									<Typography color="text.secondary">Loading candidates...</Typography>
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
											{candidate.is_disabled || candidate.disability_type
												? (candidate.disability_type || 'Unspecified')
												: 'Non-PwD'
											}
										</Typography>
									</TableCell>
									<TableCell>
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
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #d5dbdb', bgcolor: '#fafafa' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
						}
					}}
				/>
			</Box>
		</Paper>
	);
};

export default CandidateTable;
