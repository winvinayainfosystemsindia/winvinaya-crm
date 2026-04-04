import React from 'react';
import {
	TableContainer,
	Paper,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	CircularProgress,
	useTheme,
	useMediaQuery,
	Box,
	Typography,
	Stack
} from '@mui/material';
import HistoryRow, { HistoryMobileCard } from './HistoryRow';
import type { DSREntry } from '../../../../models/dsr';
import CustomTablePagination from '../../../common/CustomTablePagination';

interface HistoryTableProps {
	entries: DSREntry[];
	total: number;
	loading: boolean;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRowsPerPageSelectChange: (rows: number) => void;
	onDelete: (id: string) => void;
	onEdit?: (id: string) => void;
	onView?: (id: string) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
	entries,
	total,
	loading,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onRowsPerPageSelectChange,
	onDelete,
	onEdit,
	onView
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));

	if (loading && entries.length === 0) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 8, bgcolor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
				<CircularProgress size={32} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	return (
		<Box sx={{ width: '100%', minWidth: 0 }}>
			{isMobile ? (
				<Box sx={{ px: 0.5 }}>
					{entries.length === 0 ? (
						<Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#f9fafb' }}>
							<Typography variant="body2" color="text.secondary">No submissions found.</Typography>
						</Paper>
					) : (
						<Stack spacing={0.5}>
							{entries.map((entry) => (
								<HistoryMobileCard
									key={entry.public_id}
									entry={entry}
									onDelete={onDelete}
									onEdit={onEdit}
									onView={onView}
								/>
							))}
						</Stack>
					)}
				</Box>
			) : (
				<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '4px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
					<Table sx={{ minWidth: 600 }}>
						<TableHead sx={{ bgcolor: '#f8fafc' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Report Date</TableCell>
								<TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
								<TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Hours</TableCell>
								<TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', display: { xs: 'none', lg: 'table-cell' } }}>Submitted At</TableCell>
								<TableCell align="right" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', pr: 2 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{entries.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>
										No records found for the selected period.
									</TableCell>
								</TableRow>
							) : (
								entries.map((entry) => (
									<HistoryRow
										key={entry.public_id}
										entry={entry}
										onDelete={onDelete}
										onEdit={onEdit}
										onView={onView}
									/>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<Box sx={{ mt: 2, bgcolor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
				<CustomTablePagination
					count={total}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={onPageChange}
					onRowsPerPageChange={onRowsPerPageChange}
					onRowsPerPageSelectChange={onRowsPerPageSelectChange}
				/>
			</Box>
		</Box>
	);
};

export default HistoryTable;
