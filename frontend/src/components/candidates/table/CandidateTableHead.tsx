import React from 'react';
import {
	TableHead,
	TableRow,
	TableCell,
	TableSortLabel
} from '@mui/material';
import type { CandidateListItem } from '../../../models/candidate';

interface HeadCell {
	id: string;
	label: string;
	hideOnMobile: boolean;
}

interface CandidateTableHeadProps {
	order: 'asc' | 'desc';
	orderBy: keyof CandidateListItem;
	onRequestSort: (property: keyof CandidateListItem) => void;
}

const headCells: HeadCell[] = [
	{ id: 'name', label: 'Name', hideOnMobile: false },
	{ id: 'email', label: 'Email', hideOnMobile: true },
	{ id: 'phone', label: 'Phone', hideOnMobile: true },
	{ id: 'city', label: 'Location', hideOnMobile: true },
	{ id: 'disability_type', label: 'Disability', hideOnMobile: false },
	{ id: 'created_at', label: 'Date', hideOnMobile: true },
];

const CandidateTableHead: React.FC<CandidateTableHeadProps> = ({
	order,
	orderBy,
	onRequestSort
}) => {
	return (
		<TableHead>
			<TableRow sx={{ bgcolor: '#fafafa' }}>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						sortDirection={orderBy === headCell.id ? order : false}
						sx={{
							fontWeight: 'bold',
							color: 'text.secondary',
							fontSize: '0.875rem',
							borderBottom: '2px solid #d5dbdb',
							display: headCell.hideOnMobile ? { xs: 'none', md: 'table-cell' } : 'table-cell'
						}}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : 'asc'}
							onClick={() => onRequestSort(headCell.id as keyof CandidateListItem)}
						>
							{headCell.label}
						</TableSortLabel>
					</TableCell>
				))}
				<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
					Actions
				</TableCell>
			</TableRow>
		</TableHead>
	);
};

export default CandidateTableHead;
