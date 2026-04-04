import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	Autocomplete,
	CircularProgress,
	FormControlLabel,
	Switch,
	Typography,
	IconButton,
	Fade,
	useTheme
} from '@mui/material';
import {
	Close as CloseIcon,
	Assignment as ProjectIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import type { DSRProject } from '../../../../models/dsr';
import type { User } from '../../../../models/user';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createProject, updateProject } from '../../../../store/slices/dsrSlice';
import { fetchUsers } from '../../../../store/slices/userSlice';
import { fetchTrainingBatches } from '../../../../store/slices/trainingSlice';
import type { TrainingBatch } from '../../../../models/training';

interface ProjectDialogProps {
	open: boolean;
	project: DSRProject | null;
	onClose: () => void;
	onSuccess: (message: string) => void;
	onDelete?: (project: DSRProject) => void;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
	open,
	project,
	onClose,
	onSuccess,
	onDelete
}) => {
	const { user: currentUser } = useAppSelector((state) => state.auth);
	const isAdmin = currentUser?.role === 'admin';
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { users, loading: loadingUsers } = useAppSelector((state) => state.users);
	const { batches, loading: loadingBatches } = useAppSelector((state) => state.training);

	const [name, setName] = useState('');
	const [owner, setOwner] = useState<User | null>(null);
	const [isActive, setIsActive] = useState(true);
	const [projectType, setProjectType] = useState<'standard' | 'training'>('standard');
	const [selectedBatches, setSelectedBatches] = useState<TrainingBatch[]>([]);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			dispatch(fetchUsers({ skip: 0, limit: 500 }));
			dispatch(fetchTrainingBatches({ skip: 0, limit: 1000 }));
			
			if (project) {
				setName(project.name);
				setIsActive(project.is_active);
				setProjectType(project.project_type || 'standard');
			} else {
				setName('');
				setOwner(null);
				setIsActive(true);
				setProjectType('standard');
				setSelectedBatches([]);
			}
		}
	}, [open, project, dispatch]);

	useEffect(() => {
		if (open && project && project.owner && users.length > 0) {
			const currentOwner = users.find(u => u.public_id === project.owner?.public_id);
			if (currentOwner) setOwner(currentOwner);
		}
	}, [open, project, users]);

	useEffect(() => {
		if (open && project?.linked_batches && batches.length > 0) {
			const selected = batches.filter(b => 
				project.linked_batches?.some(lb => lb.public_id === b.public_id)
			);
			setSelectedBatches(selected);
		} else if (open && project?.linked_batch && batches.length > 0) {
			// Legacy support
			const batch = batches.find(b => b.public_id === project.linked_batch?.public_id);
			if (batch) setSelectedBatches([batch]);
		}
	}, [open, project, batches]);

	const handleSubmit = async () => {
		if (!owner) return;
		setSubmitting(true);
		try {
			const commonData = {
				name,
				owner_user_public_id: owner.public_id as any,
				is_active: isActive,
				project_type: projectType,
				linked_batch_public_ids: projectType === 'training' ? selectedBatches.map(b => b.public_id) : []
			};

			if (project) {
				await dispatch(updateProject({
					publicId: project.public_id,
					data: commonData
				})).unwrap();
				onSuccess('Project updated successfully');
			} else {
				await dispatch(createProject(commonData)).unwrap();
				onSuccess('Project created successfully');
			}
		} catch (error) {
			console.error('Failed to save project:', error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			TransitionComponent={Fade}
			TransitionProps={{ timeout: 400 }}
			PaperProps={{
				sx: {
					borderRadius: '4px',
					boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
				}
			}}
		>
			<DialogTitle sx={{
				bgcolor: theme.palette.secondary.main,
				color: '#ffffff',
				py: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<ProjectIcon />
					<Box>
						<Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
							{project ? 'Edit Project' : 'Create New Project'}
						</Typography>
						<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
							{project ? `Project ID: ${project.public_id}` : 'Setup a new organizational project'}
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={onClose} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
					<Box>
						<Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.secondary }}>
							Project Type
						</Typography>
						<Box sx={{ display: 'flex', gap: 1 }}>
							<Button
								variant={projectType === 'standard' ? 'contained' : 'outlined'}
								onClick={() => setProjectType('standard')}
								size="small"
								fullWidth
								sx={{ textTransform: 'none' }}
							>
								Standard
							</Button>
							<Button
								variant={projectType === 'training' ? 'contained' : 'outlined'}
								onClick={() => setProjectType('training')}
								size="small"
								fullWidth
								sx={{ textTransform: 'none' }}
							>
								Training
							</Button>
						</Box>
					</Box>

					{projectType === 'training' && (
						<Autocomplete
							multiple
							options={batches}
							getOptionLabel={(option) => option.batch_name}
							value={selectedBatches}
							onChange={(_, newValue) => {
								setSelectedBatches(newValue);
								if (newValue.length > 0 && !name) {
									setName(newValue[0].batch_name);
								}
							}}
							loading={loadingBatches}
							disabled={submitting}
							isOptionEqualToValue={(option, value) => option.public_id === value.public_id}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Associated Training Batches"
									required
									helperText="Linking batches will automatically sync activities from their lesson plans"
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<React.Fragment>
												{loadingBatches ? <CircularProgress color="inherit" size={20} /> : null}
												{params.InputProps.endAdornment}
											</React.Fragment>
										),
									}}
								/>
							)}
						/>
					)}

					<TextField
						label="Project Name"
						fullWidth
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={submitting}
						placeholder={projectType === 'training' && selectedBatches.length > 0 ? selectedBatches[0].batch_name : 'e.g. Internal Development'}
					/>
					
					<Autocomplete
						options={users}
						getOptionLabel={(option) => option.full_name || option.username}
						value={owner}
						onChange={(_, newValue) => setOwner(newValue)}
						loading={loadingUsers}
						disabled={submitting}
						isOptionEqualToValue={(option, value) => option.public_id === value.public_id}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Project Owner / Primary Manager"
								required
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<React.Fragment>
											{loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
											{params.InputProps.endAdornment}
										</React.Fragment>
									),
								}}
							/>
						)}
					/>
					
					<FormControlLabel
						control={
							<Switch
								checked={isActive}
								onChange={(e) => setIsActive(e.target.checked)}
								disabled={submitting}
								color="primary"
							/>
						}
						label={
							<Box>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>Project Active</Typography>
								<Typography variant="caption" color="text.secondary">Inactive projects are hidden from DSR entry</Typography>
							</Box>
						}
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
				{project && isAdmin && onDelete && (
					<Button
						onClick={() => {
							onDelete(project);
							onClose();
						}}
						color="error"
						variant="outlined"
						startIcon={<DeleteIcon />}
						sx={{ mr: 'auto', textTransform: 'none', fontWeight: 700 }}
					>
						Delete Project
					</Button>
				)}
				<Button
					onClick={onClose}
					disabled={submitting}
					sx={{
						color: theme.palette.text.secondary,
						textTransform: 'none',
						fontWeight: 700,
						'&:hover': { bgcolor: '#eaeded' }
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={submitting || !owner || !name}
					sx={{
						bgcolor: theme.palette.primary.main,
						color: '#ffffff',
						textTransform: 'none',
						fontWeight: 700,
						px: 4,
						py: 1,
						borderRadius: '2px',
						boxShadow: 'none',
						'&:hover': { bgcolor: '#eb5f07', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
						'&.Mui-disabled': { bgcolor: '#f2f3f3', color: '#959ba1' }
					}}
				>
					{submitting ? <CircularProgress size={24} /> : (project ? 'Commit Changes' : 'Initialize Project')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ProjectDialog;
