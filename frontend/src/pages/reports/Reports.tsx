import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidates, fetchFilterOptions } from '../../store/slices/candidateSlice';

import ReportHeader from '../../components/reports/ReportHeader';
import ReportToolbar from '../../components/reports/ReportToolbar';
import ReportTable from '../../components/reports/ReportTable';
import ColumnSelector from '../../components/reports/ColumnSelector';
import FilterDrawer, { type FilterField } from '../../components/common/FilterDrawer';

// Column definitions
const ALL_COLUMNS = [
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

const Reports: React.FC = () => {
	const dispatch = useAppDispatch();
	const { list: candidates, total, loading, filterOptions } = useAppSelector((state) => state.candidates);

	// Visibility and UI State
	const [visibleColumns, setVisibleColumns] = useState<string[]>(
		ALL_COLUMNS.filter(c => c.default).map(c => c.id)
	);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

	// Query Params State
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [filters, setFilters] = useState<Record<string, any>>({});

	// Data Fetching
	const fetchData = useCallback(() => {
		dispatch(fetchCandidates({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search,
			disability_types: filters.disability_type?.join(','),
			education_levels: filters.education_level?.join(','),
			cities: filters.city?.join(','),
			counseling_status: filters.counseling_status
		}));
	}, [dispatch, page, rowsPerPage, search, filters]);

	useEffect(() => {
		dispatch(fetchFilterOptions());
	}, [dispatch]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Handlers
	const handleSearchChange = (value: string) => {
		setSearch(value);
		setPage(0);
	};

	const handleFilterChange = (key: string, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }));
	};

	const handleApplyFilters = () => {
		setPage(0);
		setFilterDrawerOpen(false);
	};

	const handleClearFilters = () => {
		setFilters({});
		setPage(0);
	};

	const toggleColumn = (colId: string) => {
		setVisibleColumns(prev =>
			prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
		);
	};

	const handleExport = () => {
		const exportData = candidates.map(c => {
			const filtered: any = {};
			visibleColumns.forEach(colId => {
				const col = ALL_COLUMNS.find(ac => ac.id === colId);
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

	// Filter Field Configuration
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

	return (
		<Box sx={{
			height: 'calc(100vh - 48px)', // Adjust based on Sidebar.tsx (Dense AppBar is 48px)
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
			backgroundColor: '#f8f9fa'
		}}>
			{/* Persistent Header & Toolbar */}
			<Box sx={{
				p: 3,
				pb: 1,
				zIndex: 10,
				backgroundColor: '#f8f9fa',
				borderBottom: '1px solid #eaeded'
			}}>
				<ReportHeader
					onRefresh={fetchData}
					onExport={handleExport}
					loading={loading}
				/>

				<ReportToolbar
					search={search}
					onSearchChange={handleSearchChange}
					total={total}
					filterCount={Object.values(filters).flat().filter(v => v && (!Array.isArray(v) || v.length > 0)).length}
					onFilterClick={() => setFilterDrawerOpen(true)}
				>
					<ColumnSelector
						anchorEl={anchorEl}
						onOpen={(e) => setAnchorEl(e.currentTarget)}
						onClose={() => setAnchorEl(null)}
						columns={ALL_COLUMNS}
						visibleColumns={visibleColumns}
						onToggleColumn={toggleColumn}
					/>
				</ReportToolbar>
			</Box>

			{/* Scrollable Table Area */}
			<Box sx={{
				flex: 1,
				overflow: 'hidden',
				p: 3,
				pt: 0,
				display: 'flex',
				flexDirection: 'column'
			}}>
				<ReportTable
					loading={loading}
					columns={ALL_COLUMNS}
					visibleColumns={visibleColumns}
					data={candidates}
					total={total}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={(v) => {
						setRowsPerPage(v);
						setPage(0);
					}}
				/>
			</Box>

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
