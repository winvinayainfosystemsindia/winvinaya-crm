import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidates, fetchFilterOptions } from '../../store/slices/candidateSlice';
import { fetchAllAllocations, fetchTrainingBatches } from '../../store/slices/trainingSlice';
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
	{ id: 'gender', label: 'Gender', default: true, group: 'general' },
	{ id: 'email', label: 'Email', default: true, group: 'general' },
	{ id: 'phone', label: 'Phone', default: true, group: 'general' },
	{ id: 'whatsapp_number', label: 'WhatsApp', default: false, group: 'general' },
	{ id: 'dob', label: 'DOB', default: false, group: 'general' },
	{ id: 'city', label: 'City', default: false, group: 'general' },
	{ id: 'district', label: 'District', default: false, group: 'general' },
	{ id: 'state', label: 'State', default: false, group: 'general' },
	{ id: 'pincode', label: 'Pincode', default: false, group: 'general' },
	{ id: 'education_level', label: 'Education', default: false, group: 'general' },
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
	{ id: 'documents_uploaded', label: 'Uploaded Documents', default: false, group: 'screening' },
	{ id: 'screening_comments', label: 'Screening Reason', default: false, group: 'screening' },

	// Counseling Info
	{ id: 'counseling_status', label: 'Counseling Status', default: true, group: 'counseling' },
	{ id: 'counselor_name', label: 'Counselor', default: false, group: 'counseling' },
	{ id: 'counseling_date', label: 'Counseling Date', default: false, group: 'counseling' },
	{ id: 'feedback', label: 'Counseling Feedback', default: false, group: 'counseling' },
	{ id: 'skills', label: 'Counseling Skills', default: false, group: 'counseling' },
	{ id: 'questions', label: 'Assignment Q&A', default: false, group: 'counseling' },
	{ id: 'workexperience', label: 'Counseling Work Experience', default: false, group: 'counseling' },
];

const TRAINING_COLUMNS = [
	// Candidate Details
	{ id: 'name', label: 'Candidate Name', default: true, group: 'candidate' },
	{ id: 'gender', label: 'Gender', default: true, group: 'candidate' },
	{ id: 'disability_type', label: 'Disability Type', default: true, group: 'candidate' },
	{ id: 'email', label: 'Email', default: true, group: 'candidate' },
	{ id: 'phone', label: 'Phone', default: true, group: 'candidate' },

	// Batch Details
	{ id: 'batch_name', label: 'Batch Name', default: true, group: 'batch' },
	{ id: 'batch_status', label: 'Batch Status', default: false, group: 'batch' },
	{ id: 'domain', label: 'Domain', default: false, group: 'batch' },
	{ id: 'training_mode', label: 'Training Mode', default: false, group: 'batch' },
	{ id: 'courses', label: 'Course(s)', default: false, group: 'batch' },
	{ id: 'duration', label: 'Duration', default: false, group: 'batch' },

	// Progress
	{ id: 'status', label: 'Training Status', default: false, group: 'progress' },
	{ id: 'attendance_percentage', label: 'Attendance (%)', default: false, group: 'progress' },
	{ id: 'assessment_score', label: 'Assessment Mark', default: false, group: 'progress' },
	{ id: 'created_at', label: 'Allocation Date', default: false, group: 'progress' },
];

const Reports: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const dispatch = useAppDispatch();
	const { list: candidates, total, loading, filterOptions } = useAppSelector((state) => state.candidates);
	const [dynamicFieldDefs, setDynamicFieldDefs] = useState<any[]>([]);

	// Columns State - derived from reportType
	const [columns, setColumns] = useState<any[]>([]);
	const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

	// Query Params State
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [filters, setFilters] = useState<Record<string, any>>({});
	const [reportType, setReportType] = useState('candidate');

	const { allocations, total: trainingTotal, loading: trainingLoading, batches } = useAppSelector((state) => state.training);

	const isTraining = reportType === 'training';
	const reportData = isTraining ? allocations : candidates;
	const reportTotal = isTraining ? trainingTotal : total;
	const reportLoading = isTraining ? trainingLoading : loading;

	// Fetch dynamic fields & initialize columns based on reportType
	useEffect(() => {
		const setupColumns = async () => {
			try {
				let currentCols: any[] = [];
				if (reportType === 'candidate') {
					const [screeningFields, counselingFields] = await Promise.all([
						settingsService.getFields('screening'),
						settingsService.getFields('counseling')
					]);

					const dynamicCols: any[] = [];
					if (screeningFields) {
						screeningFields.forEach(field => {
							dynamicCols.push({
								id: `screening_others.${field.name}`,
								label: field.label,
								default: false,
								group: 'screening'
							});
						});
					}
					if (counselingFields) {
						counselingFields.forEach(field => {
							dynamicCols.push({
								id: `counseling_others.${field.name}`,
								label: field.label,
								default: false,
								group: 'counseling'
							});
						});
					}
					setDynamicFieldDefs([...(screeningFields || []), ...(counselingFields || [])]);
					currentCols = [...ALL_COLUMNS, ...dynamicCols];
				} else {
					currentCols = TRAINING_COLUMNS;
				}

				setColumns(currentCols);
				setVisibleColumns(currentCols.filter(c => c.default).map(c => c.id));
			} catch (error) {
				console.error("Failed to setup columns", error);
			}
		};

		setupColumns();
	}, [reportType]);

	// Data Fetching
	const fetchData = useCallback(() => {
		dispatch(fetchCandidates({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search,
			gender: filters.gender,
			disability_types: filters.disability_type?.join(','),
			education_levels: filters.education_level?.join(','),
			cities: filters.city?.join(','),
			counseling_status: filters.counseling_status,
			screening_status: filters.screening_status,
			disability_percentages: filters.disability_percentage ? `${filters.disability_percentage.min || 0}-${filters.disability_percentage.max || 100}` : undefined,
			screening_reasons: filters.screening_reason?.join(','),
			extraFilters: Object.keys(filters)
				.filter(key => key.startsWith('screening_others.') || key.startsWith('counseling_others.'))
				.reduce((acc, key) => {
					const val = filters[key];
					if (val && (!Array.isArray(val) || val.length > 0)) {
						acc[key] = Array.isArray(val) ? val.join(',') : val;
					}
					return acc;
				}, {} as Record<string, string>)
		}));
	}, [dispatch, page, rowsPerPage, search, filters]);

	const fetchTrainingData = useCallback(() => {
		dispatch(fetchAllAllocations({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search,
			batch_id: filters.batch_id,
			status: filters.status,
			is_dropout: filters.is_dropout,
			gender: filters.gender,
			disability_types: filters.disability_type?.join(','),
			sortBy: 'created_at',
			sortOrder: 'desc'
		}));
	}, [dispatch, page, rowsPerPage, search, filters]);

	useEffect(() => {
		dispatch(fetchFilterOptions());
		dispatch(fetchTrainingBatches({}));
	}, [dispatch]);

	useEffect(() => {
		if (isTraining) {
			fetchTrainingData();
		} else {
			fetchData();
		}
	}, [isTraining, fetchData, fetchTrainingData]);

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
		// Generate export data by mapping candidates/allocations to an object where keys are column labels
		const exportData = reportData.map(item => {
			const rowData: Record<string, any> = {};

			// We iterate through columns to maintain order if possible, or just visibleColumns
			visibleColumns.forEach(virtColId => {
				const col = columns.find(ac => ac.id === virtColId);
				if (!col) return;

				let val: any = undefined;

				if (isTraining) {
					const allocation = item as any;
					if (virtColId === 'batch_name') val = allocation.batch?.batch_name;
					else if (virtColId === 'batch_status') val = allocation.batch?.status;
					else if (virtColId === 'domain') val = allocation.batch?.domain;
					else if (virtColId === 'training_mode') val = allocation.batch?.training_mode;
					else if (virtColId === 'courses') {
						if (Array.isArray(allocation.batch?.courses)) {
							val = allocation.batch.courses.map((c: any) => typeof c === 'string' ? c : c.name).join(', ');
						} else {
							val = '-';
						}
					}
					else if (virtColId === 'duration') {
						const dur = allocation.batch?.duration;
						let dateStr = '';
						if (allocation.batch?.start_date) {
							dateStr = format(new Date(allocation.batch.start_date), 'dd MMM yyyy');
							if (allocation.batch?.approx_close_date) {
								dateStr += ` to ${format(new Date(allocation.batch.approx_close_date), 'dd MMM yyyy')}`;
							}
						}

						if (dur && (dur.weeks || dur.days)) {
							val = `${dur.weeks || 0} weeks, ${dur.days || 0} days${dateStr ? ` (${dateStr})` : ''}`;
						} else {
							val = dateStr || '-';
						}
					}
					else if (virtColId === 'name') val = allocation.candidate?.name;
					else if (virtColId === 'gender') val = allocation.candidate?.gender;
					else if (virtColId === 'email') val = allocation.candidate?.email;
					else if (virtColId === 'phone') val = allocation.candidate?.phone;
					else if (virtColId === 'disability_type') val = allocation.candidate?.disability_details?.disability_type || allocation.candidate?.disability_details?.type;
					else if (virtColId === 'attendance_percentage') val = allocation.attendance_percentage !== null ? `${allocation.attendance_percentage}%` : '-';
					else if (virtColId === 'assessment_score') val = allocation.assessment_score !== null ? allocation.assessment_score : '-';
					else val = allocation[virtColId];
				} else {
					const c = item as any;
					// 1. Precise Data Extraction
					if (virtColId.startsWith('screening_others.')) {
						const fieldName = virtColId.substring('screening_others.'.length);
						val = (c.screening?.others as any)?.[fieldName] ?? (c as any)[fieldName];
					} else if (virtColId.startsWith('counseling_others.')) {
						const fieldName = virtColId.substring('counseling_others.'.length);
						val = (c.counseling?.others as any)?.[fieldName] ?? (c as any)[fieldName];
					} else {
						// Fallback: Check top-level, then screening, then counseling
						val = (c as any)[virtColId];
						if (val === undefined || val === null) {
							if (col.group === 'screening' && c.screening) val = (c.screening as any)[virtColId];
							if ((val === undefined || val === null) && col.group === 'counseling' && c.counseling) val = (c.counseling as any)[virtColId];
						}
					}
				}

				// 2. Normalization & Formatting
				if ((virtColId === 'created_at' || virtColId === 'dob' || virtColId === 'counseling_date' || virtColId === 'screening_date' || virtColId === 'screening_updated_at') && val) {
					try {
						val = format(new Date(val), 'dd MMM yyyy');
					} catch (e) {
						val = '-';
					}
				}

				if (Array.isArray(val)) {
					if (virtColId === 'skills') {
						val = val.map((s: any) => `${s.name} (${s.level})`).join(', ');
					} else if (virtColId === 'family_details') {
						val = val.map((f: any) => `${f.relation}: ${f.name} (${f.occupation || 'N/A'})`).join('; ');
					} else if (virtColId === 'questions') {
						val = val.map((q: any) => `Q: ${q.question} A: ${q.answer}`).join(' | ');
					} else if (virtColId === 'workexperience') {
						val = val.map((w: any) => `${w.job_title} at ${w.company}`).join(', ');
					} else if (virtColId === 'documents_uploaded') {
						val = val.join(', ');
					} else {
						val = val.map((v: any) => String(v)).join(', ');
					}
				} else if (typeof val === 'boolean') {
					val = val ? 'Yes' : 'No';
				} else if (val === null || val === undefined) {
					val = '';
				}

				rowData[col.label] = val;
			});

			return rowData;
		});

		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Report');
		XLSX.writeFile(wb, `${isTraining ? 'Training' : 'Candidates'}_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
	};

	// Filter Field Configuration
	const filterFields: FilterField[] = isTraining ? [
		{
			key: 'batch_id',
			label: 'Batch Name',
			type: 'single-select',
			options: batches.map(b => ({ label: b.batch_name, value: String(b.id) }))
		},
		{
			key: 'status',
			label: 'Training Status',
			type: 'single-select',
			options: [
				{ label: 'Allocated', value: 'allocated' },
				{ label: 'In Training', value: 'in_training' },
				{ label: 'Completed', value: 'completed' },
				{ label: 'Dropped Out', value: 'dropped_out' },
				{ label: 'Placed', value: 'placed' }
			]
		},
		{ key: 'is_dropout', label: 'Is Dropout', type: 'boolean' },
		{
			key: 'gender',
			label: 'Gender',
			type: 'single-select',
			options: [
				{ value: 'male', label: 'Male' },
				{ value: 'female', label: 'Female' },
				{ value: 'other', label: 'Other' }
			]
		},
		{
			key: 'disability_type',
			label: 'Disability Type',
			type: 'multi-select',
			options: filterOptions.disability_types?.map(v => ({ label: v, value: v })) || []
		},
	] : [
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
		},
		{
			key: 'gender',
			label: 'Gender',
			type: 'single-select',
			options: [
				{ value: 'male', label: 'Male' },
				{ value: 'female', label: 'Female' },
				{ value: 'other', label: 'Other' }
			]
		}
	];

	// Add dynamic filters
	if (!isTraining) {
		columns.forEach(col => {
			if (col.id.startsWith('screening_others.') || col.id.startsWith('counseling_others.')) {
				const fieldName = col.id.split('.')[1];
				const fieldDef = dynamicFieldDefs.find(fd => fd.name === fieldName);

				if (fieldDef) {
					const isOptionField = fieldDef.field_type === 'single_choice' || fieldDef.field_type === 'multiple_choice';

					filterFields.push({
						key: col.id,
						label: col.label,
						type: isOptionField ? 'multi-select' : 'text',
						options: isOptionField ? (fieldDef.options || []).map((o: any) => ({
							value: typeof o === 'string' ? o : o.value,
							label: typeof o === 'string' ? o : o.label
						})) : []
					});
				}
			}
		});
	}

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
					onRefresh={isTraining ? fetchTrainingData : fetchData}
					onExport={handleExport}
					loading={reportLoading}
					reportType={reportType}
					onReportTypeChange={setReportType}
				/>

				<ReportToolbar
					search={search}
					onSearchChange={handleSearchChange}
					total={reportTotal}
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
					loading={reportLoading}
					columns={columns}
					visibleColumns={visibleColumns}
					data={reportData as any}
					total={reportTotal}
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
