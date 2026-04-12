import React, { useEffect, useState } from 'react';
import { Box, Typography, Link, Popover, useTheme, CircularProgress, Stack } from '@mui/material';
import { People, SupervisorAccount, CheckCircle } from '@mui/icons-material';
import api from '../../services/api';
import StatCard from '../common/StatCard';

interface UserStats {
	total: number;
	by_role: {
		admin: number;
		trainer: number;
		counselor: number;
		manager: number;
		placement: number;
		sourcing: number;
	};
	active: number;
	inactive: number;
}

const UserStatCards: React.FC = () => {
	const theme = useTheme();
	const [stats, setStats] = useState<UserStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [roleAnchor, setRoleAnchor] = React.useState<HTMLElement | null>(null);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const response = await api.get<UserStats>('/users/stats');
			setStats(response.data);
		} catch (error) {
			console.error('Failed to fetch user stats:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleRoleOpen = (event: React.MouseEvent<HTMLElement>) => {
		setRoleAnchor(event.currentTarget);
	};

	const handleRoleClose = () => {
		setRoleAnchor(null);
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!stats) return null;

	return (
		<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
			{/* Total Users Card */}
			<Box sx={{ flex: '1 1 300px' }}>
				<StatCard
					title="Total Users"
					count={stats.total}
					icon={People}
					color={theme.palette.primary.main}
					subtitle="Registered in the system"
				/>
			</Box>

			{/* Users by Role Card */}
			<Box sx={{ flex: '1 1 300px' }}>
				<StatCard
					title="Users by Role"
					count={stats.total}
					icon={SupervisorAccount}
					color={theme.palette.secondary.main}
				>
					<Link
						component="button"
						variant="body2"
						onClick={handleRoleOpen}
						sx={{
							fontWeight: 700,
							color: theme.palette.primary.main,
							textDecoration: 'none',
							mt: 0.5,
							'&:hover': { textDecoration: 'underline' }
						}}
					>
						View Distribution
					</Link>
					<Popover
						open={Boolean(roleAnchor)}
						anchorEl={roleAnchor}
						onClose={handleRoleClose}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
						transformOrigin={{ vertical: 'top', horizontal: 'left' }}
						PaperProps={{
							sx: {
								border: '1px solid #e5e7eb',
								boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
								borderRadius: '8px',
								p: 2,
								minWidth: 220
							}
						}}
					>
						<Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#1e293b' }}>
							Role Distribution
						</Typography>
						<Stack spacing={1}>
							{[
								{ label: 'Admin', value: stats.by_role.admin },
								{ label: 'Manager', value: stats.by_role.manager },
								{ label: 'Trainer', value: stats.by_role.trainer },
								{ label: 'Counselor', value: stats.by_role.counselor },
								{ label: 'Placement', value: stats.by_role.placement },
								{ label: 'Sourcing', value: stats.by_role.sourcing },
							].map((item) => (
								<Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="body2" color="textSecondary">{item.label}</Typography>
									<Typography variant="body2" fontWeight="700">{item.value}</Typography>
								</Box>
							))}
						</Stack>
					</Popover>
				</StatCard>
			</Box>

			{/* User Status Card */}
			<Box sx={{ flex: '1 1 300px' }}>
				<StatCard
					title="User Status"
					icon={CheckCircle}
					color={theme.palette.success.main}
				>
					<Box sx={{ mt: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
							<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
							<Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>Active</Typography>
							<Typography variant="body2" fontWeight="700">{stats.active}</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', mr: 1 }} />
							<Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>Inactive</Typography>
							<Typography variant="body2" fontWeight="700">{stats.inactive}</Typography>
						</Box>
					</Box>
				</StatCard>
			</Box>
		</Box>
	);
};

export default UserStatCards;
