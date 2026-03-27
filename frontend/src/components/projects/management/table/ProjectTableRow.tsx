import React from 'react';
import {
	TableRow,
	TableCell,
	Box,
	Typography,
	IconButton,
	useTheme
} from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import type { DSRProject } from '../../../../models/dsr';

interface ProjectTableRowProps {
	project: DSRProject;
	onActionClick: (event: React.MouseEvent<HTMLButtonElement>, project: DSRProject) => void;
	formatDate: (dateString: string) => string;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
	project,
	onActionClick,
	formatDate
}) => {
	const theme = useTheme();

	return (
		<TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
			<TableCell sx={{ py: 2, fontSize: '0.8125rem', color: theme.palette.text.primary }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 500 }}>
						{project.name}
					</Typography>
				</Box>
			</TableCell>
			<TableCell sx={{ fontSize: '0.8125rem', py: 2, color: theme.palette.text.primary }}>
				{project.owner ? (project.owner.full_name || project.owner.username) : 'Unassigned'}
			</TableCell>
			<TableCell sx={{ fontSize: '0.8125rem', py: 2, color: theme.palette.text.primary }}>
				{project.creator ? (project.creator.full_name || project.creator.username) : 'N/A'}
			</TableCell>
			<TableCell sx={{ fontSize: '0.8125rem', py: 2, color: theme.palette.text.secondary }}>
				{formatDate(project.created_at)}
			</TableCell>
			<TableCell sx={{ py: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{
						width: 8,
						height: 8,
						borderRadius: '50%',
						bgcolor: project.is_active ? '#037f0c' : '#d13212'
					}} />
					<Typography sx={{ fontSize: '0.8125rem', color: project.is_active ? '#037f0c' : '#d13212' }}>
						{project.is_active ? 'Active' : 'Inactive'}
					</Typography>
				</Box>
			</TableCell>
			<TableCell align="right" sx={{ py: 1 }}>
				<IconButton
					size="small"
					onClick={(e) => onActionClick(e, project)}
					sx={{ color: theme.palette.text.secondary }}
				>
					<MoreIcon fontSize="small" />
				</IconButton>
			</TableCell>
		</TableRow>
	);
};

export default ProjectTableRow;
