import React from 'react';
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Chip,
	Box,
	Paper,
	CircularProgress,
	Typography
} from '@mui/material';
import CustomTablePagination from '../../../common/CustomTablePagination';
import type { DSREntry } from '../../../../models/dsr';

import DSRAdminTableHeader from './DSRAdminTableHeader';

interface AllSubmissionsTableProps {
	entries: DSREntry[];
	total: number;
	loading: boolean;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRowsPerPageSelectChange: (rows: number) => void;
	onRefresh: () => void;
	searchTerm: string;
	onSearchChange: (value: string) => void;
	statusFilter: string | null;
	onStatusFilterChange: (status: string | null) => void;
}

const AllSubmissionsTable: React.FC<AllSubmissionsTableProps> = ({
	entries,
	total,
	loading,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onRowsPerPageSelectChange,
	onRefresh,
	searchTerm,
	onSearchChange,
	statusFilter,
	onStatusFilterChange
}) => {
	const filteredEntries = React.useMemo(() => {
		let filtered = entries;
		if (searchTerm) {
			const s = searchTerm.toLowerCase();
			filtered = filtered.filter(e =>
				(e.user?.full_name || '').toLowerCase().includes(s) ||
				(e.user?.username || '').toLowerCase().includes(s) ||
				(e.leave_type || '').toLowerCase().includes(s)
			);
		}
		if (statusFilter) {
			filtered = filtered.filter(e => e.status === statusFilter);
		}
		return filtered;
	}, [entries, searchTerm, statusFilter]);

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
			<DSRAdminTableHeader
				title="Submission History"
				searchTerm={searchTerm}
				onSearchChange={onSearchChange}
				onRefresh={onRefresh}
				placeholder="Search by employee..."
				statusFilter={statusFilter}
				onStatusFilterChange={onStatusFilterChange}
				statusOptions={[
					{ label: 'Submitted', value: 'submitted' },
					{ label: 'Approved', value: 'approved' },
					{ label: 'Draft', value: 'draft' },
					{ label: 'Leave', value: 'leave_pending' },
					{ label: 'Leave Approved', value: 'leave_approved' }
				]}
			/>

			<TableContainer>
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Employee</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Hours</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Submitted At</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={4} align="center" sx={{ py: 4 }}>
									<CircularProgress size={24} />
									<Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>Loading submissions...</Typography>
								</TableCell>
							</TableRow>
						) : !filteredEntries || filteredEntries.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align="center" sx={{ py: 4 }}>
									<Typography variant="body2" color="text.secondary">
										{searchTerm ? 'No records match your search.' : 'No submissions found for this date.'}
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							filteredEntries.map((entry) => (
								<TableRow
									key={entry.public_id}
									sx={{
										'&:hover': { bgcolor: '#f5f8fa' },
										'&:last-child td': { borderBottom: 0 }
									}}
								>
									<TableCell sx={{ fontWeight: 500 }}>{entry.user?.full_name || entry.user?.username}</TableCell>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Chip
												label={entry.status.toUpperCase()}
												size="small"
												variant="outlined"
												sx={{ borderRadius: '4px', fontWeight: 700, fontSize: '0.65rem' }}
											/>
											{entry.is_leave && (
												<Chip
													label={entry.leave_type || 'LEAVE'}
													size="small"
													color="warning"
													sx={{ borderRadius: '4px', fontWeight: 700, fontSize: '0.65rem' }}
												/>
											)}
										</Box>
									</TableCell>
									<TableCell sx={{ fontWeight: 500 }}>
										{entry.is_leave ? '—' : `${entry.items.reduce((s, i) => s + (i.hours || 0), 0).toFixed(1)} h`}
									</TableCell>
									<TableCell>{entry.submitted_at ? new Date(entry.submitted_at).toLocaleString() : 'N/A'}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<CustomTablePagination
				count={total}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				onRowsPerPageSelectChange={onRowsPerPageSelectChange}
			/>
		</Paper>
	);
};

export default React.memo(AllSubmissionsTable);
