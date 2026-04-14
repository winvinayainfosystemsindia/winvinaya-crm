import React, { useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Snackbar,
	Alert,
	Button
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import userService from '../../services/userService';
import UserStatCards from '../../components/users/UserStatCards';
import UserTable from '../../components/users/UserTable';
import UserDialog from '../../components/users/UserDialog';
import { ConfirmationDialog } from '../../components/common/dialogbox';
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
				<Box sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					mb: 3
				}}>
					<Box>
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

					{currentUser?.role === 'admin' && (
						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={handleAddUser}
							sx={{
								bgcolor: 'primary.main',
								textTransform: 'none',
								fontWeight: 700,
								fontSize: '0.875rem',
								px: 3,
								height: 38,
								borderRadius: '4px',
								boxShadow: 'none',
								'&:hover': {
									bgcolor: 'primary.dark',
									boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
								}
							}}
						>
							Add User
						</Button>
					)}
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
				<ConfirmationDialog
					open={deleteDialogOpen}
					onClose={handleCancelDelete}
					onConfirm={handleConfirmDelete}
					title="Delete User"
					subtitle="Irreversible Governance Action"
					message={`Are you sure you want to delete user ${userToDelete?.username}? This action is permanent and cannot be undone.`}
					confirmLabel="Delete User"
					cancelLabel="Cancel"
					severity="error"
					loading={false}
				/>

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
