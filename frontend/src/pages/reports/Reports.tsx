import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidates, fetchFilterOptions } from '../../store/slices/candidateSlice';
import { settingsService } from '../../services/settingsService';

import ReportHeader from '../../components/reports/ReportHeader';
import ReportToolbar from '../../components/reports/ReportToolbar';
import ReportTable from '../../components/reports/ReportTable';
import ColumnSelector from '../../components/reports/ColumnSelector';
import FilterDrawer, { type FilterField } from '../../components/common/FilterDrawer';

// Column definitions
const ALL_COLUMNS = [
	// General Info
	{ id: 'name', label: 'Candidate Name', default: true, group: 'general' },
	{ id: 'gender', label: 'Gender', default: false, group: 'general' },
	{ id: 'email', label: 'Email', default: true, group: 'general' },
	{ id: 'phone', label: 'Phone', default: true, group: 'general' },
	{ id: 'whatsapp_number', label: 'WhatsApp', default: false, group: 'general' },
	{ id: 'dob', label: 'DOB', default: true, group: 'general' },
	{ id: 'city', label: 'City', default: false, group: 'general' },
	{ id: 'district', label: 'District', default: false, group: 'general' },
	{ id: 'state', label: 'State', default: false, group: 'general' },
	{ id: 'pincode', label: 'Pincode', default: false, group: 'general' },
	{ id: 'education_level', label: 'Education', default: true, group: 'general' },
	{ id: 'disability_type', label: 'Disability Type', default: true, group: 'general' },
	{ id: 'disability_percentage', label: 'Disability Percentage', default: false, group: 'general' },
	{ id: 'created_at', label: 'Registration Date', default: false, group: 'general' },

	// Screening Info
	{ id: 'screening_status', label: 'Screening Status', default: true, group: 'screening' },
	{ id: 'source_of_info', label: 'Where you know about us', default: false, group: 'screening' },
	{ id: 'family_annual_income', label: 'Family Annual Income', default: false, group: 'screening' },
	{ id: 'screened_by_name', label: 'Screened By', default: false, group: 'screening' },
	{ id: 'screening_date', label: 'Screened Date', default: false, group: 'screening' },
	{ id: 'screening_updated_at', label: 'Screening Update Date', default: false, group: 'screening' },
	{ id: 'family_details', label: 'Family Details', default: false, group: 'screening' },
	{ id: 'family_details', label: 'Family Details', default: false, group: 'screening' },
	{ id: 'documents_uploaded', label: 'Uploaded Documents', default: false, group: 'screening' },
	{ id: 'screening_comments', label: 'Screening Reason', default: false, group: 'screening' },

	// Counseling Info
	{ id: 'counseling_status', label: 'Counseling Status', default: true, group: 'counseling' },
	{ id: 'counselor_name', label: 'Counselor', default: false, group: 'counseling' },
	{ id: 'counseling_date', label: 'Counseling Date', default: false, group: 'counseling' },
	{ id: 'feedback', label: 'Counseling Feedback', default: false, group: 'counseling' },
	{ id: 'skills', label: 'Counseling Skills', default: false, group: 'counseling' },
	{ id: 'questions', label: 'Assessment Q&A', default: false, group: 'counseling' },
	{ id: 'workexperience', label: 'Counseling Work Experience', default: false, group: 'counseling' },
];

const Reports: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const dispatch = useAppDispatch();
	const { list: candidates, total, loading, filterOptions } = useAppSelector((state) => state.candidates);

	// Columns State
	const [columns, setColumns] = useState<any[]>(ALL_COLUMNS);

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
	const [reportType, setReportType] = useState('candidate');

	// Fetch dynamic fields
	useEffect(() => {
		const fetchDynamicColumns = async () => {
			try {
				const [screeningFields, counselingFields] = await Promise.all([
					settingsService.getFields('screening'),
					settingsService.getFields('counseling')
				]);

				const dynamicCols: any[] = [];

				if (screeningFields && screeningFields.length > 0) {
					screeningFields.forEach(field => {
						dynamicCols.push({
							id: `screening_others.${field.name}`,
							label: field.label,
							default: false,
							group: 'screening'
						});
					});
				}

				if (counselingFields && counselingFields.length > 0) {
					counselingFields.forEach(field => {
						dynamicCols.push({
							id: `counseling_others.${field.name}`,
							label: field.label,
							default: false,
							group: 'counseling'
						});
					});
				}

				setColumns([...ALL_COLUMNS, ...dynamicCols]);
			} catch (error) {
				console.error("Failed to fetch dynamic fields for reports", error);
			}
		};

		fetchDynamicColumns();
	}, []);

	// Data Fetching
	const fetchData = useCallback(() => {
		dispatch(fetchCandidates({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search,
			disability_types: filters.disability_type?.join(','),
			education_levels: filters.education_level?.join(','),
			cities: filters.city?.join(','),
			counseling_status: filters.counseling_status,
			screening_status: filters.screening_status,
			disability_percentages: filters.disability_percentage ? `${filters.disability_percentage.min || 0}-${filters.disability_percentage.max || 100}` : undefined,
			screening_reasons: filters.screening_reason?.join(',')
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
				const col = columns.find(ac => ac.id === colId);
				if (col) {
					// Handle regular fields and flattened fields
					let val: any;

					if (colId.startsWith('screening_others.')) {
						const fieldName = colId.split('.')[1];
						val = (c.screening?.others as any)?.[fieldName];
					} else if (colId.startsWith('counseling_others.')) {
						const fieldName = colId.split('.')[1];
						val = (c.counseling?.others as any)?.[fieldName];
					} else {
						val = (c as any)[colId];
					}

					// If field is missing from list item, try to get it from nested objects if available
					if (val === undefined || val === null) {
						if (col.group === 'counseling' && (c as any).counseling && !colId.startsWith('counseling_others.')) {
							val = (c as any).counseling[colId];
						}
					}

					// Date Formatting
					if ((colId === 'created_at' || colId === 'dob' || colId === 'counseling_date' || colId === 'screening_date' || colId === 'screening_updated_at') && val) {
						try {
							val = format(new Date(val), 'dd-MM-yyyy');
						} catch (e) {
							val = String(val);
						}
					}

					// Document Uploads
					if (colId === 'documents_uploaded' && Array.isArray(val)) {
						val = val.join(', ');
					}

					// Family Details (Flattened or format properly)
					if (colId === 'family_details' && Array.isArray(val)) {
						val = val.map((f: any) => {
							const details = [];
							if (f.occupation) details.push(f.occupation);
							if (f.company_name) details.push(f.company_name);
							if (f.position) details.push(f.position);
							const detailsStr = details.length > 0 ? ` - ${details.join(', ')}` : '';
							return `${f.relation}: ${f.name} (${f.phone || 'N/A'})${detailsStr}`;
						}).join('; ');
					}

					// Counseling Skills
					if (colId === 'skills' && Array.isArray(val)) {
						val = val.map((s: any) => `${s.name} (${s.level})`).join(', ');
					}

					// Counseling Questions
					if (colId === 'questions' && Array.isArray(val)) {
						val = val.map((q: any) => `Q: ${q.question} | A: ${q.answer}`).join(' ; ');
					}

					// Counseling Work Experience
					if (colId === 'workexperience' && Array.isArray(val)) {
						val = val.map((w: any) => `${w.job_title} at ${w.company} (${w.years_of_experience})`).join(' ; ');
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
		},
		{
			key: 'screening_status',
			label: 'Screening Status',
			type: 'single-select',
			options: filterOptions.screening_statuses.map(v => ({ value: v, label: v }))
		},
		{
			key: 'disability_percentage',
			label: 'Disability Percentage (Min-Max)',
			type: 'range'
		},
		{
			key: 'screening_reason',
			label: 'Screening Reason',
			type: 'multi-select',
			options: (filterOptions.screening_reasons || []).map(v => ({ value: v, label: v }))
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
				p: isMobile ? 1.5 : 3,
				pb: 1,
				zIndex: 10,
				backgroundColor: '#f8f9fa',
				borderBottom: '1px solid #eaeded'
			}}>
				<ReportHeader
					onRefresh={fetchData}
					onExport={handleExport}
					loading={loading}
					reportType={reportType}
					onReportTypeChange={setReportType}
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
						columns={columns}
						visibleColumns={visibleColumns}
						onToggleColumn={toggleColumn}
					/>
				</ReportToolbar>
			</Box>

			{/* Scrollable Table Area */}
			<Box sx={{
				flex: 1,
				overflow: 'hidden',
				p: isMobile ? 1.5 : 3,
				pt: 0,
				display: 'flex',
				flexDirection: 'column'
			}}>
				<ReportTable
					loading={loading}
					columns={columns}
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
