import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	TablePagination,
	Skeleton,
	TableSortLabel
} from '@mui/material';

interface Column<T = any> {
	id: string;
	label: string;
	minWidth?: number;
	align?: 'right' | 'left' | 'center';
	format?: (value: any, row: T) => React.ReactNode;
	sortable?: boolean;
}

interface CRMTableProps<T = any> {
	columns: Column<T>[];
	rows: T[];
	total: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (event: unknown, newPage: number) => void;
	onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	orderBy?: string;
	order?: 'asc' | 'desc';
	onSort?: (id: string) => void;
	loading?: boolean;
	emptyMessage?: string;
	onRowClick?: (row: T) => void;
}

const CRMTable = <T extends object>({
	columns,
	rows,
	total,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	orderBy,
	order = 'desc',
	onSort,
	loading,
	emptyMessage = 'No records found',
	onRowClick
}: CRMTableProps<T>) => {
	return (
		<Paper
			elevation={0}
			sx={{
				width: '100%',
				overflow: 'hidden',
				border: '1px solid #d5dbdb',
				borderRadius: '2px'
			}}
		>
			<TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
				<Table stickyHeader aria-label="sticky table" size="small">
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell
									key={column.id}
									align={column.align}
									style={{
										minWidth: column.minWidth,
										backgroundColor: '#fafafa',
										color: '#232f3e',
										fontWeight: 600,
										fontSize: '0.85rem',
										borderBottom: '1px solid #d5dbdb',
										padding: '12px 16px'
									}}
								>
									{column.sortable && onSort ? (
										<TableSortLabel
											active={orderBy === column.id}
											direction={orderBy === column.id ? order : 'asc'}
											onClick={() => onSort(column.id)}
											sx={{
												'&.MuiTableSortLabel-active': { color: '#232f3e' },
												'& .MuiTableSortLabel-icon': { color: '#232f3e !important' }
											}}
										>
											{column.label}
										</TableSortLabel>
									) : (
										column.label
									)}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							Array.from(new Array(5)).map((_, index) => (
								<TableRow key={index}>
									{columns.map((col) => (
										<TableCell key={col.id} sx={{ py: 2 }}>
											<Skeleton variant="text" />
										</TableCell>
									))}
								</TableRow>
							))
						) : rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
									<Typography variant="body2" sx={{ color: '#545b64' }}>
										{emptyMessage}
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							rows.map((row, index) => (
								<TableRow
									hover
									role="checkbox"
									tabIndex={-1}
									key={(row as { public_id?: string | number }).public_id || index}
									onClick={() => onRowClick && onRowClick(row)}
									sx={{
										cursor: onRowClick ? 'pointer' : 'default',
										'&:hover': {
											bgcolor: '#f5f8fa !important'
										}
									}}
								>
									{columns.map((column) => {
										const value = (row as any)[column.id];
										return (
											<TableCell
												key={column.id}
												align={column.align}
												sx={{
													fontSize: '0.875rem',
													color: '#16191f',
													borderBottom: '1px solid #eaeded',
													padding: '10px 16px'
												}}
											>
												{column.format ? column.format(value, row) : (value as React.ReactNode)}
											</TableCell>
										);
									})}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[10, 25, 100]}
				component="div"
				count={total}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				sx={{
					borderTop: '1px solid #eaeded',
					'.MuiTablePagination-toolbar': {
						minHeight: 48
					},
					'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
						fontSize: '0.75rem',
						color: '#545b64'
					}
				}}
			/>
		</Paper>
	);
};

export default CRMTable;
