import React, { useRef, useCallback } from 'react';
import { Box, Container, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/page-header';
import CRMTaskList from '../../components/crm/tasks/CRMTaskList';

const TaskManagement: React.FC = () => {
	
	const addTaskTrigger = useRef<(() => void) | null>(null);

	const handleAddClick = useCallback(() => {
		if (addTaskTrigger.current) {
			addTaskTrigger.current();
		}
	}, []);

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				<PageHeader
					title="Task Management"
					subtitle="Organize and track your daily CRM activities and follow-ups"
					action={
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={handleAddClick}
							sx={{
								textTransform: 'none',
								fontWeight: 600,
								px: 3,
								py: 1,
								borderRadius: 3,
								boxShadow: 'none',
								'&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
							}}
						>
							Add Task
						</Button>
					}
				/>
				
				<CRMTaskList onAddClick={(trigger) => { addTaskTrigger.current = trigger; }} />
			</Container>
		</Box>
	);
};

export default TaskManagement;
