import React, { useEffect, useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Button,
	CircularProgress
} from '@mui/material';
import {
	Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import type { DSRActivity } from '../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProject, deleteActivity } from '../../store/slices/dsrSlice';
import useToast from '../../hooks/useToast';
import dsrActivityService from '../../services/dsrActivityService';
import ActivityTable from '../../components/projects/activities/table/ActivityTable';
import ActivityDialog from '../../components/projects/activities/forms/ActivityDialog';
import ActivityStats from '../../components/projects/activities/stats/ActivityStats';
import ExcelImportModal from '../../components/common/ExcelImportModal';

const ActivityPlanning: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { projectId } = useParams<{ projectId: string }>();

	const { projects, loading } = useAppSelector((state) => state.dsr);
	const project = projects.find(p => p.public_id === projectId);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState<DSRActivity | null>(null);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		if (projectId && !project) {
			dispatch(fetchProject(projectId)).unwrap().catch(() => {
				toast.error('Project not found');
				navigate('/projects');
			});
		}
	}, [projectId, project, dispatch, navigate, toast]);

	const handleAdd = () => {
		setSelectedActivity(null);
		setDialogOpen(true);
	};

	const handleEdit = (activity: DSRActivity) => {
		setSelectedActivity(activity);
		setDialogOpen(true);
	};

	const handleDelete = async (activity: DSRActivity) => {
		if (window.confirm(`Are you sure you want to delete activity "${activity.name}"?`)) {
			try {
				await dispatch(deleteActivity(activity.public_id)).unwrap();
				toast.success('Activity deleted successfully');
				setRefreshKey(prev => prev + 1);
			} catch (error: any) {
				toast.error(error || 'Failed to delete activity');
			}
		}
	};

	if (loading && !project) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">

				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary', mb: 0.5 }}>
							{project?.name} - Planning
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Define and manage activities for this project
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', gap: 1.5 }}>
						<Button
							variant="outlined"
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
							Import Excel
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
							Add Activity
						</Button>
					</Box>
				</Box>

				<ActivityStats projectId={projectId!} refreshKey={refreshKey} />

				<ActivityTable
					projectId={projectId!}
					onEdit={handleEdit}
					onDelete={handleDelete}
					refreshKey={refreshKey}
				/>

				<ActivityDialog
					open={dialogOpen}
					activity={selectedActivity}
					projectId={projectId!}
					onClose={() => setDialogOpen(false)}
					onSuccess={() => {
						toast.success(selectedActivity ? 'Activity updated' : 'Activity created');
						setRefreshKey(prev => prev + 1);
						setDialogOpen(false);
					}}
				/>

				<ExcelImportModal
					open={importModalOpen}
					onClose={() => setImportModalOpen(false)}
					onImport={(file) => dsrActivityService.importFromExcel(file, projectId!)}
					title="Import Activities from Excel"
					description="Upload an Excel file with 'name', 'description', 'start_date', 'end_date' columns."
				/>
			</Container>
		</Box>
	);
};

export default ActivityPlanning;
