import React from 'react';
import { Box, Typography, Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface UserManagementHeaderProps {
	currentUserRole?: string;
	onAddUser: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ currentUserRole, onAddUser }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box sx={{ mb: 4 }}>
			<Stack 
				direction={isMobile ? "column" : "row"} 
				justifyContent="space-between" 
				alignItems={isMobile ? "flex-start" : "center"} 
				spacing={2}
			>
				<Box>
					<Typography
						variant={isMobile ? "h5" : "h4"}
						component="h1"
						sx={{
							fontWeight: 500,
							color: 'text.primary',
							mb: 0.5,
							letterSpacing: '-0.02em'
						}}
					>
						User Management
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage system users, roles, and permissions
					</Typography>
				</Box>

				{currentUserRole === 'admin' && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={onAddUser}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							px: 3,
							py: 1,
							borderRadius: 1,
							boxShadow: 'none',
							'&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
						}}
					>
						Add User
					</Button>
				)}
			</Stack>
		</Box>
	);
};

export default UserManagementHeader;
