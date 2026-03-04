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
	Typography,
	CircularProgress,
	Box,
	TextField,
	InputAdornment,
	Button,
	Menu,
	MenuItem as MuiMenuItem
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	Refresh as RefreshIcon,
	FilterList as FilterIcon,
	MoreVert as MoreIcon
} from '@mui/icons-material';
import type { DSRActivity } from '../../../models/dsr';
import { DSRActivityStatusValues } from '../../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchActivities } from '../../../store/slices/dsrSlice';
import CustomTablePagination from '../../common/CustomTablePagination';

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
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [manualRefresh, setManualRefresh] = useState(0);
	const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
	const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
	const [activeActivity, setActiveActivity] = useState<DSRActivity | null>(null);

	const filterOpen = Boolean(filterAnchorEl);
	const actionOpen = Boolean(actionAnchorEl);

	useEffect(() => {
		if (projectId) {
			dispatch(fetchActivities({
				projectId,
				skip: page * rowsPerPage,
				limit: rowsPerPage,
				search,
				status: statusFilter === 'all' ? undefined : statusFilter
			}));
		}
	}, [dispatch, projectId, page, rowsPerPage, refreshKey, search, statusFilter, manualRefresh]);

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setFilterAnchorEl(event.currentTarget);
	};

	const handleFilterClose = () => {
		setFilterAnchorEl(null);
	};

	const handleStatusSelect = (status: string) => {
		setStatusFilter(status);
		setPage(0);
		handleFilterClose();
	};

	const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, activity: DSRActivity) => {
		setActionAnchorEl(event.currentTarget);
		setActiveActivity(activity);
	};

	const handleActionClose = () => {
		setActionAnchorEl(null);
		setActiveActivity(null);
	};

	const handleRefresh = () => {
		setManualRefresh(prev => prev + 1);
	};

	const getStatusColorCode = (status: string) => {
		switch (status) {
			case DSRActivityStatusValues.COMPLETED: return '#037f0c';
			case DSRActivityStatusValues.IN_PROGRESS: return '#0073bb';
			case DSRActivityStatusValues.ON_HOLD: return '#ec7211';
			case DSRActivityStatusValues.CANCELLED: return '#d13212';
			default: return '#545b64';
		}
	};

	return (
		<Paper variant="outlined" sx={{ borderRadius: 0, border: '1px solid #eaeded', bgcolor: '#ffffff' }}>
			<Box sx={{
				p: 2,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottom: '1px solid #eaeded',
				bgcolor: '#ffffff'
			}}>
				<TextField
					placeholder="Search activities..."
					size="small"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{
						width: 300,
						'& .MuiInputBase-root': {
							fontSize: '0.8125rem',
							height: 36,
							bgcolor: '#ffffff'
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" sx={{ color: '#879196' }} />
							</InputAdornment>
						),
					}}
				/>
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
						onClick={handleRefresh}
						sx={{
							color: '#16191f',
							borderColor: '#d5dbdb',
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.8125rem',
							height: 36,
							px: 2,
							'&:hover': { bgcolor: '#f2f3f3', borderColor: '#aab7b7' }
						}}
					>
						Refresh
					</Button>
					<Button
						variant="outlined"
						startIcon={<FilterIcon sx={{ fontSize: 18 }} />}
						onClick={handleFilterClick}
						sx={{
							color: '#16191f',
							borderColor: '#d5dbdb',
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.8125rem',
							height: 36,
							px: 2,
							'&:hover': { bgcolor: '#f2f3f3', borderColor: '#aab7b7' }
						}}
					>
						Filter
					</Button>
					<Menu
						anchorEl={filterAnchorEl}
						open={filterOpen}
						onClose={handleFilterClose}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					>
						<MuiMenuItem onClick={() => handleStatusSelect('all')} selected={statusFilter === 'all'}>Status: All</MuiMenuItem>
						{Object.values(DSRActivityStatusValues).map(status => (
							<MuiMenuItem key={status} onClick={() => handleStatusSelect(status)} selected={statusFilter === status}>
								Status: {status.charAt(0) + status.slice(1).toLowerCase()}
							</MuiMenuItem>
						))}
					</Menu>
				</Box>
			</Box>

			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow sx={{ borderBottom: '1px solid #eaeded' }}>
							<TableCell sx={{ fontWeight: 600, color: '#16191f', fontSize: '0.8125rem', py: 2 }}>Activity Name</TableCell>
							<TableCell sx={{ fontWeight: 600, color: '#16191f', fontSize: '0.8125rem', py: 2 }}>Period</TableCell>
							<TableCell sx={{ fontWeight: 600, color: '#16191f', fontSize: '0.8125rem', py: 2 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 600, color: '#16191f', fontSize: '0.8125rem', py: 2 }}>Description</TableCell>
							<TableCell align="right" sx={{ fontWeight: 600, color: '#16191f', fontSize: '0.8125rem', py: 2 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 6 }}>
									<CircularProgress size={24} sx={{ color: '#ec7211' }} />
								</TableCell>
							</TableRow>
						) : activities.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 6, color: '#545b64', fontSize: '0.8125rem' }}>
									No activities planned yet.
								</TableCell>
							</TableRow>
						) : (
							activities.map((activity) => (
								<TableRow key={activity.public_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: '#16191f', fontWeight: 600 }}>
										{activity.name}
									</TableCell>
									<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: '#545b64' }}>
										{new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Box sx={{
												width: 8,
												height: 8,
												borderRadius: '50%',
												bgcolor: getStatusColorCode(activity.status)
											}} />
											<Typography sx={{ fontSize: '0.8125rem', color: getStatusColorCode(activity.status) }}>
												{activity.status.charAt(0) + activity.status.slice(1).toLowerCase()}
											</Typography>
										</Box>
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										<Typography variant="body2" sx={{
											maxWidth: 250,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											fontSize: '0.8125rem',
											color: '#545b64'
										}}>
											{activity.description}
										</Typography>
									</TableCell>
									<TableCell align="right" sx={{ py: 1 }}>
										<IconButton
											size="small"
											onClick={(e) => handleActionClick(e, activity)}
											sx={{ color: '#545b64' }}
										>
											<MoreIcon fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Menu
				anchorEl={actionAnchorEl}
				open={actionOpen}
				onClose={handleActionClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<MuiMenuItem onClick={() => { onEdit(activeActivity!); handleActionClose(); }}>
					<EditIcon sx={{ fontSize: 18, mr: 1, color: '#545b64' }} />
					Edit
				</MuiMenuItem>
				<MuiMenuItem onClick={() => { onDelete(activeActivity!); handleActionClose(); }} sx={{ color: '#d13212' }}>
					<DeleteIcon sx={{ fontSize: 18, mr: 1, color: '#d13212' }} />
					Delete
				</MuiMenuItem>
			</Menu>

			<Box sx={{ borderTop: '1px solid #eaeded' }}>
				<CustomTablePagination
					count={total}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					onRowsPerPageSelectChange={(rows) => { setRowsPerPage(rows); setPage(0); }}
				/>
			</Box>
		</Paper>
	);
};

export default ActivityTable;
