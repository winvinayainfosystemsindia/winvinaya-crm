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

	const [name, setName] = useState('');
	const [owner, setOwner] = useState<User | null>(null);
	const [isActive, setIsActive] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			dispatch(fetchUsers({ skip: 0, limit: 500 }));
			if (project) {
				setName(project.name);
				setIsActive(project.is_active);
			} else {
				setName('');
				setOwner(null);
				setIsActive(true);
			}
		}
	}, [open, project, dispatch]);

	useEffect(() => {
		if (open && project && project.owner && users.length > 0) {
			const currentOwner = users.find(u => u.public_id === project.owner?.public_id);
			if (currentOwner) setOwner(currentOwner);
		}
	}, [open, project, users]);

	const handleSubmit = async () => {
		if (!owner) return;
		setSubmitting(true);
		try {
			if (project) {
				await dispatch(updateProject({
					publicId: project.public_id,
					data: {
						name,
						owner_user_public_id: owner.public_id as any, // backend expects UUID
						is_active: isActive
					}
				})).unwrap();
				onSuccess('Project updated successfully');
			} else {
				await dispatch(createProject({
					name,
					owner_user_public_id: owner.public_id as any,
					is_active: isActive
				})).unwrap();
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
					<TextField
						label="Project Name"
						fullWidth
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={submitting}
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
								label="Project Owner"
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
						label="Project Active"
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
				{project && isAdmin && onDelete && (
					<Button
						onClick={() => {
							if (window.confirm('Are you sure you want to permanently delete this project?')) {
								onDelete(project);
								onClose();
							}
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
