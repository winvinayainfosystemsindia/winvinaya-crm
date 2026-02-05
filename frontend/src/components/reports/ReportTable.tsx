import React from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
	TablePagination,
	Typography,
	Chip,
	useTheme,
	useMediaQuery,
	Stack
} from '@mui/material';
import { format } from 'date-fns';
import type { CandidateListItem } from '../../models/candidate';

interface Column {
	id: string;
	label: string;
}

interface ReportTableProps {
	loading: boolean;
	columns: Column[];
	visibleColumns: string[];
	data: CandidateListItem[];
	total: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (newPage: number) => void;
	onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const StyledHeaderCell = ({ children, sx = {} }: { children: React.ReactNode; sx?: any }) => (
	<TableCell
		component="th"
		scope="col"
		sx={{
			backgroundColor: '#fafafa',
			fontWeight: 700,
			fontSize: '0.75rem',
			color: '#545b64',
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
			py: 1.5,
			px: 2,
			borderBottom: '1px solid #eaeded',
			whiteSpace: 'nowrap',
			minWidth: 150,
			...sx
		}}
	>
		{children}
	</TableCell>
);

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

	// Helper for Card View Rendering
	const renderMobileCard = (candidate: CandidateListItem) => (
		<Paper
			elevation={0}
			key={candidate.public_id}
			sx={{
				p: 2,
				mb: 2,
				border: '1px solid #eaeded',
				borderRadius: '4px',
				backgroundColor: '#fff'
			}}
		>
			<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e', mb: 1.5 }}>
				{candidate.name}
			</Typography>
			<Stack spacing={1.5}>
				{activeColumns.filter(c => c.id !== 'name').map(col => (
					<Box key={col.id}>
						<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, display: 'block', mb: 0.25, textTransform: 'uppercase' }}>
							{col.label}
						</Typography>
						<Box sx={{ fontSize: '0.875rem', color: '#1a1c1e' }}>
							{renderCell(candidate, col.id)}
						</Box>
					</Box>
				))}
			</Stack>
		</Paper>
	);

	const renderCell = (candidate: CandidateListItem, colId: string) => {
		// ... (renderCell content remains same but move inside the component for easier access if not already)
		// I'll keep it as is if it fits, else move it.
		let val: any;

		if (colId.startsWith('screening_others.')) {
			const fieldName = colId.split('.')[1];
			val = (candidate.screening?.others as any)?.[fieldName];
		} else if (colId.startsWith('counseling_others.')) {
			const fieldName = colId.split('.')[1];
			val = (candidate.counseling?.others as any)?.[fieldName];
		} else {
			val = (candidate as any)[colId];
		}

		if ((colId === 'created_at' || colId === 'dob' || colId === 'counseling_date' || colId === 'screening_date' || colId === 'screening_updated_at') && val) {
			try {
				val = format(new Date(val), 'dd MMM yyyy');
			} catch (e) {
				val = '-';
			}
		}

		if (colId === 'family_details' && Array.isArray(val)) {
			if (val.length === 0) return '-';
			return (
				<Box sx={{ fontSize: '0.75rem' }}>
					{val.map((f: any, i: number) => {
						const details = [];
						if (f.occupation) details.push(f.occupation);
						if (f.company_name) details.push(f.company_name);
						if (f.position) details.push(f.position);
						const detailsStr = details.length > 0 ? ` - ${details.join(', ')}` : '';
						return (
							<div key={i} style={{ marginBottom: i < val.length - 1 ? '4px' : 0 }}>
								<strong>{f.relation}:</strong> {f.name} {detailsStr}
							</div>
						);
					})}
				</Box>
			);
		}

		if (colId === 'documents_uploaded' && Array.isArray(val)) {
			return (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{val.length > 0 ? val.map((doc: string, i: number) => (
						<Chip
							key={i}
							label={doc}
							size="small"
							variant="outlined"
							sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#f8f9fa' }}
						/>
					)) : '-'}
				</Box>
			);
		}

		if (colId === 'skills' && Array.isArray(val)) {
			return (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{val.length > 0 ? val.map((s: any, i: number) => (
						<Chip key={i} label={`${s.name} (${s.level})`} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
					)) : '-'}
				</Box>
			);
		}

		if ((colId === 'disability_type' || colId === 'screening_status' || colId === 'counseling_status') && val) {
			const getStatusColor = (v: string) => {
				const lowerV = v.toLowerCase();
				if (lowerV === 'completed' || lowerV === 'selected') return { bg: '#e7f4e4', text: '#1d8102', border: '#b7d1a3' };
				if (lowerV === 'pending') return { bg: '#fff7e6', text: '#c85e00', border: '#fbd49d' };
				if (lowerV === 'rejected') return { bg: '#fdecea', text: '#d13212', border: '#f5bcac' };
				return { bg: '#f2f3f3', text: '#545b64', border: '#d5dbdb' };
			};
			const colors = getStatusColor(val);
			return <Chip label={val} size="small" sx={{ borderRadius: '4px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600, fontSize: '0.7rem', height: 20 }} />;
		}

		if (colId === 'disability_percentage' && val) {
			return `${val}%`;
		}

		if (colId === 'questions' && Array.isArray(val)) {
			if (val.length === 0) return '-';
			return (
				<Box sx={{ fontSize: '0.75rem' }}>
					{val.map((q: any, i: number) => (
						<div key={i} style={{ marginBottom: i < val.length - 1 ? '4px' : 0 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: '#ec7211', display: 'block' }}>Q: {q.question}</Typography>
							<Typography variant="caption" sx={{ color: '#545b64' }}>A: {q.answer}</Typography>
						</div>
					))}
				</Box>
			);
		}

		if (colId === 'workexperience' && Array.isArray(val)) {
			if (val.length === 0) return '-';
			return (
				<Box sx={{ fontSize: '0.75rem' }}>
					{val.map((w: any, i: number) => (
						<div key={i} style={{ marginBottom: i < val.length - 1 ? '4px' : 0 }}>
							<strong>{w.job_title}</strong> at {w.company}
						</div>
					))}
				</Box>
			);
		}

		if (colId === 'screening_comments' && val) {
			return (
				<Box sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={val}>
					{val}
				</Box>
			);
		}

		return val || '-';
	};

	return (
		<TableContainer
			component={Paper}
			elevation={0}
			sx={{
				flex: 1,
				width: '100%',
				border: '1px solid #eaeded',
				borderRadius: '0 0 4px 4px',
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				'&::-webkit-scrollbar': { height: 8, width: 8 },
				'&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
				'&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: 4 },
			}}
		>
			{loading && (
				<Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 2 }}>
					<CircularProgress size={32} thickness={4} sx={{ color: '#007eb9' }} />
				</Box>
			)}
			<Box sx={{
				flex: 1,
				overflow: 'auto',
				width: '100%',
				'WebkitOverflowScrolling': 'touch',
				p: isMobile ? 2 : 0,
				backgroundColor: isMobile ? '#f2f3f3' : 'transparent'
			}}>
				{isMobile ? (
					<Box role="list" aria-label="Candidates report list">
						{data.length > 0 ? data.map(candidate => renderMobileCard(candidate)) : (
							<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
								No candidate data available.
							</Typography>
						)}
					</Box>
				) : (
					<Table size="small" stickyHeader aria-label="Candidates report table" role="table">
						<TableHead>
							<TableRow role="row">
								{activeColumns.map(col => (
									<StyledHeaderCell key={col.id}>
										{col.label}
									</StyledHeaderCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{data.length > 0 ? (
								data.map((candidate, idx) => (
									<TableRow
										key={candidate.public_id}
										role="row"
										sx={{
											backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
											'&:hover': { backgroundColor: '#f2f3f3' },
											'& td': { borderBottom: '1px solid #f2f3f3' }
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
													color: '#1a1c1e',
													borderRight: '1px solid #f2f3f3',
													'&:last-child': { borderRight: 'none' }
												}}
											>
												{renderCell(candidate, col.id)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={activeColumns.length} sx={{ py: 10, textAlign: 'center' }}>
										<Typography variant="body2" color="text.secondary">
											No candidate data available for the current selection.
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</Box>
			<TablePagination
				component="div"
				count={total}
				page={page}
				onPageChange={(_, p) => onPageChange(p)}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
				rowsPerPageOptions={[25, 50, 100]}
				labelRowsPerPage={isMobile ? "" : "Rows per page:"}
				sx={{
					borderTop: '1px solid #eaeded',
					backgroundColor: '#fafafa',
					'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
						fontSize: '0.8125rem',
						color: '#545b64'
					}
				}}
			/>
		</TableContainer>
	);
};

export default ReportTable;
