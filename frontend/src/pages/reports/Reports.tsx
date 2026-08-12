import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

import {
	ReportHeader,
	ReportToolbar,
	ReportTable,
	ColumnSelector,
	ExportDialog,
	useReports
} from '../../components/reports';
import FilterDrawer, { type FilterField } from '../../components/common/drawer/FilterDrawer';
import { fetchJobRoles } from '../../store/slices/jobRoleSlice';
import { fetchCompanies } from '../../store/slices/companySlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const Reports: React.FC = () => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { list: jobRoles } = useAppSelector((state) => state.jobRoles);
	const { list: companies } = useAppSelector((state) => state.companies);
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const {
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
		onRefresh
	} = useReports();

	React.useEffect(() => {
		if (jobRoles.length === 0) {
			dispatch(fetchJobRoles({ limit: 1000 }));
		}
		if (companies.length === 0) {
			dispatch(fetchCompanies({ limit: 1000 }));
		}
	}, [dispatch, jobRoles.length, companies.length]);

	// ─── Unified Filter Field Configuration ───
	const filterFields: FilterField[] = [
		// General
		{
			key: 'registration_type',
			label: 'Source',
			type: 'single-select',
			section: 'General',
			options: (filterOptions.registration_types || []).map((v: string) => ({ value: v, label: v }))
		},
		{
			key: 'status_of_beneficiary',
			label: 'Beneficiary Status',
			type: 'multi-select',
			section: 'General',
			options: (filterOptions.beneficiary_statuses || []).map((v: string) => ({ value: v, label: v }))
		},
		{
			key: 'gender',
			label: 'Gender',
			type: 'single-select',
			section: 'General',
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
			section: 'General',
			options: (filterOptions.disability_types || []).map((v: string) => ({ value: v, label: v }))
		},
		{
			key: 'disability_percentage',
			label: 'Disability Percentage (Min-Max)',
			type: 'range',
			section: 'General'
		},
		{
			key: 'education_level',
			label: 'Education Level',
			type: 'multi-select',
			section: 'General',
			options: (filterOptions.education_levels || []).map((v: string) => ({ value: v, label: v }))
		},
		{
			key: 'city',
			label: 'City',
			type: 'multi-select',
			section: 'General',
			options: (filterOptions.cities || []).map((v: string) => ({ value: v, label: v }))
		},
		{
			key: 'year_of_passing',
			label: 'Year of Passing',
			type: 'multi-select',
			section: 'General',
			options: (filterOptions.years_of_passing || []).map((v: string) => ({ value: v, label: v }))
		},
		{
			key: 'created_from',
			label: 'Registration From',
			type: 'date',
			section: 'General'
		},
		{
			key: 'created_to',
			label: 'Registration To',
			type: 'date',
			section: 'General'
		},

		// Experience
		{
			key: 'is_experienced',
			label: 'Is Experienced?',
			type: 'single-select',
			section: 'Experience',
			options: [
				{ value: 'true', label: 'Yes' },
				{ value: 'false', label: 'No' }
			]
		},
		{
			key: 'year_of_experience',
			label: 'Years of Experience (Min-Max)',
			type: 'range',
			section: 'Experience'
		},
		{
			key: 'currently_employed',
			label: 'Currently Employed?',
			type: 'single-select',
			section: 'Experience',
			options: [
				{ value: 'true', label: 'Yes' },
				{ value: 'false', label: 'No' }
			]
		},

		// Screening
		{
			key: 'screening_status',
			label: 'Screening Status',
			type: 'single-select',
			section: 'Screening',
			options: (filterOptions.screening_statuses || []).map((v: string) => ({ value: v, label: v }))
		},
		{
			key: 'consent_status',
			label: 'Consent Status',
			type: 'single-select',
			section: 'Screening',
			options: [
				{ value: 'Pending', label: 'Pending' },
				{ value: 'Accepted', label: 'Accepted' }
			]
		},
		{
			key: 'screening_reason',
			label: 'Screening Reason',
			type: 'multi-select',
			section: 'Screening',
			options: (filterOptions.screening_reasons || []).map((v: string) => ({ value: v, label: v }))
		},

		// Counseling
		{
			key: 'counseling_status',
			label: 'Counseling Status',
			type: 'single-select',
			section: 'Counseling',
			options: (filterOptions.counseling_statuses || []).map((v: string) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
		},

		// Documents
		{
			key: 'has_resume',
			label: 'Has Resume?',
			type: 'boolean',
			section: 'Documents'
		},
		{
			key: 'has_disability_cert',
			label: 'Has Disability Certificate?',
			type: 'boolean',
			section: 'Documents'
		},

		// Training
		{
			key: 'batch_id',
			label: 'Batch Name',
			type: 'multi-select',
			section: 'Training',
			options: batches.map((b: any) => ({ label: b.batch_name, value: String(b.id) }))
		},
		{
			key: 'batch_tag',
			label: 'Batch Tag',
			type: 'text',
			section: 'Training'
		},
		{
			key: 'training_status',
			label: 'Training Status',
			type: 'single-select',
			section: 'Training',
			options: [
				{ label: 'Allocated', value: 'allocated' },
				{ label: 'In Training', value: 'in_training' },
				{ label: 'Completed', value: 'completed' },
				{ label: 'Dropped Out', value: 'dropped_out' },
				{ label: 'Moved to Placement', value: 'moved_to_placement' }
			]
		},
		{ key: 'is_dropout', label: 'Is Dropout', type: 'boolean', section: 'Training' },

		// Mock Interview
		{
			key: 'mock_interview_status',
			label: 'Mock Interview Status',
			type: 'single-select',
			section: 'Mock Interview',
			options: [
				{ label: 'Pending', value: 'pending' },
				{ label: 'Cleared', value: 'cleared' },
				{ label: 'Re-test', value: 're-test' },
				{ label: 'Rejected', value: 'rejected' },
				{ label: 'Absent', value: 'absent' }
			]
		},

		// Analysis
		{
			key: 'recommendation',
			label: 'Analysis Recommendation',
			type: 'single-select',
			section: 'Analysis',
			options: [
				{ label: 'Ready for Placement', value: 'ready_for_placement' },
				{ label: 'Needs Additional Training', value: 'needs_additional_training' },
				{ label: 'Assign DSR Project', value: 'assign_dsr_project' },
				{ label: 'Counseling Required', value: 'counseling_required' }
			]
		},
		{
			key: 'analysis_status',
			label: 'Analysis Status',
			type: 'single-select',
			section: 'Analysis',
			options: [
				{ label: 'In Progress', value: 'in-progress' },
				{ label: 'Completed', value: 'completed' }
			]
		},

		// Placement
		{
			key: 'company_id',
			label: 'Company',
			type: 'single-select',
			section: 'Placement',
			options: companies.map((c: any) => ({ label: c.name, value: String(c.id) }))
		},
		{
			key: 'job_role_id',
			label: 'Job Role',
			type: 'single-select',
			section: 'Placement',
			options: jobRoles.map((jr: any) => ({ label: jr.title, value: jr.public_id }))
		},
		{
			key: 'placement_status',
			label: 'Placement Status',
			type: 'single-select',
			section: 'Placement',
			options: [
				{ label: 'Mapped', value: 'mapped' },
				{ label: 'Shortlisted', value: 'shortlisted' },
				{ label: 'Interview L1', value: 'interview_l1' },
				{ label: 'Interview L2', value: 'interview_l2' },
				{ label: 'Technical Round', value: 'technical_round' },
				{ label: 'HR Round', value: 'hr_round' },
				{ label: 'Offer Made', value: 'offer_made' },
				{ label: 'Offer Accepted', value: 'offer_accepted' },
				{ label: 'Offer Rejected', value: 'offer_rejected' },
				{ label: 'Joined', value: 'joined' },
				{ label: 'Not Joined', value: 'not_joined' },
				{ label: 'Dropped', value: 'dropped' },
				{ label: 'Rejected', value: 'rejected' },
				{ label: 'On Hold', value: 'on_hold' }
			]
		},
		{
			key: 'offer_response',
			label: 'Offer Response',
			type: 'single-select',
			section: 'Placement Offer',
			options: [
				{ label: 'Pending', value: 'pending' },
				{ label: 'Accepted', value: 'accepted' },
				{ label: 'Rejected', value: 'rejected' },
				{ label: 'Negotiating', value: 'negotiating' }
			]
		},
		{
			key: 'joining_status',
			label: 'Joining Status',
			type: 'single-select',
			section: 'Placement Offer',
			options: [
				{ label: 'Not Joined', value: 'not_joined' },
				{ label: 'Joined', value: 'joined' },
				{ label: 'Deferred', value: 'deferred' }
			]
		},
	];

	// Add dynamic filters from screening/counseling dynamic fields
	columns.forEach(col => {
		if (col.id.startsWith('screening_others.') || col.id.startsWith('counseling_others.')) {
			const fieldName = col.id.split('.')[1];
			const fieldDef = dynamicFieldDefs.find((fd: any) => fd.name === fieldName);

			if (fieldDef) {
				const isOptionField = fieldDef.field_type === 'single_choice' || fieldDef.field_type === 'multiple_choice';

				filterFields.push({
					key: col.id,
					label: col.label,
					type: isOptionField ? 'multi-select' : 'text',
					section: col.id.startsWith('screening_others.') ? 'Screening' : 'Counseling',
					options: isOptionField ? (fieldDef.options || []).map((o: any) => ({
						value: typeof o === 'string' ? o : o.value,
						label: typeof o === 'string' ? o : o.label
					})) : []
				});
			}
		}
	});

	return (
		<Box sx={{
			height: 'calc(100vh - 48px)',
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
			backgroundColor: theme.palette.background.default
		}}>
			{/* Persistent Header & Toolbar */}
			<Box sx={{
				p: isMobile ? 1.5 : 3,
				pb: 1,
				zIndex: 10,
				backgroundColor: theme.palette.background.default,
				borderBottom: `1px solid ${theme.palette.divider}`
			}}>
				<ReportHeader
					onRefresh={onRefresh}
					onExport={() => setExportDialogOpen(true)}
					loading={reportLoading}
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
						onSelectAll={selectAllColumns}
						onDeselectAll={deselectAllColumns}
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
					onRowsPerPageChange={(v: number) => {
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

			<ExportDialog 
				open={exportDialogOpen}
				onClose={() => setExportDialogOpen(false)}
				onExport={handleExport}
				loading={exportLoading}
			/>
		</Box>
	);
};

export default Reports;
