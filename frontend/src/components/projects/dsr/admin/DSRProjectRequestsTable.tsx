import React from 'react';
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	CircularProgress,
	Chip,
	Button,
	Typography,
	Box,
	Tooltip,
	IconButton
} from '@mui/material';
import {
	CheckCircle as ApproveIcon,
	Cancel as RejectIcon,
	Info as InfoIcon
} from '@mui/icons-material';

import type { DSRProjectRequest } from '../../../../models/dsr';

interface DSRProjectRequestsTableProps {
	requests: DSRProjectRequest[];
	loading: boolean;
	onHandle: (publicId: string, status: 'approved' | 'rejected') => void;
}

const DSRProjectRequestsTable: React.FC<DSRProjectRequestsTableProps> = ({
	requests,
	loading,
	onHandle
}) => {
	return (
		<TableContainer>
			<Table>
				<TableHead sx={{ bgcolor: '#f2f3f3' }}>
					<TableRow>
						<TableCell sx={{ fontWeight: 700 }}>Requested By</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Project Name</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Reason / Details</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
						<TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
								<CircularProgress size={24} color="inherit" />
							</TableCell>
						</TableRow>
					) : requests.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
								<Typography variant="body2" sx={{ color: '#545b64' }}>No pending project requests.</Typography>
							</TableCell>
						</TableRow>
					) : (
						requests.map((req) => (
							<TableRow key={req.public_id} hover>
								<TableCell sx={{ fontWeight: 600 }}>{req.requester?.full_name || 'User'}</TableCell>
								<TableCell sx={{ fontWeight: 700, color: '#232f3e' }}>{req.project_name}</TableCell>
								<TableCell>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography variant="body2" sx={{
											maxWidth: 200,
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>
											{req.reason || 'No reason provided'}
										</Typography>
										{req.reason && (
											<Tooltip title={req.reason}>
												<IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
											</Tooltip>
										)}
									</Box>
								</TableCell>
								<TableCell>
									<Chip
										label={req.status.toUpperCase()}
										size="small"
										color={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'error'}
										variant="outlined"
										sx={{ borderRadius: '2px', fontWeight: 700 }}
									/>
								</TableCell>
								<TableCell align="right">
									{req.status === 'pending' && (
										<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
											<Button
												size="small"
												variant="contained"
												color="success"
												startIcon={<ApproveIcon />}
												onClick={() => onHandle(req.public_id, 'approved')}
												sx={{ textTransform: 'none', fontWeight: 700 }}
											>
												Approve
											</Button>
											<Button
												size="small"
												variant="outlined"
												color="error"
												startIcon={<RejectIcon />}
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
	);
};

export default DSRProjectRequestsTable;
