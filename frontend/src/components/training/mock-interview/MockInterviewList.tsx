import React from 'react';
import {
	Box,
	Card,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Typography,
	LinearProgress,
	Divider,
	Paper,
	Button,
	useTheme
} from '@mui/material';
import type { CandidateAllocation } from '../../../models/training';
import { useMockInterviewList } from './useMockInterviewList';
import MockInterviewTableHeader from './MockInterviewTableHeader';
import MockInterviewTableRow from './MockInterviewTableRow';
import MockInterviewForm from './MockInterviewForm';

interface MockInterviewListProps {
	batchId: number;
	allocations: CandidateAllocation[];
}

const MockInterviewList: React.FC<MockInterviewListProps> = ({ batchId, allocations }) => {
	const theme = useTheme();
	const {
		mockInterviews,
		loading,
		page,
		rowsPerPage,
		searchTerm,
		filterCandidateId,
		isFormOpen,
		viewMode,
		stats,
		setSearchTerm,
		setFilterCandidateId,
		setIsFormOpen,
		handleRefresh,
		handleChangePage,
		handleChangeRowsPerPage,
		handleCreate,
		handleEdit,
		handleView,
		handleDelete
	} = useMockInterviewList(batchId);

	const filteredCandidateName = allocations.find(a => a.candidate_id === filterCandidateId)?.candidate?.name;

	return (
		<Box sx={{ width: '100%' }}>
			{/* Mock Interview Stats Strip */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 3,
					border: '1px solid #d5dbdb',
					borderRadius: '2px',
					bgcolor: 'white',
					display: 'flex',
					alignItems: 'center',
					gap: 6
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box sx={{ bgcolor: '#f1faff', p: 1, borderRadius: '50%' }}>
						<Box component="span" sx={{ display: 'block', width: 20, height: 20, bgcolor: '#007eb9', borderRadius: '4px' }} />
					</Box>
					<Box>
						<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>Total Sessions</Typography>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#232f3e', lineHeight: 1 }}>{stats.total}</Typography>
					</Box>
				</Box>

				<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box sx={{ bgcolor: '#ebf5e0', p: 1, borderRadius: '50%' }}>
						<Box component="span" sx={{ display: 'block', width: 20, height: 20, bgcolor: '#318400', borderRadius: '50%' }} />
					</Box>
					<Box>
						<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>Cleared</Typography>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#318400', lineHeight: 1 }}>{stats.cleared}</Typography>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box sx={{ bgcolor: '#f1faff', p: 1, borderRadius: '50%' }}>
						<Box component="span" sx={{ display: 'block', width: 20, height: 20, bgcolor: '#007eb9', borderRadius: '50%' }} />
					</Box>
					<Box>
						<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>Candidates Attended</Typography>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#007eb9', lineHeight: 1 }}>{stats.uniqueCandidates}</Typography>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box sx={{ bgcolor: '#f2f3f3', p: 1, borderRadius: '50%' }}>
						<Box component="span" sx={{ display: 'block', width: 20, height: 20, bgcolor: '#879196', borderRadius: '50%' }} />
					</Box>
					<Box>
						<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>Absent</Typography>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#879196', lineHeight: 1 }}>{stats.absent}</Typography>
					</Box>
				</Box>

				<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: '50%' }}>
						<Box component="span" sx={{ display: 'block', width: 20, height: 20, bgcolor: '#c67200', borderRadius: '50%' }} />
					</Box>
					<Box>
						<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>Avg Rating</Typography>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#c67200', lineHeight: 1 }}>{stats.avgRating}/10</Typography>
					</Box>
				</Box>
			</Paper>

			<MockInterviewTableHeader
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				onRefresh={handleRefresh}
				onCreate={handleCreate}
			/>

			{filterCandidateId && (
				<Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f8f9fa', p: 1.5, borderRadius: '4px', border: '1px solid #eaeded' }}>
					<Typography variant="body2" sx={{ color: '#545b64' }}>
						Showing sessions for: <strong>{filteredCandidateName}</strong>
					</Typography>
					<Button
						size="small"
						variant="outlined"
						onClick={() => setFilterCandidateId(null)}
						sx={{ textTransform: 'none', height: 28, fontSize: '0.75rem' }}
					>
						Clear Filter
					</Button>
				</Box>
			)}

			<Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
				<TableContainer>
					<Table sx={{ minWidth: 800 }}>
						<TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>DATE</TableCell>
								<TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>CANDIDATE</TableCell>
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
							) : mockInterviews.length === 0 ? (
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
								mockInterviews
									.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
									.map((interview) => (
										<MockInterviewTableRow
											key={interview.id}
											interview={interview}
											allocations={allocations}
											onView={handleView}
											onEdit={handleEdit}
											onDelete={handleDelete}
											onFilterCandidate={setFilterCandidateId}
										/>
									))
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={mockInterviews.length}
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

