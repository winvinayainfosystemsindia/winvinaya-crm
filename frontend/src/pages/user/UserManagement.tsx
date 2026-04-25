import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteUser } from '../../store/slices/userSlice';
import useToast from '../../hooks/useToast';
import type { User } from '../../models/user';

// Restructured User Components
import {
	UserManagementHeader,
	UserManagementStats,
	UserManagementTable,
	UserManagementModals
} from '../../components/users';

/**
 * User Management Module
 * Comprehensive dashboard for managing system users, roles, and statistics.
 * Components have been organized into subdirectories for enterprise-scale maintainability.
 */
const UserManagement: React.FC = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { user: currentUser } = useAppSelector((state) => state.auth);

	// --- State Management ---
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	
	const [refreshKey, setRefreshKey] = useState(0);

	// --- Handlers: Dialogs & Actions ---
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
			toast.error('Only administrators can delete users');
			return;
		}
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!userToDelete) return;

		try {
			await dispatch(deleteUser(userToDelete.id.toString())).unwrap();
			toast.success('User deleted successfully');
			refreshData();
		} catch (error: any) {
			console.error('Failed to delete user:', error);
			toast.error(error || 'Failed to delete user');
		} finally {
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		}
	};

	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
		setUserToDelete(null);
	};

	// --- Utilities ---
	const refreshData = () => setRefreshKey(prev => prev + 1);

	return (
		<Box component="main" sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
			<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
				
				<UserManagementHeader 
					currentUserRole={currentUser?.role} 
					onAddUser={handleAddUser} 
				/>

				<UserManagementStats refreshKey={refreshKey} />

				<UserManagementTable 
					refreshKey={refreshKey}
					onAddUser={handleAddUser}
					onEditUser={handleEditUser}
					onViewUser={handleViewUser}
					onDeleteUser={handleDeleteClick}
				/>

				<UserManagementModals 
					openDialog={openDialog}
					dialogMode={dialogMode}
					selectedUser={selectedUser}
					onCloseDialog={handleCloseDialog}
					onSuccessDialog={(message) => {
						refreshData();
						toast.success(message);
						handleCloseDialog();
					}}
					deleteDialogOpen={deleteDialogOpen}
					onCancelDelete={handleCancelDelete}
					onConfirmDelete={handleConfirmDelete}
					userToDelete={userToDelete}
				/>

			</Container>
		</Box>
	);
};

export default UserManagement;
