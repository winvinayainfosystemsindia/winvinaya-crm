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
	Typography,
	LinearProgress,
	useTheme,
	Button,
	alpha
} from '@mui/material';
import type { CandidateAllocation } from '../../../models/training';
import { useMockInterviewList } from './hooks/useMockInterviewList';
import MockInterviewTableHeader from './table/MockInterviewTableHeader';
import MockInterviewTableRow from './table/MockInterviewTableRow';
import MockInterviewForm from './form/MockInterviewForm';
import MockInterviewStats from './stats/MockInterviewStats';
import CustomTablePagination from '../../common/table/CustomTablePagination';

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
		handleDelete,
		setRowsPerPage
	} = useMockInterviewList(batchId);

	const filteredCandidateName = allocations.find(a => a.candidate_id === filterCandidateId)?.candidate?.name;

	return (
		<Box sx={{ width: '100%' }}>
			<MockInterviewStats stats={stats} />

			<MockInterviewTableHeader
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				onRefresh={handleRefresh}
				onCreate={handleCreate}
			/>

			{filterCandidateId && (
				<Box 
					sx={{ 
						mb: 3, 
						display: 'flex', 
						alignItems: 'center', 
						gap: 2, 
						bgcolor: alpha(theme.palette.info.main, 0.05), 
						p: 2, 
						borderRadius: 2, 
						border: '1px solid',
						borderColor: alpha(theme.palette.info.main, 0.1)
					}}
				>
					<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
						Showing sessions for: <Box component="span" sx={{ fontWeight: 700, color: 'info.main' }}>{filteredCandidateName}</Box>
					</Typography>
					<Button
						size="small"
						variant="outlined"
						color="info"
						onClick={() => setFilterCandidateId(null)}
						sx={{ 
							textTransform: 'none', 
							borderRadius: 1.5,
							fontWeight: 700,
							px: 2
						}}
					>
						Clear Filter
					</Button>
				</Box>
			)}

			<Card 
				elevation={0}
				sx={{ 
					borderRadius: 2, 
					overflow: 'hidden',
					border: '1px solid',
					borderColor: 'divider',
					boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
				}}
			>
				<TableContainer>
					<Table sx={{ minWidth: 800 }} size="small">
						<TableHead sx={{ bgcolor: alpha(theme.palette.action.disabledBackground, 0.05) }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>DATE</TableCell>
								<TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>CANDIDATE</TableCell>
								<TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>INTERVIEWER</TableCell>
								<TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>STATUS</TableCell>
								<TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>OVERALL RATING</TableCell>
								<TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>ACTIONS</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading && mockInterviews.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 10 }}>
										<Box sx={{ width: '50%', mx: 'auto' }}>
											<LinearProgress sx={{ borderRadius: 1, height: 6 }} />
											<Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
												Loading mock interviews...
											</Typography>
										</Box>
									</TableCell>
								</TableRow>
							) : mockInterviews.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 10 }}>
										<Typography variant="h6" fontWeight={800} color="text.disabled">
											No mock interview sessions found
										</Typography>
										<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
				<CustomTablePagination
					count={mockInterviews.length}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					onRowsPerPageSelectChange={setRowsPerPage}
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

