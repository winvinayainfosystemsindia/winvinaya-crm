import { TableHead, TableRow, TableCell, TableSortLabel } from '@mui/material';
import type { JobRole } from '../../../../models/jobRole';

interface JobRoleTableHeadProps {
	order: 'asc' | 'desc';
	orderBy: keyof JobRole;
	onRequestSort: (property: keyof JobRole) => void;
}

const JobRoleTableHead: React.FC<JobRoleTableHeadProps> = ({ order, orderBy, onRequestSort }) => {
	const columns: { 
		id: keyof JobRole; 
		label: string; 
		minWidth: number; 
		sortable?: boolean; 
		align?: 'left' | 'center' | 'right';
		hideOnMobile?: boolean 
	}[] = [
		{ id: 'title', label: 'Job Title', minWidth: 200, sortable: true },
		{ id: 'company_id', label: 'Company & Contact', minWidth: 200 },
		{ id: 'status', label: 'Status', minWidth: 120, sortable: true },
		{ id: 'location', label: 'Location', minWidth: 150, hideOnMobile: true },
		{ id: 'no_of_vacancies', label: 'Vacancies', minWidth: 100, sortable: true, align: 'center', hideOnMobile: true },
		{ id: 'close_date', label: 'Close Date', minWidth: 130, sortable: true, hideOnMobile: true },
		{ id: 'created_by_id', label: 'Created By', minWidth: 150, hideOnMobile: true },
		{ id: 'is_visible', label: 'Mapping', minWidth: 100, sortable: true, align: 'center', hideOnMobile: true },
	];

	return (
		<TableHead sx={{ bgcolor: 'background.default' }}>
			<TableRow>
				{columns.map((column) => (
					<TableCell
						key={column.id}
						align={column.align || 'left'}
						sortDirection={orderBy === column.id ? order : false}
						sx={{
							fontWeight: 'bold',
							color: 'text.secondary',
							fontSize: '0.875rem',
							borderBottom: '2px solid',
							borderColor: 'divider',
							display: column.hideOnMobile ? { xs: 'none', md: 'table-cell' } : 'table-cell'
						}}
					>
						{column.sortable ? (
							<TableSortLabel
								active={orderBy === column.id}
								direction={orderBy === column.id ? order : 'asc'}
								onClick={() => onRequestSort(column.id)}
							>
								{column.label}
							</TableSortLabel>
						) : (
							column.label
						)}
					</TableCell>
				))}
				<TableCell
					align="right"
					sx={{
						fontWeight: 'bold',
						color: 'text.secondary',
						fontSize: '0.875rem',
						borderBottom: '2px solid',
						borderColor: 'divider'
					}}
				>
					Actions
				</TableCell>
			</TableRow>
		</TableHead>
	);
};

export default JobRoleTableHead;
