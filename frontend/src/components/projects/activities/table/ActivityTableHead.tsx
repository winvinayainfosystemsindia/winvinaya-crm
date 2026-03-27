import React from 'react';
import {
	TableHead,
	TableRow,
	TableCell,
	Checkbox,
	useTheme
} from '@mui/material';

interface ActivityTableHeadProps {
	canEdit?: boolean;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	numSelected: number;
	rowCount: number;
}

const ActivityTableHead: React.FC<ActivityTableHeadProps> = ({ 
	canEdit = false,
	onSelectAllClick,
	numSelected,
	rowCount
}) => {
	const theme = useTheme();

	return (
		<TableHead>
			<TableRow sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
				<TableCell padding="checkbox" sx={{ py: 2 }}>
					<Checkbox
						indeterminate={numSelected > 0 && numSelected < rowCount}
						checked={rowCount > 0 && numSelected === rowCount}
						onChange={onSelectAllClick}
						size="small"
					/>
				</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Activity Name</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Assigned To</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Start Date</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>End Date</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Status</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Effort (Est/Act)</TableCell>
				<TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Timeline</TableCell>
				{canEdit && <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.8125rem', py: 2 }}>Actions</TableCell>}
			</TableRow>
		</TableHead>
	);
};

export default ActivityTableHead;
