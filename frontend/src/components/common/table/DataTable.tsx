import React from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
	Skeleton
} from '@mui/material';
import CustomTablePagination from '../CustomTablePagination';
import DataTableHeader from './DataTableHeader';
import type { DataTableHeaderProps } from './DataTableHeader';

export interface ColumnDefinition<T> {
	id: keyof T | 'actions';
	label: string;
	sortable?: boolean;
	align?: 'left' | 'right' | 'center';
	width?: string | number;
	hidden?: boolean;
}

export interface DataTableProps<T> extends DataTableHeaderProps {
	columns: ColumnDefinition<T>[];
	data: T[];
	totalCount: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (newPage: number) => void;
	onRowsPerPageChange: (newRowsPerPage: number) => void;
	orderBy?: keyof T;
	order?: 'asc' | 'desc';
	onSortRequest?: (property: keyof T) => void;
	emptyMessage?: string;
	renderRow: (item: T) => React.ReactNode;
}

const DataTable = <T,>({
	columns,
	data,
	loading,
	totalCount,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	searchTerm = '',
	onSearchChange,
	searchPlaceholder,
	orderBy,
	order = 'asc',
	onSortRequest,
	onRefresh,
	onFilterOpen,
	activeFilterCount,
	onCreateClick,
	createButtonText,
	canCreate,
	headerActions,
	emptyMessage = 'No records found',
	renderRow
}: DataTableProps<T>) => {
	const visibleColumns = columns.filter(col => !col.hidden);

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
			<DataTableHeader
				searchTerm={searchTerm}
				onSearchChange={onSearchChange}
				searchPlaceholder={searchPlaceholder}
				activeFilterCount={activeFilterCount}
				onFilterOpen={onFilterOpen}
				onRefresh={onRefresh}
				onCreateClick={onCreateClick}
				createButtonText={createButtonText}
				canCreate={canCreate}
				loading={loading}
				headerActions={headerActions}
			/>

			<TableContainer>
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							{visibleColumns.map((column) => (
								<TableCell
									key={String(column.id)}
									align={column.align || 'left'}
									style={{ width: column.width }}
									sx={{
										fontWeight: 600,
										color: '#545b64',
										whiteSpace: 'nowrap',
										fontSize: '0.8125rem',
										borderBottom: '2px solid #d5dbdb'
									}}
								>
									{column.sortable && onSortRequest ? (
										<TableSortLabel
											active={orderBy === column.id}
											direction={orderBy === column.id ? order : 'asc'}
											onClick={() => onSortRequest(column.id as keyof T)}
											sx={{
												'&.Mui-active': { fontWeight: 700 },
												'& .MuiTableSortLabel-icon': { fontSize: 16 }
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
					<TableBody aria-busy={loading}>
						{loading ? (
							Array.from(new Array(rowsPerPage || 5)).map((_, index) => (
								<TableRow key={`skeleton-${index}`}>
									{visibleColumns.map((col, colIdx) => (
										<TableCell key={`skeleton-cell-${colIdx}`} align={col.align || 'left'}>
											<Skeleton variant="text" width={col.id === 'actions' ? 60 : '80%'} height={24} sx={{ 
												ml: col.align === 'right' ? 'auto' : 0,
												mr: col.align === 'center' ? 'auto' : 0
											}} />
										</TableCell>
									))}
								</TableRow>
							))
						) : data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 8 }}>
									<Typography variant="body2" color="text.secondary">
										{emptyMessage}
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							data.map(renderRow)
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<CustomTablePagination
				count={totalCount}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={(_e, p) => onPageChange(p)}
				onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
				onRowsPerPageSelectChange={onRowsPerPageChange}
			/>
		</Paper>
	);
};

export default DataTable;
