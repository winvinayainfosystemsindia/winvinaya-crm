import React from 'react';
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Typography,
	Box,
	Paper,
	CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';

import type { DSRLeaveApplication } from '../../../../models/dsr';
import DSRAdminTableHeader from './DSRAdminTableHeader';
import CustomTablePagination from '../../../common/table/CustomTablePagination';

interface LeavesApprovalTableProps {
	leaves: DSRLeaveApplication[];
	total: number;
	loading: boolean;
	onRefresh: () => void;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRowsPerPageSelectChange: (rows: number) => void;
}

const LeavesApprovalTable: React.FC<LeavesApprovalTableProps> = ({
	leaves,
	total,
	loading,
	onRefresh,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onRowsPerPageSelectChange
}) => {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
					Leave Applications
				</Typography>
			</Box>
			<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
				<DSRAdminTableHeader
					searchTerm=""
					onSearchChange={() => {}}
					onRefresh={onRefresh}
					placeholder="Search leaves..."
					hideSearch
				/>

				<TableContainer>
					<Table sx={{ minWidth: 650 }}>
						<TableHead>
							<TableRow sx={{ bgcolor: '#fafafa' }}>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Employee</TableCell>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Dates</TableCell>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Type</TableCell>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Reason</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={4} align="center" sx={{ py: 4 }}>
										<CircularProgress size={24} />
										<Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>Loading leaves...</Typography>
									</TableCell>
								</TableRow>
							) : !leaves || leaves.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} align="center" sx={{ py: 4 }}>
										<Typography variant="body2" color="text.secondary">
											No leave applications found.
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								leaves.map((leave) => (
									<TableRow
										key={leave.public_id}
										sx={{
											'&:hover': { bgcolor: '#f5f8fa' },
											'&:last-child td': { borderBottom: 0 }
										}}
									>
										<TableCell sx={{ fontWeight: 500 }}>
											{leave.user?.full_name || leave.user?.username || `User ${leave.user_id}`}
										</TableCell>
										<TableCell>
											<Typography variant="body2" sx={{ fontWeight: 600 }}>
												{dayjs(leave.start_date).format('DD MMM')} - {dayjs(leave.end_date).format('DD MMM YYYY')}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{dayjs(leave.end_date).diff(dayjs(leave.start_date), 'day') + 1} day(s)
											</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{leave.leave_type}</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450 }} noWrap title={leave.reason || ''}>
												{leave.reason || ''}
											</Typography>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>

				<CustomTablePagination
					count={total}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={onPageChange}
					onRowsPerPageChange={onRowsPerPageChange}
					onRowsPerPageSelectChange={onRowsPerPageSelectChange}
				/>
			</Paper>
		</Box>
	);
};

export default React.memo(LeavesApprovalTable);
