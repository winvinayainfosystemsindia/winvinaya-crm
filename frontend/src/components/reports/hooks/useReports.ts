import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchFilterOptions } from '../../../store/slices/candidateSlice';
import { fetchTrainingBatches } from '../../../store/slices/trainingSlice';
import { settingsService } from '../../../services/settingsService';
import unifiedReportService from '../../../services/unifiedReportService';
import useToast from '../../../hooks/useToast';
import { UNIFIED_COLUMNS } from '../constants';

export const useReports = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	
	const { filterOptions } = useAppSelector((state) => state.candidates);
	const { batches } = useAppSelector((state) => state.training);

	const [dynamicFieldDefs, setDynamicFieldDefs] = useState<any[]>([]);
	const [columns, setColumns] = useState<any[]>([]);
	const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

	const [search, setSearch] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [filters, setFilters] = useState<Record<string, any>>({});
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const [reportData, setReportData] = useState<any[]>([]);
	const [reportTotal, setReportTotal] = useState(0);
	const [reportLoading, setReportLoading] = useState(false);

	// Setup Columns — unified, single pass
	useEffect(() => {
		const setupColumns = async () => {
			try {
				const [screeningFields, counselingFields] = await Promise.all([
					settingsService.getFields('screening'),
					settingsService.getFields('counseling')
				]);

				const dynamicCols: any[] = [];
				if (screeningFields) {
					screeningFields.forEach((field: any) => {
						dynamicCols.push({
							id: `screening_others.${field.name}`,
							label: field.label,
							default: false,
							group: 'screening'
						});
					});
				}
				if (counselingFields) {
					counselingFields.forEach((field: any) => {
						dynamicCols.push({
							id: `counseling_others.${field.name}`,
							label: field.label,
							default: false,
							group: 'counseling'
						});
					});
				}
				setDynamicFieldDefs([...(screeningFields || []), ...(counselingFields || [])]);

				const allCols = [...UNIFIED_COLUMNS, ...dynamicCols];
				setColumns(allCols);
				setVisibleColumns(allCols.filter(c => c.default).map(c => c.id));
			} catch (error) {
				toast.error("Failed to setup columns. Some data might be missing.");
			}
		};

		setupColumns();
	}, [toast]);

	// Data Fetching — single unified API call
	const fetchData = useCallback(async () => {
		setReportLoading(true);
		try {
			// Build extra filters for dynamic fields
			const extraFilters: Record<string, string> = {};
			Object.keys(filters).forEach(key => {
				if (key.startsWith('screening_others.') || key.startsWith('counseling_others.')) {
					const val = filters[key];
					if (val && (!Array.isArray(val) || val.length > 0)) {
						extraFilters[key] = Array.isArray(val) ? val.join(',') : val;
					}
				}
			});

			const result = await unifiedReportService.getReport({
				skip: page * rowsPerPage,
				limit: rowsPerPage,
				search: search || undefined,
				gender: filters.gender || undefined,
				disability_types: filters.disability_type?.join(',') || undefined,
				education_levels: filters.education_level?.join(',') || undefined,
				cities: filters.city?.join(',') || undefined,
				disability_percentages: filters.disability_percentage ? `${filters.disability_percentage.min || 0}-${filters.disability_percentage.max || 100}` : undefined,
				year_of_passing: filters.year_of_passing?.join(',') || undefined,
				year_of_experience: filters.year_of_experience ? `${filters.year_of_experience.min || 0}-${filters.year_of_experience.max || 50}` : undefined,
				is_experienced: filters.is_experienced === 'true' ? true : filters.is_experienced === 'false' ? false : undefined,
				currently_employed: filters.currently_employed === 'true' ? true : filters.currently_employed === 'false' ? false : undefined,
				registration_type: filters.registration_type || undefined,
				status_of_beneficiary: filters.status_of_beneficiary?.join(',') || undefined,
				created_from: filters.created_from || undefined,
				created_to: filters.created_to || undefined,
				// Screening
				screening_status: filters.screening_status || undefined,
				consent_status: filters.consent_status || undefined,
				screening_reason: filters.screening_reason?.join(',') || undefined,
				// Counseling
				counseling_status: filters.counseling_status || undefined,
				// Documents
				has_resume: filters.has_resume === true ? true : filters.has_resume === false ? false : undefined,
				has_disability_cert: filters.has_disability_cert === true ? true : filters.has_disability_cert === false ? false : undefined,
				// Training
				batch_ids: filters.batch_id?.join(',') || undefined,
				batch_tag: filters.batch_tag || undefined,
				training_status: filters.training_status || undefined,
				is_dropout: filters.is_dropout === true ? true : undefined,
				// Mock interview
				mock_interview_status: filters.mock_interview_status || undefined,
				// Analysis
				recommendation: filters.recommendation || undefined,
				// Placement
				company_id: filters.company_id ? Number(filters.company_id) : undefined,
				job_role_id: filters.job_role_id || undefined,
				placement_status: filters.placement_status || undefined,
				offer_response: filters.offer_response || undefined,
				joining_status: filters.joining_status || undefined,
				// Dynamic
				extra_filters: Object.keys(extraFilters).length > 0 ? JSON.stringify(extraFilters) : undefined,
			});

			setReportData(result.items);
			setReportTotal(result.total);
		} catch (error) {
			toast.error("Failed to fetch report data");
		} finally {
			setReportLoading(false);
		}
	}, [page, rowsPerPage, search, filters, toast]);

	useEffect(() => {
		dispatch(fetchFilterOptions());
		dispatch(fetchTrainingBatches({}));
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

	const selectAllColumns = () => {
		setVisibleColumns(columns.map(c => c.id));
	};

	const deselectAllColumns = () => {
		setVisibleColumns([]);
	};

	const handleExportCurrentPage = () => {
		const exportData = reportData.map(item => {
			const rowData: Record<string, any> = {};
			visibleColumns.forEach(colId => {
				const col = columns.find(c => c.id === colId);
				if (!col) return;
				let val = item[colId];

				// Handle dynamic field columns
				if (colId.startsWith('screening_others.')) {
					const fieldName = colId.substring('screening_others.'.length);
					val = item.screening_others?.[fieldName];
				} else if (colId.startsWith('counseling_others.')) {
					const fieldName = colId.substring('counseling_others.'.length);
					val = item.counseling_others?.[fieldName];
				}

				// Format arrays
				if (Array.isArray(val)) {
					if (colId === 'skills') {
						val = val.map((s: any) => `${s.name} (${s.level})`).join(', ');
					} else if (colId === 'family_details') {
						val = val.map((f: any) => `${f.relation}: ${f.name}`).join('; ');
					} else if (colId === 'questions') {
						val = val.map((q: any) => `Q: ${q.question} A: ${q.answer}`).join(' | ');
					} else if (colId === 'workexperience') {
						val = val.map((w: any) => `${w.job_title} at ${w.company}`).join(', ');
					} else if (colId === 'doc_types_uploaded' || colId === 'documents_uploaded') {
						val = val.join(', ');
					} else {
						val = val.map(String).join(', ');
					}
				} else if (typeof val === 'boolean') {
					val = val ? 'Yes' : 'No';
				} else if (val === null || val === undefined) {
					val = '';
				}

				// Date formatting
				if ((colId.includes('_at') || colId.includes('date') || colId === 'dob') && val) {
					try {
						val = format(new Date(val), 'dd MMM yyyy');
					} catch {
						// keep as is
					}
				}

				rowData[col.label] = val;
			});
			return rowData;
		});

		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Report');
		XLSX.writeFile(wb, `Unified_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
	};

	const handleExportAll = async () => {
		setExportLoading(true);
		try {
			const visibleColData = visibleColumns.map(id => {
				const col = columns.find(c => c.id === id);
				return { id, label: col?.label || id };
			});

			// Build extra filters for dynamic fields
			const extraFilters: Record<string, string> = {};
			Object.keys(filters).forEach(key => {
				if (key.startsWith('screening_others.') || key.startsWith('counseling_others.')) {
					const val = filters[key];
					if (val && (!Array.isArray(val) || val.length > 0)) {
						extraFilters[key] = Array.isArray(val) ? val.join(',') : val;
					}
				}
			});

			const response = await unifiedReportService.exportReport({
				search: search || undefined,
				gender: filters.gender || undefined,
				disability_types: filters.disability_type?.join(',') || undefined,
				education_levels: filters.education_level?.join(',') || undefined,
				cities: filters.city?.join(',') || undefined,
				counseling_status: filters.counseling_status || undefined,
				screening_status: filters.screening_status || undefined,
				registration_type: filters.registration_type || undefined,
				status_of_beneficiary: filters.status_of_beneficiary?.join(',') || undefined,
				extra_filters: Object.keys(extraFilters).length > 0 ? JSON.stringify(extraFilters) : undefined,
				columns: JSON.stringify(visibleColData),
			});

			toast.success(response.message || "Export initiated. You will receive an email with the report shortly.");
		} catch (error) {
			toast.error("Failed to export report. Please try again later.");
		} finally {
			setExportLoading(false);
		}
	};

	const handleExport = (type: 'page' | 'all') => {
		if (type === 'all') {
			handleExportAll();
		} else {
			handleExportCurrentPage();
		}
		setExportDialogOpen(false);
	};

	return {
		search,
		handleSearchChange,
		page,
		setPage,
		rowsPerPage,
		setRowsPerPage,
		filters,
		handleFilterChange,
		handleApplyFilters,
		handleClearFilters,
		columns,
		visibleColumns,
		toggleColumn,
		selectAllColumns,
		deselectAllColumns,
		anchorEl,
		setAnchorEl,
		filterDrawerOpen,
		setFilterDrawerOpen,
		exportDialogOpen,
		setExportDialogOpen,
		exportLoading,
		handleExport,
		reportData,
		reportTotal,
		reportLoading,
		filterOptions,
		batches,
		dynamicFieldDefs,
		onRefresh: fetchData
	};
};
