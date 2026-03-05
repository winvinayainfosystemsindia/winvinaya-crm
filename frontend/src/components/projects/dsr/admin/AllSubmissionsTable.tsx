import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	CircularProgress,
	Chip,
	TablePagination
} from '@mui/material';
import type { DSREntry } from '../../../../models/dsr';

interface AllSubmissionsTableProps {
	entries: DSREntry[];
	total: number;
	loading: boolean;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: any, newPage: number) => void;
	onRowsPerPageChange: (event: any) => void;
}

const AllSubmissionsTable: React.FC<AllSubmissionsTableProps> = ({
	entries,
	total,
	loading,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange
}) => {
	return (
		<>
			<TableContainer>
				<Table>
					<TableHead sx={{ bgcolor: '#f2f3f3' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={4} align="center" sx={{ py: 3 }}>
									<CircularProgress size={24} color="inherit" />
								</TableCell>
							</TableRow>
						) : !entries || entries.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align="center" sx={{ py: 3 }}>
									No submissions found for this date.
								</TableCell>
							</TableRow>
						) : (
							entries.map((entry) => (
								<TableRow key={entry.public_id} hover>
									<TableCell sx={{ fontWeight: 600 }}>{entry.user?.full_name || entry.user?.username}</TableCell>
									<TableCell>
										<Chip
											label={entry.status.toUpperCase()}
											size="small"
											variant="outlined"
											sx={{ borderRadius: '2px', fontWeight: 700, fontSize: '0.65rem' }}
										/>
									</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>{entry.items.reduce((s, i) => s + (i.hours || 0), 0).toFixed(1)} h</TableCell>
									<TableCell>{entry.submitted_at ? new Date(entry.submitted_at).toLocaleString() : 'N/A'}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				component="div"
				count={total}
				page={page}
				onPageChange={onPageChange}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={onRowsPerPageChange}
				rowsPerPageOptions={[5, 10, 25]}
			/>
		</>
	);
};

export default AllSubmissionsTable;
