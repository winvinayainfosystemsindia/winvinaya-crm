import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Tooltip,
	Box,
	Chip,
	CircularProgress,
	TextField,
	InputAdornment,
	Button
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	ListAlt as ActivityIcon,
	CloudUpload as ImportIcon
} from '@mui/icons-material';
import type { DSRProject } from '../../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProjects } from '../../../store/slices/dsrSlice';
import dsrProjectService from '../../../services/dsrProjectService';
import ExcelImportModal from '../../common/ExcelImportModal';
import CustomTablePagination from '../../common/CustomTablePagination';

interface ProjectTableProps {
	onEdit: (project: DSRProject) => void;
	onDelete: (project: DSRProject) => void;
	onManageActivities: (project: DSRProject) => void;
	refreshKey: number;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
	onEdit,
	onDelete,
	onManageActivities,
	refreshKey
}) => {
	const dispatch = useAppDispatch();
	const { projects, loading, totalProjects: total } = useAppSelector((state) => state.dsr);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [importModalOpen, setImportModalOpen] = useState(false);

	useEffect(() => {
		dispatch(fetchProjects({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			active_only: false,
			search
		}));
	}, [dispatch, page, rowsPerPage, search, refreshKey]);

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Paper variant="outlined" sx={{ borderRadius: 1 }}>
			<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
				<TextField
					placeholder="Search projects..."
					size="small"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ maxWidth: 300 }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
				<Button
					variant="outlined"
					startIcon={<ImportIcon />}
					onClick={() => setImportModalOpen(true)}
					sx={{ color: '#232f3e', borderColor: '#d5dbdb', textTransform: 'none', fontWeight: 700 }}
				>
					Import Excel
				</Button>
			</Box>
			<TableContainer>
				<Table>
					<TableHead sx={{ bgcolor: '#f2f3f3' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>Project Name</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={4} align="center" sx={{ py: 3 }}>
									<CircularProgress size={24} color="inherit" />
								</TableCell>
							</TableRow>
						) : projects.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align="center" sx={{ py: 3 }}>
									No projects found.
								</TableCell>
							</TableRow>
						) : (
							projects.map((project) => (
								<TableRow key={project.public_id} hover>
									<TableCell sx={{ fontWeight: 600 }}>{project.name}</TableCell>
									<TableCell>
										{project.owner ? (project.owner.full_name || project.owner.username) : 'Unassigned'}
									</TableCell>
									<TableCell>
										<Chip
											label={project.is_active ? 'ACTIVE' : 'INACTIVE'}
											color={project.is_active ? 'success' : 'default'}
											size="small"
											variant="outlined"
										/>
									</TableCell>
									<TableCell align="right">
										<Tooltip title="Manage Activities">
											<IconButton onClick={() => onManageActivities(project)} size="small" sx={{ mr: 1, color: '#1a73e8' }}>
												<ActivityIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Edit">
											<IconButton onClick={() => onEdit(project)} size="small" sx={{ mr: 1 }}>
												<EditIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton onClick={() => onDelete(project)} size="small" color="error">
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<CustomTablePagination
				count={total}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
				onRowsPerPageSelectChange={(rows) => { setRowsPerPage(rows); setPage(0); }}
			/>

			<ExcelImportModal
				open={importModalOpen}
				onClose={() => setImportModalOpen(false)}
				onImport={(file) => dsrProjectService.importFromExcel(file)}
				title="Import Projects from Excel"
				description="Upload an Excel file with 'name' and 'owner_email' columns to bulk-create projects."
			/>
		</Paper>
	);
};

export default ProjectTable;
