import React from 'react';
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Chip,
	Button,
	Typography,
	Box,
	Tooltip,
	IconButton,
	Paper,
	CircularProgress
} from '@mui/material';
import {
	Info as InfoIcon
} from '@mui/icons-material';

import type { DSRPermissionRequest } from '../../../../models/dsr';

import DSRAdminTableHeader from './DSRAdminTableHeader';
import CustomTablePagination from '../../../common/CustomTablePagination';

interface PermissionRequestsTableProps {
	requests: DSRPermissionRequest[];
	loading: boolean;
	onHandle: (publicId: string, status: 'granted' | 'rejected') => void;
	onRefresh: () => void;
	searchTerm: string;
	onSearchChange: (value: string) => void;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRowsPerPageSelectChange: (rows: number) => void;
}

const PermissionRequestsTable: React.FC<PermissionRequestsTableProps> = ({
	requests,
	loading,
	onHandle,
	onRefresh,
	searchTerm,
	onSearchChange,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onRowsPerPageSelectChange
}) => {
	const filteredRequests = React.useMemo(() => {
		if (!searchTerm) return requests;
		const s = searchTerm.toLowerCase();
		return requests.filter(r =>
			(r.user?.full_name || '').toLowerCase().includes(s) ||
			(r.user?.username || '').toLowerCase().includes(s) ||
			(r.reason || '').toLowerCase().includes(s) ||
			(r.status || '').toLowerCase().includes(s)
		);
	}, [requests, searchTerm]);

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
			<DSRAdminTableHeader
				title="Permission Requests"
				searchTerm={searchTerm}
				onSearchChange={onSearchChange}
				onRefresh={onRefresh}
				placeholder="Search by requester or reason..."
			/>

			<TableContainer>
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Employee</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Requested Date</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Reason</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 4 }}>
									<CircularProgress size={24} />
									<Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>Loading requests...</Typography>
								</TableCell>
							</TableRow>
						) : !filteredRequests || filteredRequests.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 4 }}>
									<Typography variant="body2" color="text.secondary">
										{searchTerm ? 'No matches found for your search.' : 'No pending permission requests.'}
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							filteredRequests.map((req) => (
								<TableRow
									key={req.public_id}
									sx={{
										'&:hover': { bgcolor: '#f5f8fa' },
										'&:last-child td': { borderBottom: 0 }
									}}
								>
									<TableCell sx={{ fontWeight: 500 }}>{req.user?.full_name || 'User'}</TableCell>
									<TableCell>{req.report_date}</TableCell>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Typography variant="body2" sx={{
												maxWidth: 200,
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis'
											}}>
												{req.reason}
											</Typography>
											<Tooltip title={req.reason}>
												<IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
											</Tooltip>
										</Box>
									</TableCell>
									<TableCell>
										<Chip
											label={req.status.toUpperCase()}
											size="small"
											color={req.status === 'pending' ? 'warning' : req.status === 'granted' ? 'success' : 'error'}
											variant="outlined"
											sx={{ borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}
										/>
									</TableCell>
									<TableCell align="right">
										{req.status === 'pending' && (
											<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
												<Button
													size="small"
													variant="contained"
													color="success"
													onClick={() => onHandle(req.public_id, 'granted')}
													sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
												>
													Approve
												</Button>
												<Button
													size="small"
													variant="outlined"
													color="error"
													onClick={() => onHandle(req.public_id, 'rejected')}
													sx={{ textTransform: 'none', fontWeight: 700 }}
												>
													Reject
												</Button>
											</Box>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<CustomTablePagination
				count={filteredRequests.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				onRowsPerPageSelectChange={onRowsPerPageSelectChange}
			/>
		</Paper>
	);
};

export default React.memo(PermissionRequestsTable);
