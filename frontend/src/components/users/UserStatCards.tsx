import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Link, Popover, useTheme, CircularProgress } from '@mui/material';
import { People, SupervisorAccount, CheckCircle, Cancel } from '@mui/icons-material';
import api from '../../services/api';

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

	const cardStyle = {
		height: '100%',
		border: '1px solid #d5dbdb',
		boxShadow: 'none',
		borderRadius: 0,
		'&:hover': {
			borderColor: theme.palette.primary.main,
		}
	};

	return (
		<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
			{/* Total Users Card */}
			<Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
				<Card sx={cardStyle} aria-label={`Total Users: ${stats.total}`}>
					<CardContent sx={{ p: 2 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Box aria-hidden="true">
								<Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem', mb: 1 }}>
									Total Users
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
									<Typography variant="h3" component="div" sx={{ fontWeight: 300, color: theme.palette.secondary.main }}>
										{(stats.total || 0).toLocaleString()}
									</Typography>
								</Box>
							</Box>
							<People sx={{ fontSize: 40, color: theme.palette.primary.light, opacity: 0.5 }} aria-hidden="true" />
						</Box>
					</CardContent>
				</Card>
			</Box>

			{/* Users by Role Card */}
			<Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
				<Card sx={cardStyle} aria-label={`Users by Role. Total: ${stats.total}`}>
					<CardContent sx={{ p: 2 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Box sx={{ width: '100%' }}>
								<Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem', mb: 1 }} aria-hidden="true">
									Users by Role
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }} aria-hidden="true">
									<Typography variant="h3" component="div" sx={{ fontWeight: 300, color: theme.palette.secondary.main }}>
										{(stats.total || 0).toLocaleString()}
									</Typography>
								</Box>
								<Box sx={{ mt: 2 }}>
									<Link
										component="button"
										variant="body2"
										onClick={handleRoleOpen}
										aria-label="View role distribution"
										sx={{
											fontWeight: 'bold',
											color: theme.palette.primary.main,
											textDecoration: 'none',
											'&:hover': {
												textDecoration: 'underline'
											}
										}}
									>
										View Distribution
									</Link>
								</Box>
							</Box>
							<SupervisorAccount sx={{ fontSize: 40, color: theme.palette.primary.light, opacity: 0.5 }} aria-hidden="true" />
						</Box>

						<Popover
							open={Boolean(roleAnchor)}
							anchorEl={roleAnchor}
							onClose={handleRoleClose}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							PaperProps={{
								sx: {
									border: '1px solid #d5dbdb',
									boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
									borderRadius: 0,
									p: 2,
									minWidth: 220
								}
							}}
						>
							<Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: theme.palette.secondary.main }} component="h3">
								Role Distribution
							</Typography>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="body2" color="textSecondary">Admin</Typography>
								<Typography variant="body2" fontWeight="bold">{stats.by_role.admin}</Typography>
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="body2" color="textSecondary">Manager</Typography>
								<Typography variant="body2" fontWeight="bold">{stats.by_role.manager}</Typography>
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="body2" color="textSecondary">Trainer</Typography>
								<Typography variant="body2" fontWeight="bold">{stats.by_role.trainer}</Typography>
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="body2" color="textSecondary">Counselor</Typography>
								<Typography variant="body2" fontWeight="bold">{stats.by_role.counselor}</Typography>
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="body2" color="textSecondary">Placement</Typography>
								<Typography variant="body2" fontWeight="bold">{stats.by_role.placement}</Typography>
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
								<Typography variant="body2" color="textSecondary">Sourcing</Typography>
								<Typography variant="body2" fontWeight="bold">{stats.by_role.sourcing}</Typography>
							</Box>
						</Popover>
					</CardContent>
				</Card>
			</Box>

			{/* Active/Inactive Card */}
			<Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
				<Card sx={cardStyle} aria-label={`User Status. Active: ${stats.active}, Inactive: ${stats.inactive}`}>
					<CardContent sx={{ p: 2 }}>
						<Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 'bold', fontSize: '0.9rem', mb: 1 }} aria-hidden="true">
							User Status
						</Typography>
						<Box sx={{ mt: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} aria-hidden="true" />
								<Box sx={{ flexGrow: 1 }}>
									<Typography variant="body2" color="textSecondary" aria-hidden="true">Active Users</Typography>
								</Box>
								<Typography variant="h6" sx={{ fontWeight: 600 }} aria-hidden="true">
									{stats.active}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Cancel sx={{ color: 'error.main', mr: 1, fontSize: 20 }} aria-hidden="true" />
								<Box sx={{ flexGrow: 1 }}>
									<Typography variant="body2" color="textSecondary" aria-hidden="true">Inactive Users</Typography>
								</Box>
								<Typography variant="h6" sx={{ fontWeight: 600 }} aria-hidden="true">
									{stats.inactive}
								</Typography>
							</Box>
						</Box>
					</CardContent>
				</Card>
			</Box>

		</Box>
	);
};

export default UserStatCards;
