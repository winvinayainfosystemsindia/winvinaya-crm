import React from 'react';
import { Edit, Delete, AssignmentInd } from '@mui/icons-material';
import { DataTableActions, type TableMenuAction } from '../../common/table';
import type { CandidateListItem } from '../../../models/candidate';

interface CandidateTableActionsProps {
	candidate: CandidateListItem;
	userRole: string | null;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (candidate: CandidateListItem) => void;
	onAssign: (candidate: CandidateListItem) => void;
}

const CandidateTableActions: React.FC<CandidateTableActionsProps> = ({
	candidate,
	userRole,
	onEdit,
	onDelete,
	onAssign
}) => {
	const isAdmin = userRole === 'admin';
	const isManager = isAdmin || userRole === 'manager';

	const actions: TableMenuAction<CandidateListItem>[] = [
		{
			label: 'Edit Candidate',
			icon: <Edit fontSize="small" />,
			onClick: (item) => onEdit(item.public_id),
			color: 'warning.main',
			hidden: !isManager
		},
		{
			label: 'Assign Candidate',
			icon: <AssignmentInd fontSize="small" />,
			onClick: (item) => onAssign(item),
			color: 'info.main',
			hidden: !isManager
		},
		{
			label: 'Delete Candidate',
			icon: <Delete fontSize="small" />,
			onClick: (item) => onDelete(item),
			color: 'error.main',
			hidden: !isAdmin,
			divider: false
		}
	];

	return (
		<DataTableActions
			item={candidate}
			actions={actions}
			menuId={`candidate-actions-${candidate.public_id}`}
		/>
	);
};

export default CandidateTableActions;
