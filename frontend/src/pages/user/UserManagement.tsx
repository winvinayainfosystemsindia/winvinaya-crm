import React, { useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Snackbar,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton
} from '@mui/material';
import { Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import userService from '../../services/userService';
import UserStatCards from '../../components/users/UserStatCards';
import UserTable from '../../components/users/UserTable';
import UserDialog from '../../components/users/UserDialog';
import type { User } from '../../models/user';

const UserManagement: React.FC = () => {
	const { user: currentUser } = useAppSelector((state) => state.auth);
	const [openDialog, setOpenDialog] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success'
	});

	const handleAddUser = () => {
		setDialogMode('add');
		setSelectedUser(null);
		setOpenDialog(true);
	};

	const handleEditUser = (user: User) => {
		setDialogMode('edit');
		setSelectedUser(user);
		setOpenDialog(true);
	};

	const handleViewUser = (user: User) => {
		setDialogMode('view');
		setSelectedUser(user);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedUser(null);
	};

	const handleDeleteClick = (user: User) => {
		if (currentUser?.role !== 'admin') {
			setSnackbar({
				open: true,
				message: 'Only administrators can delete users',
				severity: 'error'
			});
			return;
		}
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!userToDelete) return;

		try {
			await userService.delete(userToDelete.id.toString());
			setSnackbar({
				open: true,
				message: 'User deleted successfully',
				severity: 'success'
			});
			setRefreshKey(prev => prev + 1);
		} catch (error) {
			console.error('Failed to delete user:', error);
			setSnackbar({
				open: true,
				message: 'Failed to delete user',
				severity: 'error'
			});
		} finally {
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		}
	};

	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
		setUserToDelete(null);
	};

	const handleCloseSnackbar = () => {
		setSnackbar(prev => ({ ...prev, open: false }));
	};

	return (
		<Box component="main" sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: 3 }}>
				{/* Page Header */}
				<Box sx={{ mb: 3 }}>
					<Typography
						variant="h4"
						component="h1"
						sx={{
							fontWeight: 300,
							color: 'text.primary',
							mb: 0.5
						}}
					>
						User Management
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage system users, roles, and permissions
					</Typography>
				</Box>

				{/* Stat Cards */}
				<Box component="section" aria-label="User Statistics Overview" sx={{ mb: 3 }}>
					<UserStatCards key={`stats-${refreshKey}`} />
				</Box>

				{/* User Table */}
				<Box component="section" aria-label="User Directory">
					<UserTable
						key={`table-${refreshKey}`}
						onAddUser={handleAddUser}
						onEditUser={handleEditUser}
						onViewUser={handleViewUser}
						onDeleteUser={handleDeleteClick}
					/>
				</Box>

				{/* Unified User Dialog */}
				<UserDialog
					open={openDialog}
					mode={dialogMode}
					user={selectedUser}
					onClose={handleCloseDialog}
					onSuccess={(message) => {
						setRefreshKey(prev => prev + 1);
						setSnackbar({
							open: true,
							message,
							severity: 'success'
						});
						handleCloseDialog();
					}}
				/>

				{/* Delete Confirmation Dialog */}
				<Dialog
					open={deleteDialogOpen}
					onClose={handleCancelDelete}
					maxWidth="sm"
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: 0,
							border: '1px solid #d5dbdb',
							boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
						}
					}}
				>
					<DialogTitle sx={{ bgcolor: '#ffffff', color: '#232f3e', py: 2, borderBottom: '1px solid #d5dbdb' }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
								<WarningIcon sx={{ color: '#d91d11' }} />
								<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
									Delete User
								</Typography>
							</Box>
							<IconButton onClick={handleCancelDelete} size="small">
								<CloseIcon />
							</IconButton>
						</Box>
					</DialogTitle>
					<DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
						<Typography variant="body1" sx={{ color: '#232f3e', mb: 1 }}>
							Are you sure you want to delete user <strong>{userToDelete?.username}</strong>?
						</Typography>
						<Typography variant="body2" sx={{ color: '#545b64' }}>
							This action is permanent and cannot be undone. The user will no longer be able to access the system.
						</Typography>
					</DialogContent>
					<DialogActions sx={{ p: 2, bgcolor: '#f2f3f3', borderTop: '1px solid #d5dbdb' }}>
						<Button
							onClick={handleCancelDelete}
							sx={{
								textTransform: 'none',
								fontWeight: 700,
								color: '#545b64',
								borderColor: '#d5dbdb',
								'&:hover': { bgcolor: '#ffffff' }
							}}
							variant="outlined"
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmDelete}
							sx={{
								textTransform: 'none',
								fontWeight: 700,
								bgcolor: '#d91d11',
								color: 'white',
								'&:hover': { bgcolor: '#c3190e' }
							}}
							variant="contained"
							autoFocus
						>
							Delete
						</Button>
					</DialogActions>
				</Dialog>

				{/* Global Snackbar */}
				<Snackbar
					open={snackbar.open}
					autoHideDuration={6000}
					onClose={handleCloseSnackbar}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				>
					<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</Container>
		</Box>
	);
};

export default UserManagement;
