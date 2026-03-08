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
} from '@mui/material';
import HistoryRow from './HistoryRow';
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
	return (
		<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
			<Table>
				<TableHead sx={{ bgcolor: '#f2f3f3' }}>
					<TableRow>
						<TableCell sx={{ fontWeight: 700 }}>Report Date</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Total Hours</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
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
					) : entries.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
								No records found.
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
			<CustomTablePagination
				count={total}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				onRowsPerPageSelectChange={onRowsPerPageSelectChange}
			/>
		</TableContainer>
	);
};

export default HistoryTable;
