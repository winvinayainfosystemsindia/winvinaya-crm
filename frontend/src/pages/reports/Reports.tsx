import React, { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	IconButton,
	TextField,
	InputAdornment,
	Checkbox,
	Menu,
	MenuItem,
	CircularProgress,
	TablePagination,
	FormControlLabel,
	Divider,
	Tooltip,
	Chip, useTheme, useMediaQuery, Badge
} from '@mui/material';
import {
	Search as SearchIcon,
	FileDownload as ExportIcon,
	ViewColumn as ColumnIcon,
	Refresh as RefreshIcon,
	FilterList as FilterIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { candidateService } from '../../services/candidateService';
import type { CandidateListItem } from '../../models/candidate';
import FilterDrawer from '../../components/common/FilterDrawer';
import type { FilterField } from '../../components/common/FilterDrawer';





// Professional AWS-style Table Header Cell
const StyledHeaderCell = ({ children, sx = {} }: { children: React.ReactNode; sx?: any }) => (
	<TableCell
		sx={{
			backgroundColor: '#fafafa',
			fontWeight: 700,
			fontSize: '0.8rem',
			color: '#5f6368',
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
			py: 1.5,
			borderBottom: '2px solid #eaeded',
			...sx
		}}
	>
		{children}
	</TableCell>
);

const Reports: React.FC = () => {
	const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
	const [total, setTotal] = useState(0);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);

	// Filter State
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [filters, setFilters] = useState<Record<string, any>>({});

	interface FilterOptions {
		disability_types: string[];
		education_levels: string[];
		cities: string[];
		counseling_statuses: string[];
	}
	const [filterOptions, setFilterOptions] = useState<FilterOptions>({
		disability_types: [],
		education_levels: [],
		cities: [],
		counseling_statuses: []
	});


	// Dynamic Column Management
	const allColumns = [

		{ id: 'name', label: 'Candidate Name', default: true },
		{ id: 'email', label: 'Email', default: true },
		{ id: 'phone', label: 'Phone', default: true },
		{ id: 'dob', label: 'DOB', default: true },
		{ id: 'disability_type', label: 'Disability Type', default: true },
		{ id: 'education_level', label: 'Education', default: true },
		{ id: 'screening_status', label: 'Screening Status', default: true },
		{ id: 'counseling_status', label: 'Counseling Status', default: true },
		{ id: 'gender', label: 'Gender', default: false },
		{ id: 'whatsapp_number', label: 'WhatsApp', default: false },
		{ id: 'city', label: 'City', default: false },
		{ id: 'district', label: 'District', default: false },
		{ id: 'state', label: 'State', default: false },
		{ id: 'pincode', label: 'Pincode', default: false },
		{ id: 'counselor_name', label: 'Counselor', default: false },
		{ id: 'counseling_date', label: 'Counseling Date', default: false },
		{ id: 'documents_uploaded', label: 'Uploaded Documents', default: false },
		{ id: 'created_at', label: 'Registration Date', default: false },
	];


	const [visibleColumns, setVisibleColumns] = useState<string[]>(
		allColumns.filter(c => c.default).map(c => c.id)
	);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			// Fetch data from existing getAll endpoint which now has more fields
			const response = await candidateService.getAll(
				page * rowsPerPage,
				rowsPerPage,
				search,
				undefined, // sort_by
				undefined, // sort_order
				filters.disability_type ? (Array.isArray(filters.disability_type) ? filters.disability_type.join(',') : filters.disability_type) : undefined,
				filters.education_level ? (Array.isArray(filters.education_level) ? filters.education_level.join(',') : filters.education_level) : undefined,
				filters.city ? (Array.isArray(filters.city) ? filters.city.join(',') : filters.city) : undefined,
				filters.counseling_status

			);

			setCandidates(response.items);
			setTotal(response.total);
		} catch (error) {
			console.error('Error fetching report data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const loadOptions = async () => {
			try {
				const options = await candidateService.getFilterOptions();
				setFilterOptions(options);
			} catch (err) {
				console.error('Error loading filter options:', err);
			}
		};
		loadOptions();
	}, []);

	useEffect(() => {
		fetchData();
	}, [page, rowsPerPage, search, filters]);

	const handleFilterChange = (key: string, value: any) => {
		setFilters(prev => ({
			...prev,
			[key]: value
		}));
	};

	const handleApplyFilters = () => {
		setPage(0);
		fetchData();
		setFilterDrawerOpen(false);
	};

	const handleClearFilters = () => {
		setFilters({});
		setPage(0);
	};

	const filterFields: FilterField[] = [
		{
			key: 'disability_type',
			label: 'Disability Type',
			type: 'multi-select',
			options: filterOptions.disability_types.map(v => ({ value: v, label: v }))
		},
		{
			key: 'education_level',
			label: 'Education Level',
			type: 'multi-select',
			options: filterOptions.education_levels.map(v => ({ value: v, label: v }))
		},
		{
			key: 'city',
			label: 'City',
			type: 'multi-select',
			options: filterOptions.cities.map(v => ({ value: v, label: v }))
		},
		{
			key: 'counseling_status',
			label: 'Counseling Status',
			type: 'single-select',
			options: filterOptions.counseling_statuses.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
		}
	];



	const handleExport = () => {
		// Filter columns based on visibility for export
		const exportData = candidates.map(c => {
			const filtered: any = {};
			visibleColumns.forEach(colId => {
				const col = allColumns.find(ac => ac.id === colId);
				if (col) {
					let val = (c as any)[colId];
					if ((colId === 'created_at' || colId === 'dob' || colId === 'counseling_date') && val) {
						val = format(new Date(val), 'dd-MM-yyyy');
					}
					if (colId === 'documents_uploaded' && Array.isArray(val)) {
						val = val.join(', ');
					}
					filtered[col.label] = val || '-';
				}
			});
			return filtered;
		});

		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Candidates Report");
		XLSX.writeFile(wb, `WinVinaya_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
	};


	const toggleColumn = (colId: string) => {
		setVisibleColumns(prev =>
			prev.includes(colId)
				? prev.filter(id => id !== colId)
				: [...prev, colId]
		);
	};

	return (
		<Box sx={{ p: 4 }}>
			{/* Page Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
				<Box sx={{ mb: 3 }}>
					<Typography
						variant={isMobile ? "h5" : "h4"}
						component="h1"
						sx={{
							fontWeight: 300,
							color: 'text.primary',
							mb: 0.5
						}}
					>
						Candidates Report
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Generate and customize candidate data reports for export.
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={fetchData}
						size="small"
						sx={{ borderColor: '#d5dbdb', color: '#545b64', '&:hover': { borderColor: '#aab7b7', backgroundColor: '#f2f3f3' } }}
					>
						Refresh
					</Button>
					<Button
						variant="contained"
						startIcon={<ExportIcon />}
						onClick={handleExport}
						size="small"
						sx={{ backgroundColor: '#ff9900', color: '#fff', '&:hover': { backgroundColor: '#ec7211' }, fontWeight: 700 }}
					>
						Export to Excel
					</Button>
				</Box>
			</Box>

			{/* Actions Bar */}
			<Paper elevation={0} sx={{ p: 2, mb: 1, border: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
					<TextField
						placeholder="Search candidates by name, email, phone..."
						variant="outlined"
						size="small"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						sx={{ width: 400, '& .MuiOutlinedInput-root': { height: 32 } }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon sx={{ color: '#545b64', fontSize: 18 }} />
								</InputAdornment>
							),
						}}
					/>
					<Button
						variant="outlined"
						startIcon={
							<Badge badgeContent={Object.values(filters).flat().length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16, top: 2, right: -2 } }}>
								<FilterIcon sx={{ fontSize: 18 }} />
							</Badge>
						}
						onClick={() => setFilterDrawerOpen(true)}
						sx={{
							height: 32,
							borderColor: '#d5dbdb',
							color: '#545b64',
							textTransform: 'none',
							fontSize: '0.85rem',
							fontWeight: 500,
							'&:hover': { borderColor: '#aab7b7', backgroundColor: '#f2f3f3' }
						}}
					>
						Filter
					</Button>
					<Typography variant="body2" sx={{ color: '#545b64', ml: 2 }}>
						{total} results found
					</Typography>
				</Box>

				<Box>
					<Tooltip title="Configure Columns">
						<IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
							<ColumnIcon sx={{ color: '#545b64' }} />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={() => setAnchorEl(null)}
						PaperProps={{ sx: { width: 250, maxHeight: 400 } }}
					>
						<Box sx={{ px: 2, py: 1 }}>
							<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Select Columns</Typography>
						</Box>
						<Divider />
						{allColumns.map(col => (
							<MenuItem key={col.id} dense onClick={() => toggleColumn(col.id)}>
								<FormControlLabel
									control={<Checkbox size="small" checked={visibleColumns.includes(col.id)} />}
									label={<Typography variant="body2">{col.label}</Typography>}
									sx={{ m: 0 }}
								/>
							</MenuItem>
						))}
					</Menu>
				</Box>
			</Paper>

			{/* Main Table Container */}
			<TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaeded', borderRadius: '0px 0px 4px 4px' }}>
				{loading && (
					<Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1 }}>
						<CircularProgress size={40} thickness={4} sx={{ color: '#ff9900' }} />
					</Box>
				)}
				<Table size="small" stickyHeader sx={{ minWidth: 1200 }}>
					<TableHead>
						<TableRow>
							{allColumns.filter(c => visibleColumns.includes(c.id)).map(col => (
								<StyledHeaderCell key={col.id}>
									{col.label}
								</StyledHeaderCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{candidates.length > 0 ? (
							candidates.map((candidate, idx) => (
								<TableRow
									key={candidate.public_id}
									sx={{
										backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
										'&:hover': { backgroundColor: '#f2f3f3' }
									}}
								>
									{allColumns.filter(c => visibleColumns.includes(c.id)).map(col => {
										let val: any = (candidate as any)[col.id];

										// Formatting for specific fields
										if (col.id === 'created_at' && val) val = format(new Date(val), 'dd MMM yyyy');
										if (col.id === 'dob' && val) val = format(new Date(val), 'dd MMM yyyy');
										if (col.id === 'counseling_date' && val) val = format(new Date(val), 'dd MMM yyyy');

										if (col.id === 'documents_uploaded' && Array.isArray(val)) {
											return (
												<TableCell key={col.id} sx={{ py: 1, fontSize: '0.85rem', color: '#202124', borderRight: '1px solid #f2f3f3' }}>
													<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
														{val.length > 0 ? val.map((doc: string, i: number) => (
															<Chip key={i} label={doc} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
														)) : '-'}
													</Box>
												</TableCell>
											);
										}

										if ((col.id === 'disability_type' || col.id === 'screening_status' || col.id === 'counseling_status') && val) {
											const getStatusColor = (v: string) => {
												const lowerV = v.toLowerCase();
												if (lowerV === 'completed' || lowerV === 'selected') return { bg: '#e7f4e4', text: '#2e7d32' };
												if (lowerV === 'pending') return { bg: '#fff7e6', text: '#ef6c00' };
												if (lowerV === 'rejected') return { bg: '#fdecea', text: '#d32f2f' };
												return { bg: '#f2f3f3', text: '#545b64' };
											};
											const colors = getStatusColor(val);
											return (
												<TableCell key={col.id} sx={{ py: 1, fontSize: '0.85rem', color: '#202124', borderRight: '1px solid #f2f3f3' }}>
													<Chip
														label={val}
														size="small"
														sx={{
															borderRadius: 1,
															backgroundColor: colors.bg,
															color: colors.text,
															fontWeight: 600,
															fontSize: '0.7rem'
														}}
													/>
												</TableCell>
											);
										}

										return (
											<TableCell key={col.id} sx={{ py: 1, fontSize: '0.85rem', color: '#202124', borderRight: '1px solid #f2f3f3' }}>
												{val || '-'}
											</TableCell>
										);
									})}

								</TableRow>
							))
						) : !loading && (
							<TableRow>
								<TableCell colSpan={visibleColumns.length} sx={{ py: 10, textAlign: 'center' }}>
									<Typography variant="body1" color="text.secondary">No candidate data available for the current selection.</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
				<TablePagination
					component="div"
					count={total}
					page={page}
					onPageChange={(_, p) => setPage(p)}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
					rowsPerPageOptions={[25, 50, 100]}
					sx={{ borderTop: '1px solid #eaeded', backgroundColor: '#fafafa' }}
				/>
			</TableContainer>

			<FilterDrawer
				open={filterDrawerOpen}
				onClose={() => setFilterDrawerOpen(false)}
				fields={filterFields}
				activeFilters={filters}
				onFilterChange={handleFilterChange}
				onClearFilters={handleClearFilters}
				onApplyFilters={handleApplyFilters}
			/>

		</Box>

	);
};

export default Reports;
