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
	useTheme
} from '@mui/material';
import { useMockInterviewList } from './useMockInterviewList';
import MockInterviewTableHeader from './MockInterviewTableHeader';
import MockInterviewTableRow from './MockInterviewTableRow';
import MockInterviewForm from './MockInterviewForm';

interface MockInterviewListProps {
	batchId: number;
}

const MockInterviewList: React.FC<MockInterviewListProps> = ({ batchId }) => {
	const theme = useTheme();
	const {
		mockInterviews,
		loading,
		page,
		rowsPerPage,
		searchTerm,
		isFormOpen,
		viewMode,
		setSearchTerm,
		setIsFormOpen,
		handleRefresh,
		handleChangePage,
		handleChangeRowsPerPage,
		handleCreate,
		handleEdit,
		handleView,
		handleDelete
	} = useMockInterviewList(batchId);

	return (
		<Box sx={{ width: '100%' }}>
			<MockInterviewTableHeader
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				onRefresh={handleRefresh}
				onCreate={handleCreate}
			/>

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
											onView={handleView}
											onEdit={handleEdit}
											onDelete={handleDelete}
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

