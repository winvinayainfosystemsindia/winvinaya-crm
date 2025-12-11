import React from 'react';
import { Box, Typography, Divider, Chip } from '@mui/material';
import { format } from 'date-fns';
import type { User } from '../../../models/user';

interface UserViewProps {
	user: User;
}

const UserView: React.FC<UserViewProps> = ({ user }) => {
	const formatDate = (dateString?: string) => {
		if (!dateString) return '-';
		try {
			return format(new Date(dateString), 'PPP');
		} catch {
			return '-';
		}
	};

	const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
		<Box sx={{ mb: 2 }}>
			<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
				{label}
			</Typography>
			<Typography variant="body1">{value}</Typography>
		</Box>
	);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
				User Details
			</Typography>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				<InfoRow label="Full Name" value={user.full_name || '-'} />

				<Divider sx={{ my: 1 }} />

				<InfoRow label="Username" value={user.username} />

				<InfoRow label="Email" value={user.email} />

				<Divider sx={{ my: 1 }} />

				<InfoRow
					label="Role"
					value={
						<Chip
							label={user.role.toUpperCase()}
							color={
								user.role === 'admin' ? 'error' :
									user.role === 'manager' ? 'warning' :
										user.role === 'trainer' ? 'info' : 'success'
							}
							size="small"
							sx={{ fontWeight: 600 }}
						/>
					}
				/>

				<InfoRow
					label="Status"
					value={
						<Chip
							label={user.is_active ? 'Active' : 'Inactive'}
							color={user.is_active ? 'success' : 'default'}
							size="small"
							variant={user.is_active ? 'filled' : 'outlined'}
							sx={{ fontWeight: 600 }}
						/>
					}
				/>

				<Divider sx={{ my: 1 }} />

				<InfoRow label="Email Verified" value={user.is_verified ? 'Yes' : 'No'} />

				<InfoRow label="Created Date" value={formatDate(user.created_at)} />

				<InfoRow label="Last Updated" value={formatDate(user.updated_at)} />
			</Box>
		</Box>
	);
};

export default UserView;
