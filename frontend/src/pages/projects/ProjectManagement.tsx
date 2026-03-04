import React, { useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Button
} from '@mui/material';
import {
	Add as AddIcon,
	CloudUpload as ImportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { DSRProject } from '../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProject } from '../../store/slices/dsrSlice';
import useToast from '../../hooks/useToast';
import dsrProjectService from '../../services/dsrProjectService';
import ProjectTable from '../../components/projects/management/table/ProjectTable';
import ProjectDialog from '../../components/projects/management/forms/ProjectDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProjectStats from '../../components/projects/management/stats/ProjectStats';
import ExcelImportModal from '../../components/common/ExcelImportModal';

const ProjectManagement: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { loading } = useAppSelector((state) => state.dsr);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<DSRProject | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleteProject, setDeleteProject] = useState<DSRProject | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [importModalOpen, setImportModalOpen] = useState(false);

	const handleAdd = () => {
		setSelectedProject(null);
		setDialogOpen(true);
	};

	const handleEdit = (project: DSRProject) => {
		setSelectedProject(project);
		setDialogOpen(true);
	};

	const handleDeleteRequest = (project: DSRProject) => {
		setDeleteProject(project);
		setConfirmOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteProject) return;
		try {
			await dispatch(updateProject({
				publicId: deleteProject.public_id,
				data: { is_active: false }
			})).unwrap();
			toast.success('Project deactivated successfully');
			setRefreshKey(prev => prev + 1);
		} catch (error: any) {
			toast.error(error || 'Failed to deactivate project');
		} finally {
			setConfirmOpen(false);
		}
	};

	const handleManageActivities = (project: DSRProject) => {
		navigate(`/projects/${project.public_id}/activities`);
	};

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary', mb: 0.5 }}>
							Project Management
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Manage projects and assign owners for DSR tracking
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Button
							variant="outlined"
							startIcon={<ImportIcon />}
							onClick={() => setImportModalOpen(true)}
							sx={{
								color: '#545b64',
								borderColor: '#d5dbdb',
								textTransform: 'none',
								fontWeight: 700,
								fontSize: '0.875rem',
								height: 36,
								borderRadius: '2px',
								'&:hover': {
									bgcolor: '#f2f3f3',
									borderColor: '#aab7b7'
								}
							}}
						>
							Import from Excel
						</Button>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleAdd}
							sx={{
								bgcolor: '#ec7211',
								textTransform: 'none',
								fontWeight: 700,
								fontSize: '0.875rem',
								height: 36,
								borderRadius: '2px',
								'&:hover': { bgcolor: '#eb5f07' }
							}}
						>
							Create project
						</Button>
					</Box>
				</Box>

				<ProjectStats refreshKey={refreshKey} />

				<ProjectTable
					onEdit={handleEdit}
					onDelete={handleDeleteRequest}
					onManageActivities={handleManageActivities}
					refreshKey={refreshKey}
				/>

				<ProjectDialog
					open={dialogOpen}
					project={selectedProject}
					onClose={() => setDialogOpen(false)}
					onSuccess={(msg) => {
						toast.success(msg);
						setRefreshKey(prev => prev + 1);
						setDialogOpen(false);
					}}
				/>

				<ConfirmDialog
					open={confirmOpen}
					title="Deactivate Project"
					message={`Are you sure you want to deactivate project "${deleteProject?.name}"? You can re-activate it later by editing.`}
					loading={loading}
					onClose={() => setConfirmOpen(false)}
					onConfirm={handleDeleteConfirm}
				/>

				<ExcelImportModal
					open={importModalOpen}
					onClose={() => setImportModalOpen(false)}
					onImport={(file) => dsrProjectService.importFromExcel(file)}
					title="Import Projects from Excel"
					description="Upload an Excel file with 'name' and 'owner_email' columns to bulk-create projects."
				/>
			</Container>
		</Box>
	);
};

export default ProjectManagement;
