import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Tooltip,
	Typography,
	Chip,
	CircularProgress
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import type { DSRActivity } from '../../models/dsr';
import { DSRActivityStatusValues } from '../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchActivities } from '../../store/slices/dsrSlice';
import CustomTablePagination from '../common/CustomTablePagination';

interface ActivityTableProps {
	projectId: string;
	onEdit: (activity: DSRActivity) => void;
	onDelete: (activity: DSRActivity) => void;
	refreshKey: number;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
	projectId,
	onEdit,
	onDelete,
	refreshKey
}) => {
	const dispatch = useAppDispatch();
	const { activities, loading, totalActivities: total } = useAppSelector((state) => state.dsr);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	useEffect(() => {
		if (projectId) {
			dispatch(fetchActivities({
				projectId,
				skip: page * rowsPerPage,
				limit: rowsPerPage
			}));
		}
	}, [dispatch, projectId, page, rowsPerPage, refreshKey]);

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case DSRActivityStatusValues.COMPLETED: return 'success';
			case DSRActivityStatusValues.IN_PROGRESS: return 'primary';
			case DSRActivityStatusValues.ON_HOLD: return 'warning';
			case DSRActivityStatusValues.CANCELLED: return 'error';
			default: return 'default';
		}
	};

	return (
		<Paper variant="outlined" sx={{ borderRadius: 1 }}>
			<TableContainer>
				<Table>
					<TableHead sx={{ bgcolor: '#f2f3f3' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>Activity Name</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
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
						) : activities.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
									No activities planned yet.
								</TableCell>
							</TableRow>
						) : (
							activities.map((activity) => (
								<TableRow key={activity.public_id} hover>
									<TableCell sx={{ fontWeight: 600 }}>{activity.name}</TableCell>
									<TableCell>
										{new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<Chip
											label={activity.status.toUpperCase()}
											color={getStatusColor(activity.status)}
											size="small"
											variant="outlined"
										/>
									</TableCell>
									<TableCell>
										<Typography variant="body2" sx={{
											maxWidth: 250,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap'
										}}>
											{activity.description}
										</Typography>
									</TableCell>
									<TableCell align="right">
										<Tooltip title="Edit">
											<IconButton onClick={() => onEdit(activity)} size="small" sx={{ mr: 1 }}>
												<EditIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton onClick={() => onDelete(activity)} size="small" color="error">
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Tooltip>
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
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				onRowsPerPageSelectChange={(rows) => { setRowsPerPage(rows); setPage(0); }}
			/>
		</Paper>
	);
};

export default ActivityTable;
