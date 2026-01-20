import React from 'react';
import {
	Box,
	Typography,
	Button,
	Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createCRMTask, updateCRMTask } from '../../../../store/slices/crmTaskSlice';
import { fetchCompanyById } from '../../../../store/slices/companySlice';
import CRMTable from '../../common/CRMTable';
import CRMTaskFormDialog from '../../tasks/CRMTaskFormDialog';
import type { Company } from '../../../../models/company';
import type { CRMTask } from '../../../../models/crmTask';

interface TasksTabProps {
	company: Company;
	columns: any[];
}

const TasksTab: React.FC<TasksTabProps> = ({ company, columns }) => {
	const dispatch = useAppDispatch();
	const { publicId } = useParams<{ publicId: string }>();
	const { loading } = useAppSelector((state) => state.crmTasks);

	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [selectedTask, setSelectedTask] = React.useState<CRMTask | null>(null);

	const handleAddTask = () => {
		setSelectedTask(null);
		setDialogOpen(true);
	};

	const handleEditTask = (task: CRMTask) => {
		setSelectedTask(task);
		setDialogOpen(true);
	};

	const handleDialogSubmit = async (data: any) => {
		try {
			if (selectedTask) {
				await dispatch(updateCRMTask({ publicId: selectedTask.public_id, task: data })).unwrap();
			} else {
				// Pre-fill association if creating from company tab
				const taskData = {
					...data,
					related_to_type: 'company',
					related_to_id: company.id
				};
				await dispatch(createCRMTask(taskData)).unwrap();
			}
			setDialogOpen(false);
			// Refresh company to show new task
			if (publicId) dispatch(fetchCompanyById(publicId));
		} catch (error) {
			console.error('Failed to save task:', error);
		}
	};

	return (
		<Box>
			<Paper sx={{ borderRadius: '2px', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.3), 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15)' }}>
				<Box sx={{ p: 3, borderBottom: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#232f3e' }}>
						Tasks ({company.tasks?.length || 0})
					</Typography>
					<Button
						variant="contained"
						sx={{ bgcolor: '#007eb9', color: 'white', '&:hover': { bgcolor: '#006a9e' }, textTransform: 'none', fontWeight: 800 }}
						onClick={handleAddTask}
					>
						Add New Task
					</Button>
				</Box>
				<CRMTable
					columns={columns}
					rows={company.tasks || []}
					total={company.tasks?.length || 0}
					page={0}
					rowsPerPage={100}
					onPageChange={() => { }}
					onRowsPerPageChange={() => { }}
					emptyMessage="No tasks associated with this company."
					onRowClick={handleEditTask}
				/>
			</Paper>

			<CRMTaskFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleDialogSubmit}
				task={selectedTask}
				initialData={{
					related_to_type: 'company',
					related_to_id: company.id
				}}
				loading={loading}
			/>
		</Box>
	);
};

export default TasksTab;
