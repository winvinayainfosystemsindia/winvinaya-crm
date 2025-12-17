import React, { useState } from 'react';
import { Box, Container, Typography, Dialog } from '@mui/material';
import UserStatCards from '../components/users/UserStatCards';
import UserTable from '../components/users/UserTable';
import UserCreateForm from '../components/users/forms/UserCreateForm';
import UserEditForm from '../components/users/forms/UserEditForm';
import UserView from '../components/users/forms/UserView';
import type { User } from '../models/user';

const UserManagement: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

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

	const handleSuccess = () => {
		handleCloseDialog();
		setRefreshKey(prev => prev + 1); // Trigger refresh
	};

	return (
		<Box sx={{ bgcolor: 'background.default' }}>
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
				<UserStatCards key={`stats-${refreshKey}`} />

				{/* User Table */}
				<UserTable
					key={`table-${refreshKey}`}
					onAddUser={handleAddUser}
					onEditUser={handleEditUser}
					onViewUser={handleViewUser}
				/>

				{/* User Form Dialog */}
				<Dialog
					open={openDialog}
					onClose={handleCloseDialog}
					maxWidth="sm"
					fullWidth
					PaperProps={{
						sx: {
							borderRadius: 0,
							border: '1px solid #d5dbdb'
						}
					}}
				>
					{dialogMode === 'add' && (
						<UserCreateForm
							onSuccess={handleSuccess}
							onCancel={handleCloseDialog}
						/>
					)}
					{dialogMode === 'edit' && selectedUser && (
						<UserEditForm
							user={selectedUser}
							onSuccess={handleSuccess}
							onCancel={handleCloseDialog}
						/>
					)}
					{dialogMode === 'view' && selectedUser && (
						<UserView user={selectedUser} />
					)}
				</Dialog>
			</Container>
		</Box>
	);
};

export default UserManagement;
