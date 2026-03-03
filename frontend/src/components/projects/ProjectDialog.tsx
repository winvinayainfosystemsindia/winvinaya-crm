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
	Divider,
	FormControlLabel,
	Switch
} from '@mui/material';
import type { DSRProject } from '../../models/dsr';
import type { User } from '../../models/user';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProject, updateProject } from '../../store/slices/dsrSlice';
import { fetchUsers } from '../../store/slices/userSlice';

interface ProjectDialogProps {
	open: boolean;
	project: DSRProject | null;
	onClose: () => void;
	onSuccess: (message: string) => void;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
	open,
	project,
	onClose,
	onSuccess
}) => {
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
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>{project ? 'Edit Project' : 'New Project'}</DialogTitle>
			<Divider />
			<DialogContent>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
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
							/>
						}
						label="Project Active"
					/>
				</Box>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} disabled={submitting}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={submitting || !owner || !name}
					sx={{ bgcolor: '#ec7211', '&:hover': { bgcolor: '#eb5f07' } }}
				>
					{submitting ? <CircularProgress size={24} /> : (project ? 'Save Changes' : 'Create Project')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ProjectDialog;
