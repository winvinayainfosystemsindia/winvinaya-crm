import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Box,
	Button,
	Card,
	Chip,
	IconButton,
	InputAdornment,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
	useTheme,
	Tooltip,
	Paper,
	Stack,
	LinearProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Visibility as ViewIcon,
	Refresh as RefreshIcon,
	FilterList as FilterIcon,
} from '@mui/icons-material';
import { type AppDispatch, type RootState } from '../../../store/store';
import { fetchMockInterviewsByBatch, deleteMockInterview, setCurrentMockInterview } from '../../../store/slices/mockInterviewSlice';
import MockInterviewForm from './MockInterviewForm';
import type { MockInterview } from '../../../models/MockInterview';
import { format } from 'date-fns';

interface MockInterviewListProps {
	batchId: number;
}

const MockInterviewList: React.FC<MockInterviewListProps> = ({ batchId }) => {
	const theme = useTheme();
	const dispatch = useDispatch<AppDispatch>();
	const { mockInterviews, loading } = useSelector((state: RootState) => state.mockInterviews);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [viewMode, setViewMode] = useState(false);

	useEffect(() => {
		if (batchId) {
			dispatch(fetchMockInterviewsByBatch(batchId));
		}
	}, [dispatch, batchId]);

	const handleRefresh = () => {
		dispatch(fetchMockInterviewsByBatch(batchId));
	};

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleCreate = () => {
		dispatch(setCurrentMockInterview(null));
		setViewMode(false);
		setIsFormOpen(true);
	};

	const handleEdit = (interview: MockInterview) => {
		dispatch(setCurrentMockInterview(interview));
		setViewMode(false);
		setIsFormOpen(true);
	};

	const handleView = (interview: MockInterview) => {
		dispatch(setCurrentMockInterview(interview));
		setViewMode(true);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (window.confirm('Are you sure you want to delete this mock interview record? This action cannot be undone.')) {
			await dispatch(deleteMockInterview(id));
		}
	};

	const getStatusStyles = (status: string) => {
		switch (status.toLowerCase()) {
			case 'cleared':
				return { color: 'success', label: 'Cleared', variant: 'filled' };
			case 'rejected':
				return { color: 'error', label: 'Rejected', variant: 'filled' };
			case 're-test':
				return { color: 'warning', label: 'Re-test', variant: 'outlined' };
			case 'pending':
				return { color: 'info', label: 'Pending', variant: 'outlined' };
			default:
				return { color: 'default', label: status, variant: 'outlined' };
		}
	};

	const filteredInterviews = useMemo(() => {
		return mockInterviews.filter(interview =>
			interview.interviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			interview.status.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [mockInterviews, searchTerm]);

	const renderRating = (rating: number | undefined) => {
		if (rating === undefined || rating === null) return <Typography variant="body2" color="text.secondary">N/A</Typography>;

		const color = rating >= 8 ? theme.palette.success.main : rating >= 5 ? theme.palette.warning.main : theme.palette.error.main;

		return (
			<Box sx={{ minWidth: 100 }}>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Box sx={{ width: '100%', mr: 1 }}>
						<LinearProgress
							variant="determinate"
							value={rating * 10}
							sx={{
								height: 6,
								borderRadius: 3,
								backgroundColor: theme.palette.grey[200],
								'& .MuiLinearProgress-bar': {
									backgroundColor: color
								}
							}}
						/>
					</Box>
					<Typography variant="caption" fontWeight={600} color="text.secondary">
						{rating}/10
					</Typography>
				</Stack>
			</Box>
		);
	};

	return (
		<Box sx={{ width: '100%' }}>
			{/* Action Bar */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 3,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					borderRadius: 2,
					border: `1px solid ${theme.palette.divider}`,
					backgroundColor: theme.palette.background.paper
				}}
			>
				<Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
					<TextField
						placeholder="Search candidates or interviewers..."
						size="small"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon fontSize="small" color="action" />
								</InputAdornment>
							),
						}}
						sx={{ width: 350 }}
					/>
					<Tooltip title="Refresh">
						<IconButton onClick={handleRefresh} size="small">
							<RefreshIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Filters">
						<IconButton size="small">
							<FilterIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>

				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleCreate}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						boxShadow: 'none',
						'&:hover': {
							boxShadow: 'none'
						}
					}}
				>
					Create session
				</Button>
			</Paper>

			{/* Main Content Table */}
			<Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
				<TableContainer>
					<Table sx={{ minWidth: 800 }}>
						<TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>DATE</TableCell>
								<TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>INTERVIEWER</TableCell>
								<TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>STATUS</TableCell>
								<TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>OVERALL RATING</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>ACTIONS</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading && mockInterviews.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center" sx={{ py: 8 }}>
										<LinearProgress sx={{ width: '50%', mx: 'auto' }} />
										<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
											Loading mock interviews...
										</Typography>
									</TableCell>
								</TableRow>
							) : filteredInterviews.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center" sx={{ py: 8 }}>
										<Typography variant="body1" fontWeight={500} color="text.secondary">
											No mock interview sessions found
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Try adjusting your search or create a new session.
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								filteredInterviews
									.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
									.map((interview) => {
										const status = getStatusStyles(interview.status);
										return (
											<TableRow key={interview.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
												<TableCell>
													<Typography variant="body2" fontWeight={600}>
														{format(new Date(interview.interview_date), 'MMM dd, yyyy')}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{format(new Date(interview.interview_date), 'hh:mm a')}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="body2" fontWeight={500}>
														{interview.interviewer_name || 'Unassigned'}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={status.label}
														size="small"
														color={status.color as any}
														variant={status.variant as any}
														sx={{
															fontWeight: 600,
															fontSize: '0.7rem',
															borderRadius: '4px',
															height: '24px'
														}}
													/>
												</TableCell>
												<TableCell>
													{renderRating(interview.overall_rating)}
												</TableCell>
												<TableCell align="right">
													<Stack direction="row" spacing={0.5} justifyContent="flex-end">
														<Tooltip title="View details">
															<IconButton size="small" onClick={() => handleView(interview)}>
																<ViewIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														<Tooltip title="Edit session">
															<IconButton size="small" onClick={() => handleEdit(interview)}>
																<EditIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														<Tooltip title="Delete">
															<IconButton size="small" color="error" onClick={() => handleDelete(interview.id)}>
																<DeleteIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</Stack>
												</TableCell>
											</TableRow>
										);
									})
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={filteredInterviews.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
				/>
			</Card>

			{isFormOpen && (
				<MockInterviewForm
					open={isFormOpen}
					onClose={() => setIsFormOpen(false)}
					batchId={batchId}
					viewMode={viewMode}
				/>
			)}
		</Box>
	);
};

export default MockInterviewList;
