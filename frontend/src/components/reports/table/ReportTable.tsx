import React from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	CircularProgress,
	Typography,
	Chip,
	useTheme,
	useMediaQuery,
	Stack,
	alpha
} from '@mui/material';
import { format } from 'date-fns';
import { 
	DataTableHead, 
	DataTableEmpty, 
	CustomTablePagination,
	type ColumnDefinition
} from '../../common/table';

interface Column {
	id: string;
	label: string;
	group?: string;
}

interface ReportTableProps {
	loading: boolean;
	columns: Column[];
	visibleColumns: string[];
	data: any[];
	total: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (newPage: number) => void;
	onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const stripHtml = (htmlStr: string): string => {
	if (!htmlStr || typeof htmlStr !== 'string') return '';
	if (!/<[a-z][\s\S]*>/i.test(htmlStr)) return htmlStr;
	let cleaned = htmlStr
		.replace(/<li[^>]*>/gi, '• ')
		.replace(/<\/li>/gi, '\n')
		.replace(/<\/p>/gi, '\n\n')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/\n\s*\n+/g, '\n\n')
		.trim();
	return cleaned
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
};

const ReportTable: React.FC<ReportTableProps> = ({
	loading,
	columns,
	visibleColumns,
	data,
	total,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const activeColumns = columns.filter(c => visibleColumns.includes(c.id));

	// Map to common ColumnDefinition
	const tableColumns: ColumnDefinition<any>[] = activeColumns.map(col => ({
		id: col.id,
		label: col.label,
		sortable: false
	}));

	const getStatusColor = (v: string) => {
		const lowerV = String(v).toLowerCase();
		if (lowerV.includes('completed') || lowerV.includes('selected') || lowerV.includes('accepted') || lowerV.includes('cleared') || lowerV.includes('joined') || lowerV === 'ready_for_placement') {
			return { bg: alpha(theme.palette.success.main, 0.1), text: theme.palette.success.main, border: alpha(theme.palette.success.main, 0.2) };
		}
		if (lowerV.includes('allocated') || lowerV.includes('pending') || lowerV.includes('in_training') || lowerV.includes('mapped') || lowerV.includes('shortlisted')) {
			return { bg: alpha(theme.palette.warning.main, 0.1), text: theme.palette.warning.main, border: alpha(theme.palette.warning.main, 0.2) };
		}
		if (lowerV.includes('rejected') || lowerV.includes('dropped') || lowerV.includes('failed')) {
			return { bg: alpha(theme.palette.error.main, 0.1), text: theme.palette.error.main, border: alpha(theme.palette.error.main, 0.2) };
		}
		return { bg: theme.palette.action.hover, text: theme.palette.text.secondary, border: theme.palette.divider };
	};

	// Helper for Card View Rendering
	const renderMobileCard = (item: any) => (
		<Paper
			elevation={0}
			key={item.public_id || item.name}
			sx={{
				p: 2,
				mb: 2,
				border: `1px solid ${theme.palette.divider}`,
				borderRadius: `${theme.shape.borderRadius}px`,
				backgroundColor: theme.palette.background.paper
			}}
		>
			<Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1.5 }}>
				{item.name}
			</Typography>
			<Stack spacing={1.5}>
				{activeColumns.filter(c => c.id !== 'name').map(col => (
					<Box key={col.id}>
						<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'block', mb: 0.25, textTransform: 'uppercase' }}>
							{col.label}
						</Typography>
						<Box sx={{ fontSize: theme.typography.body2.fontSize, color: theme.palette.text.primary }}>
							{renderCell(item, col.id)}
						</Box>
					</Box>
				))}
			</Stack>
		</Paper>
	);

	const renderCell = (item: any, colId: string) => {
		let val: any;

		if (colId.startsWith('screening_others.')) {
			const fieldName = colId.substring('screening_others.'.length);
			val = item.screening_others?.[fieldName];
		} else if (colId.startsWith('counseling_others.')) {
			const fieldName = colId.substring('counseling_others.'.length);
			val = item.counseling_others?.[fieldName];
		} else {
			val = item[colId];
		}

		// === Combined Placement / Training Summaries ===
		if ((colId === 'placement_summary' || colId === 'training_summary') && val) {
			const itemsList = String(val).split(' | ');
			return (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, py: 0.5, minWidth: 260 }}>
					{itemsList.map((st, i) => (
						<Paper
							key={i}
							variant="outlined"
							sx={{
								px: 1.25,
								py: 0.5,
								fontSize: '0.75rem',
								backgroundColor: alpha(theme.palette.primary.main, 0.03),
								borderColor: alpha(theme.palette.primary.main, 0.15),
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								gap: 1
							}}
						>
							<Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main, minWidth: 16 }}>
								{i + 1}.
							</Typography>
							<Typography variant="body2" sx={{ fontSize: '0.75rem', color: theme.palette.text.primary }}>
								{st}
							</Typography>
						</Paper>
					))}
				</Box>
			);
		}

		// === Multi-Item List Columns (Numbered stacked lines for exact cross-column alignment) ===
		const isMultiItemCol = [
			'mapped_companies', 'mapped_job_roles', 'job_role_statuses',
			'placement_statuses', 'placement_priorities', 'match_scores',
			'mapped_at_dates', 'batch_names', 'batch_statuses', 'batch_tags',
			'domains', 'training_modes', 'durations', 'training_statuses',
			'allocation_dates', 'mock_interview_statuses', 'mock_interview_ratings',
			'mock_interview_dates', 'mock_interview_types',
			'offered_ctcs', 'offered_designations', 'work_locations', 'joining_dates',
			'offer_responses', 'actual_joining_dates', 'joining_statuses', 'offer_dates',
			'offer_created_ats', 'offer_updated_ats'
		].includes(colId);

		if (isMultiItemCol && typeof val === 'string' && val.includes(',')) {
			const itemsList = val.split(',').map(s => s.trim());
			return (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
					{itemsList.map((subVal, i) => (
						<Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 22 }}>
							<Typography variant="caption" sx={{ fontSize: '0.65rem', color: theme.palette.text.secondary, fontWeight: 700, width: 14 }}>
								{i + 1}.
							</Typography>
							{colId.includes('status') ? (
								(() => {
									const colors = getStatusColor(subVal);
									return <Chip label={subVal} size="small" sx={{ borderRadius: '4px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600, fontSize: '0.65rem', height: 18 }} />;
								})()
							) : (
								<Typography variant="caption" sx={{ fontSize: '0.75rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
									{subVal || '-'}
								</Typography>
							)}
						</Box>
					))}
				</Box>
			);
		}

		// Array Handling
		if (Array.isArray(val)) {
			if (val.length === 0) return '-';
			return (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{val.map((v: any, i: number) => (
						<Chip
							key={i}
							label={typeof v === 'object' ? JSON.stringify(v) : String(v)}
							size="small"
							variant="outlined"
							sx={{ fontSize: '0.65rem', height: 18 }}
						/>
					))}
				</Box>
			);
		}

		// Dates
		if ((colId.includes('_at') || colId.includes('date') || colId === 'dob') && val) {
			try {
				val = format(new Date(val), 'dd MMM yyyy');
			} catch (e) {
				// Keep raw string if parse fails
			}
		}

		// Structured object fields rendering
		if (colId === 'family_details' && val && typeof val === 'object') {
			if (Array.isArray(val)) {
				return (
					<Box sx={{ fontSize: '0.75rem' }}>
						{val.map((f: any, i: number) => (
							<div key={i} style={{ marginBottom: i < val.length - 1 ? '4px' : 0 }}>
								<strong>{f.relation}:</strong> {f.name} {f.occupation ? `(${f.occupation})` : ''}
							</div>
						))}
					</Box>
				);
			}
		}

		if (colId === 'screening_skills' && val && typeof val === 'object') {
			const tech = val.technical_skills || [];
			const soft = val.soft_skills || [];
			if (tech.length === 0 && soft.length === 0) return '-';

			return (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
					{tech.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
							<Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5, fontSize: '0.65rem', color: theme.palette.text.secondary }}>Tech:</Typography>
							{tech.map((s: string, i: number) => (
								<Chip key={i} label={s} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
							))}
						</Box>
					)}
					{soft.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
							<Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5, fontSize: '0.65rem', color: theme.palette.text.secondary }}>Soft:</Typography>
							{soft.map((s: string, i: number) => (
								<Chip key={i} label={s} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
							))}
						</Box>
					)}
				</Box>
			);
		}

		if (colId === 'suitable_job_roles' && Array.isArray(val)) {
			return (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{val.map((role: string, i: number) => (
						<Chip
							key={i}
							label={role}
							size="small"
							variant="outlined"
							sx={{
								fontSize: '0.65rem',
								height: 18,
								backgroundColor: alpha(theme.palette.secondary.main, 0.05),
								color: theme.palette.secondary.main,
								borderColor: alpha(theme.palette.secondary.main, 0.2)
							}}
						/>
					))}
				</Box>
			);
		}

		if (colId === 'skills' && Array.isArray(val)) {
			return (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{val.map((s: any, i: number) => (
						<Chip key={i} label={`${s.name} (${s.level})`} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
					))}
				</Box>
			);
		}

		// Status Pills
		if ((colId.includes('status') || colId === 'disability_type' || colId === 'consent_status' || colId === 'analysis_recommendation') && val) {
			const colors = getStatusColor(val);
			return <Chip label={String(val)} size="small" sx={{ borderRadius: '4px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600, fontSize: '0.7rem', height: 20 }} />;
		}

		if (colId === 'disability_percentage' && val) {
			return `${val}%`;
		}

		if (colId === 'attendance_percentage' && val !== null && val !== undefined) {
			return `${val}%`;
		}

		if (typeof val === 'boolean') return val ? 'Yes' : 'No';

		if (typeof val === 'string' && /<[a-z][\s\S]*>/i.test(val)) {
			const cleanText = stripHtml(val);
			return (
				<Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-line', maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
					{cleanText}
				</Typography>
			);
		}

		const finalVal = (val !== undefined && val !== null) ? String(val).trim() : '';
		return finalVal !== '' ? finalVal : '-';
	};

	return (
		<TableContainer
			component={Paper}
			elevation={0}
			sx={{
				flex: 1,
				width: '100%',
				border: `1px solid ${theme.palette.divider}`,
				borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				'&::-webkit-scrollbar': { height: 8, width: 8 },
				'&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
				'&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.divider, borderRadius: 4 },
			}}
		>
			{loading && (
				<Box sx={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: alpha(theme.palette.background.paper, 0.6),
					zIndex: 2
				}}>
					<CircularProgress size={32} thickness={4} />
				</Box>
			)}
			<Box sx={{
				flex: 1,
				overflow: 'auto',
				width: '100%',
				'WebkitOverflowScrolling': 'touch',
				p: isMobile ? 2 : 0,
				backgroundColor: isMobile ? theme.palette.background.default : 'transparent'
			}}>
				{isMobile ? (
					<Box role="list" aria-label="Unified report list">
						{data.length > 0 ? data.map(item => renderMobileCard(item)) : (
							<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
								No candidate report data available.
							</Typography>
						)}
					</Box>
				) : (
					<Table size="small" stickyHeader aria-label="Unified report table" role="table">
						<DataTableHead 
							columns={tableColumns}
						/>
						<TableBody>
							{data.length > 0 ? (
								data.map((item, idx) => (
									<TableRow
										key={item.public_id || idx}
										role="row"
										sx={{
											backgroundColor: idx % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover,
											'&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
											'& td': { borderBottom: `1px solid ${theme.palette.divider}` }
										}}
									>
										{activeColumns.map(col => (
											<TableCell
												key={col.id}
												role="cell"
												sx={{
													py: 1,
													px: 2,
													fontSize: '0.8125rem',
													color: theme.palette.text.primary,
													borderRight: `1px solid ${theme.palette.divider}`,
													'&:last-child': { borderRight: 'none' },
													verticalAlign: 'top'
												}}
											>
												{renderCell(item, col.id)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<DataTableEmpty 
									colSpan={activeColumns.length} 
									message="No report data available for the current selection."
								/>
							)}
						</TableBody>
					</Table>
				)}
			</Box>
			<CustomTablePagination
				count={total}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={(_: unknown, p: number) => onPageChange(p)}
				onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => onRowsPerPageChange(parseInt(e.target.value, 10))}
				onRowsPerPageSelectChange={(rows: number) => onRowsPerPageChange(rows)}
			/>
		</TableContainer>
	);
};

export default ReportTable;
