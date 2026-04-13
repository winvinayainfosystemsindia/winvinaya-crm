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
	useTheme
} from '@mui/material';
import CustomTablePagination from '../CustomTablePagination';
import DataTableHeader from './DataTableHeader';
import type { DataTableHeaderProps } from './DataTableHeader';

import DataTableEmpty from './DataTableEmpty';
import DataTableSkeleton from './DataTableSkeleton';

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
	const theme = useTheme();
	const visibleColumns = columns.filter(col => !col.hidden);

	return (
		<Paper sx={{
			border: `1px solid ${theme.palette.divider}`,
			boxShadow: 'none',
			borderRadius: `${theme.shape.borderRadius}px`,
			overflow: 'hidden'
		}}>
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
						<TableRow sx={{ bgcolor: theme.palette.background.default }}>
							{visibleColumns.map((column) => (
								<TableCell
									key={String(column.id)}
									align={column.align || 'left'}
									style={{ width: column.width }}
									sx={{
										fontWeight: 700,
										color: theme.palette.text.secondary,
										whiteSpace: 'nowrap',
										fontSize: '0.75rem',
										textTransform: 'uppercase',
										letterSpacing: '0.05em',
										borderBottom: `2px solid ${theme.palette.divider}`,
										py: 1.5
									}}
								>
									{column.sortable && onSortRequest ? (
										<TableSortLabel
											active={orderBy === column.id}
											direction={orderBy === column.id ? order : 'asc'}
											onClick={() => onSortRequest(column.id as keyof T)}
											sx={{
												'&.Mui-active': {
													fontWeight: 800,
													color: theme.palette.text.primary
												},
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
							<DataTableSkeleton
								columns={visibleColumns}
								rowsPerPage={rowsPerPage || 5}
							/>
						) : data.length === 0 ? (
							<DataTableEmpty
								colSpan={visibleColumns.length}
								message={emptyMessage}
							/>
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
