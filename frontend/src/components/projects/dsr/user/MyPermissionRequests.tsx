import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Chip,
	Box,
	CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import type { DSRPermissionRequest } from '../../../../models/dsr';

interface MyPermissionRequestsProps {
	requests: DSRPermissionRequest[];
	loading: boolean;
}

const getStatusChip = (status: string) => {
	switch (status) {
		case 'granted':
			return <Chip label="Approved" size="small" sx={{ bgcolor: '#e6f4ea', color: '#1e7e34', fontWeight: 700, borderRadius: '2px' }} />;
		case 'rejected':
			return <Chip label="Rejected" size="small" sx={{ bgcolor: '#fdf3f1', color: '#d13212', fontWeight: 700, borderRadius: '2px' }} />;
		default:
			return <Chip label="Pending" size="small" sx={{ bgcolor: '#f1faff', color: '#0067b0', fontWeight: 700, borderRadius: '2px' }} />;
	}
};

const MyPermissionRequests: React.FC<MyPermissionRequestsProps> = ({ requests, loading }) => {
	if (loading && requests.length === 0) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	if (requests.length === 0) {
		return (
			<Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: '2px', borderStyle: 'dashed' }}>
				<Typography variant="body2" sx={{ color: '#545b64' }}>
					You haven't raised any permission requests yet.
				</Typography>
			</Paper>
		);
	}

	return (
		<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '2px', borderColor: '#d5dbdb' }}>
			<Table size="small">
				<TableHead sx={{ bgcolor: '#f3f3f3' }}>
					<TableRow>
						<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Report Date</TableCell>
						<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Reason</TableCell>
						<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Status</TableCell>
						<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Admin Notes</TableCell>
						<TableCell sx={{ fontWeight: 700, color: '#545b64' }}>Requested On</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{requests.map((req) => (
						<TableRow key={req.public_id} sx={{ '&:hover': { bgcolor: '#fbfbfb' } }}>
							<TableCell sx={{ fontWeight: 500 }}>
								{format(new Date(req.report_date), 'dd MMM yyyy')}
							</TableCell>
							<TableCell sx={{ color: '#232f3e' }}>{req.reason}</TableCell>
							<TableCell>{getStatusChip(req.status)}</TableCell>
							<TableCell sx={{ color: '#545b64', fontStyle: 'italic' }}>
								{req.admin_notes || '-'}
							</TableCell>
							<TableCell sx={{ color: '#545b64', fontSize: '0.75rem' }}>
								{format(new Date(req.created_at), 'dd MMM yyyy, HH:mm')}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default MyPermissionRequests;
