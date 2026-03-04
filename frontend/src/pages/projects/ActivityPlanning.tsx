import React, { useState } from 'react';
import {
	Box,
	Button,
} from '@mui/material';
import {
	Add as AddIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import type { DSRActivity } from '../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteActivity } from '../../store/slices/dsrSlice';
import useToast from '../../hooks/useToast';
import dsrActivityService from '../../services/dsrActivityService';
import ActivityTable from '../../components/projects/activities/table/ActivityTable';
import ActivityDialog from '../../components/projects/activities/forms/ActivityDialog';
import ActivityStats from '../../components/projects/activities/stats/ActivityStats';
import ExcelImportModal from '../../components/common/ExcelImportModal';
import ActivityModuleLayout from '../../components/projects/activities/layout/ActivityModuleLayout';

const ActivityPlanning: React.FC = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const [searchParams] = useSearchParams();
	const projectId = searchParams.get('projectId');

	const { user } = useAppSelector((state) => state.auth);
	const { projects } = useAppSelector((state) => state.dsr);
	const project = projects.find(p => p.public_id === projectId);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState<DSRActivity | null>(null);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	// Permission Logic: admin, manager, or project owner
	const isAdmin = user?.role === 'admin';
	const isManager = user?.role === 'manager';
	const isOwner = !!(project && user && (project.owner?.public_id === user.public_id || project.owner_id === user.id));
	const canEdit = !!(isAdmin || isManager || isOwner);

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

	return (
		<ActivityModuleLayout
			title="Activity Planning"
			subtitle="Define and manage project-specific work items and timelines"
		>
			{({ selectedProject }) => (
				<Box>
					<Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
						{canEdit && (
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
						)}
					</Box>

					<ActivityStats projectId={selectedProject.public_id} refreshKey={refreshKey} />

					<ActivityTable
						projectId={selectedProject.public_id}
						onEdit={handleEdit}
						onDelete={handleDelete}
						refreshKey={refreshKey}
						canEdit={canEdit}
					/>

					<ActivityDialog
						open={dialogOpen}
						activity={selectedActivity}
						projectId={selectedProject.public_id}
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
						onImport={(file) => dsrActivityService.importFromExcel(file, selectedProject.public_id)}
						title="Import Activities from Excel"
						description="Upload an Excel file with 'name', 'description', 'start_date', 'end_date' columns."
					/>
				</Box>
			)}
		</ActivityModuleLayout>
	);
};

export default ActivityPlanning;
