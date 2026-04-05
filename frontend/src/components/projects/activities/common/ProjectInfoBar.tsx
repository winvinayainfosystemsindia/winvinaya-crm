import React from 'react';
import {
	Box,
	Typography,
	Divider,
	Chip,
	Tooltip,
	Paper
} from '@mui/material';
import {
	Person as OwnerIcon
} from '@mui/icons-material';
import type { DSRProject } from '../../../../models/dsr';

interface ProjectInfoBarProps {
	project: DSRProject;
}

const ProjectInfoBar: React.FC<ProjectInfoBarProps> = ({ project }) => {
	return (
		<Paper
			elevation={0}
			sx={{
				bgcolor: 'rgba(255, 255, 255, 0.05)',
				borderRadius: '2px',
				p: 2,
				border: '1px solid rgba(255, 255, 255, 0.1)',
				display: 'flex',
				flexWrap: 'wrap',
				gap: 4
			}}
		>
			<Box>
				<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					Project Name
				</Typography>
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{project.name}</Typography>
			</Box>
			
			<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
			
			<Box>
				<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					Owner
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<OwnerIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
					<Typography variant="body2" sx={{ color: 'white' }}>{project.owner?.full_name || project.owner?.username || 'N/A'}</Typography>
				</Box>
			</Box>
			
			<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
			
			<Box>
				<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					Project Type
				</Typography>
				<Chip
					label={project.project_type.toUpperCase()}
					size="small"
					sx={{
						height: 20,
						fontSize: '0.65rem',
						fontWeight: 900,
						bgcolor: project.project_type === 'training' ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)',
						color: project.project_type === 'training' ? '#232f3e' : 'white',
						borderRadius: '2px',
						border: project.project_type === 'training' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'
					}}
				/>
			</Box>

			{project.project_type === 'training' && project.linked_batches && project.linked_batches.length > 0 && (
				<>
					<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
					<Box>
						<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Training Batches
						</Typography>
						<Tooltip 
							title={
								<Box sx={{ p: 1 }}>
									<Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Linked Batches:</Typography>
									{project.linked_batches.map((batch, i) => (
										<Typography key={batch.public_id} variant="caption" sx={{ display: 'block', mb: i === (project.linked_batches?.length || 0) - 1 ? 0 : 0.5 }}>
											• {batch.batch_name}
										</Typography>
									))}
								</Box>
							} 
							arrow
						>
							<Chip
								label={`${project.linked_batches.length} ${project.linked_batches.length === 1 ? 'Batch' : 'Batches'}`}
								size="small"
								sx={{
									height: 20,
									fontSize: '0.65rem',
									fontWeight: 900,
									bgcolor: 'rgba(255, 255, 255, 0.1)',
									color: 'white',
									borderRadius: '2px',
									border: '1px solid rgba(255, 255, 255, 0.2)',
									cursor: 'help'
								}}
							/>
						</Tooltip>
					</Box>
				</>
			)}

			<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
			
			<Box>
				<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					Status
				</Typography>
				<Chip
					label={project.is_active ? 'ACTIVE' : 'INACTIVE'}
					size="small"
					sx={{
						height: 20,
						fontSize: '0.65rem',
						fontWeight: 900,
						bgcolor: project.is_active ? '#037f0c' : 'rgba(255, 255, 255, 0.1)',
						color: 'white',
						borderRadius: '2px',
						border: project.is_active ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'
					}}
				/>
			</Box>
		</Paper>
	);
};

export default ProjectInfoBar;
