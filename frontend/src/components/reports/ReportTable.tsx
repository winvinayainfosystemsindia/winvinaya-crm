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
	Chip
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
			minWidth: 150, // Prevent column squashing
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
	const activeColumns = columns.filter(c => visibleColumns.includes(c.id));

	const renderCell = (candidate: CandidateListItem, colId: string) => {
		let val: any = (candidate as any)[colId];

		// Formatting for specific fields
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
								<strong>{f.relation}:</strong> {f.name} ({f.phone || 'No phone'}){detailsStr}
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
							sx={{
								fontSize: '0.65rem',
								height: 18,
								borderColor: '#eaeded',
								backgroundColor: '#f8f9fa',
								color: '#545b64',
								whiteSpace: 'nowrap'
							}}
						/>
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
			return (
				<Chip
					label={val}
					size="small"
					sx={{
						borderRadius: '4px',
						backgroundColor: colors.bg,
						color: colors.text,
						border: `1px solid ${colors.border}`,
						fontWeight: 600,
						fontSize: '0.7rem',
						height: 20,
						whiteSpace: 'nowrap'
					}}
				/>
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
				overflow: 'hidden', // Contain scrolling to inner Box
				display: 'flex',
				flexDirection: 'column',
				'&::-webkit-scrollbar': {
					height: 8,
					width: 8,
				},
				'&::-webkit-scrollbar-track': {
					backgroundColor: '#f1f1f1',
				},
				'&::-webkit-scrollbar-thumb': {
					backgroundColor: '#c1c1c1',
					borderRadius: 4,
					'&:hover': {
						backgroundColor: '#a8a8a8',
					},
				},
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
					backgroundColor: 'rgba(255,255,255,0.6)',
					zIndex: 2
				}}>
					<CircularProgress size={32} thickness={4} sx={{ color: '#007eb9' }} />
				</Box>
			)}
			<Box sx={{
				flex: 1,
				overflow: 'auto', // Correct scroll capturing
				width: '100%',
				'WebkitOverflowScrolling': 'touch'
			}}>
				<Table size="small" stickyHeader aria-label="candidates report table">
					<TableHead>
						<TableRow>
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
									sx={{
										backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
										'&:hover': { backgroundColor: '#f2f3f3' },
										'& td': { borderBottom: '1px solid #f2f3f3' }
									}}
								>
									{activeColumns.map(col => (
										<TableCell
											key={col.id}
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
						) : !loading && (
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
			</Box>
			<TablePagination
				component="div"
				count={total}
				page={page}
				onPageChange={(_, p) => onPageChange(p)}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
				rowsPerPageOptions={[25, 50, 100]}
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
