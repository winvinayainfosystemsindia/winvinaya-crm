import React from 'react';
import { TableRow, TableCell, Stack, Box } from '@mui/material';
import CRMAvatar from '../../common/CRMAvatar';
import CRMStatusBadge from '../../common/CRMStatusBadge';
import CRMRowActions from '../../common/CRMRowActions';
import type { Company } from '../../../../models/company';

interface CompanyTableRowProps {
	company: Company;
	isAdmin: boolean;
	onView: (company: Company) => void;
	onEdit: (company: Company) => void;
	onDelete?: (company: Company) => void;
	onClick: (company: Company) => void;
}

const CompanyTableRow: React.FC<CompanyTableRowProps> = ({
	company,
	isAdmin,
	onView,
	onEdit,
	onDelete,
	onClick,
}) => {
	const cellSx = {
		fontSize: '0.875rem',
		color: '#16191f',
		borderBottom: '1px solid #eaeded',
		padding: '10px 16px',
	};

	return (
		<TableRow
			hover
			tabIndex={-1}
			key={company.public_id}
			onClick={() => onClick(company)}
			sx={{
				cursor: 'pointer',
				'&:hover': { bgcolor: '#f5f8fa !important' },
			}}
		>
			{/* Company Name */}
			<TableCell sx={cellSx}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<CRMAvatar name={company.name} size={28} />
					<Box sx={{ fontWeight: 700, color: '#007eb9' }}>{company.name}</Box>
				</Stack>
			</TableCell>

			{/* Status */}
			<TableCell sx={cellSx}>
				<CRMStatusBadge label={company.status} status={company.status} type="company" />
			</TableCell>

			{/* Industry */}
			<TableCell sx={cellSx}>{company.industry ?? '—'}</TableCell>

			{/* Website */}
			<TableCell sx={cellSx}>
				{company.website ? (
					<a
						href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: '#007eb9', textDecoration: 'none' }}
						onClick={(e) => e.stopPropagation()}
					>
						{company.website}
					</a>
				) : (
					'—'
				)}
			</TableCell>

			{/* Email */}
			<TableCell sx={cellSx}>{company.email ?? '—'}</TableCell>

			{/* Created On */}
			<TableCell sx={cellSx}>
				{new Date(company.created_at).toLocaleDateString()}
			</TableCell>

			{/* Actions */}
			<TableCell sx={{ ...cellSx, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
				<CRMRowActions
					row={company}
					onView={() => onView(company)}
					onEdit={() => onEdit(company)}
					onDelete={isAdmin && onDelete ? () => onDelete(company) : undefined}
				/>
			</TableCell>
		</TableRow>
	);
};

export default CompanyTableRow;
