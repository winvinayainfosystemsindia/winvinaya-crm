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

interface HistoryTableProps {
	entries: DSREntry[];
	loading: boolean;
	expandedRow: string | null;
	onToggleReplace: (id: string | null) => void;
	onDelete: (id: string) => void;
	onEdit?: (id: string) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({
	entries,
	loading,
	expandedRow,
	onToggleReplace,
	onDelete
}) => {
	return (
		<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
			<Table>
				<TableHead sx={{ bgcolor: '#f2f3f3' }}>
					<TableRow>
						<TableCell width="50px" />
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
							<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
								<CircularProgress size={24} color="inherit" />
							</TableCell>
						</TableRow>
					) : entries.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
								No records found.
							</TableCell>
						</TableRow>
					) : (
						entries.map((entry) => (
							<HistoryRow
								key={entry.public_id}
								entry={entry}
								isExpanded={expandedRow === entry.public_id}
								onToggleExpand={() => onToggleReplace(expandedRow === entry.public_id ? null : entry.public_id)}
								onDelete={onDelete}
							/>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default HistoryTable;
