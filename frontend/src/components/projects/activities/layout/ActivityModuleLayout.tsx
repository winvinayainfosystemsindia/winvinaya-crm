import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	Box,
	Container,
	Typography,
	useTheme,
	useMediaQuery,
	Paper,
	CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchProjects } from '../../../../store/slices/dsrSlice';
import type { DSRProject } from '../../../../models/dsr';
import ProjectSelectionHeader from '../common/ProjectSelectionHeader';
import ProjectInfoBar from '../common/ProjectInfoBar';

interface ActivityModuleLayoutProps {
	title: string;
	subtitle: string;
	children: (props: { selectedProject: DSRProject; loading: boolean }) => React.ReactNode;
}

const ActivityModuleLayout: React.FC<ActivityModuleLayoutProps> = ({
	title,
	subtitle,
	children
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const dispatch = useAppDispatch();
	const [searchParams, setSearchParams] = useSearchParams();

	const { projects, loading } = useAppSelector((state) => state.dsr);
	const [selectedProject, setSelectedProject] = useState<DSRProject | null>(null);

	const projectId = searchParams.get('projectId');

	useEffect(() => {
		dispatch(fetchProjects({ limit: 500, active_only: true }));
	}, [dispatch]);

	useEffect(() => {
		if (projects.length > 0) {
			if (projectId) {
				const project = projects.find(p => p.public_id === projectId);
				if (project) {
					setSelectedProject(project);
				} else {
					setSearchParams({});
				}
			} else {
				// Optional: selection could be left empty
			}
		}
	}, [projects, projectId]);

	const handleProjectChange = (newValue: DSRProject | null) => {
		setSelectedProject(newValue);
		if (newValue) {
			setSearchParams({ projectId: newValue.public_id });
		} else {
			setSearchParams({});
		}
	};

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh' }}>
			{/* Professional AWS Service Header */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', pt: 2, pb: 4, mb: 0 }}>
				<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
					<Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-start', mb: 4, gap: 3 }}>
						<Box>
							<Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5, letterSpacing: '-0.02em', fontSize: isMobile ? '1.5rem' : '2rem' }}>
								{title}
							</Typography>
							<Typography variant="body2" sx={{ color: '#aab7bd', maxWidth: 600 }}>
								{subtitle}
							</Typography>
						</Box>
						<Box sx={{ minWidth: 320 }}>
							<ProjectSelectionHeader
								projects={projects}
								selectedProject={selectedProject}
								onProjectChange={handleProjectChange}
							/>
						</Box>
					</Box>

					{selectedProject && (
						<ProjectInfoBar project={selectedProject} />
					)}
				</Container>
			</Box>

			<Container maxWidth="xl" sx={{ py: 4 }}>
				{!selectedProject ? (
					<Paper elevation={0} sx={{ p: 10, textAlign: 'center', border: '1px solid #d5dbdb', borderRadius: '2px' }}>
						<CircularProgress sx={{ mb: 3, color: '#d5dbdb' }} />
						<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }} gutterBottom>
							No Project Selected
						</Typography>
						<Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
							Please select an active project from the header to view and manage its activity planning.
						</Typography>
					</Paper>
				) : (
					<Box>
						{children({ selectedProject, loading })}
					</Box>
				)}
			</Container>
		</Box>
	);
};

export default ActivityModuleLayout;
