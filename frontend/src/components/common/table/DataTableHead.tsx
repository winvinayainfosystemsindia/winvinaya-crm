import {
	TableHead,
	TableRow,
	TableCell,
	TableSortLabel,
	useTheme
} from '@mui/material';

export interface ColumnDefinition<T> {
	id: keyof T | 'actions';
	label: string;
	sortable?: boolean;
	align?: 'left' | 'right' | 'center';
	width?: string | number;
	hidden?: boolean;
}

interface DataTableHeadProps<T> {
	columns: ColumnDefinition<T>[];
	orderBy?: keyof T;
	order?: 'asc' | 'desc';
	onSortRequest?: (property: keyof T) => void;
}

/**
 * Modular TableHead component for DataTable.
 * Manages column rendering and sorting labels with theme-aligned styling.
 */
const DataTableHead = <T,>({
	columns,
	orderBy,
	order = 'asc',
	onSortRequest
}: DataTableHeadProps<T>) => {
	const theme = useTheme();
	const visibleColumns = columns.filter(col => !col.hidden);

	return (
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
	);
};

export default DataTableHead;
