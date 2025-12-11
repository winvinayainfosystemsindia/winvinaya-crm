import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
	NavigateNext as NavigateNextIcon,
	Home as HomeIcon,
	People as PeopleIcon,
	PersonAdd as PersonAddIcon,
	Dashboard as DashboardIcon,
	Settings as SettingsIcon
} from '@mui/icons-material';

// Map of route paths to display names and icons
const breadcrumbNameMap: { [key: string]: { name: string; icon?: React.ReactNode } } = {
	'dashboard': { name: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
	'users': { name: 'User Management', icon: <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
	'candidates': { name: 'Candidates', icon: <PersonAddIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
	'candidate-registration': { name: 'Candidate Registration', icon: <PersonAddIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
	'profile': { name: 'Profile' },
	'settings': { name: 'Settings', icon: <SettingsIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
};

const Breadcrumbs: React.FC = () => {
	const location = useLocation();

	// Split the path into segments, filtering out empty strings
	const pathnames = location.pathname.split('/').filter((x) => x);

	// If we are on the dashboard (home) or root, and there are no other segments, 
	// we might not want to show breadcrumbs or just show nothing.
	// Adjust logic based on preference. 
	if (pathnames.length === 0) {
		return null;
	}

	return (
		<Box sx={{ mb: 2 }}>
			<MuiBreadcrumbs
				separator={<NavigateNextIcon fontSize="small" />}
				aria-label="breadcrumb"
			>
				{/* Always show Home link with icon */}
				<Link
					component={RouterLink}
					underline="hover"
					color="inherit"
					to="/dashboard"
					sx={{ display: 'flex', alignItems: 'center' }}
				>
					<HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
					Home
				</Link>

				{pathnames.map((value, index) => {
					const last = index === pathnames.length - 1;
					const to = `/${pathnames.slice(0, index + 1).join('/')}`;

					// Use map or fallback to title case
					const breadcrumbInfo = breadcrumbNameMap[value];
					const name = breadcrumbInfo?.name || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
					const icon = breadcrumbInfo?.icon;

					// Skip "dashboard" if it's in the path since we have "Home" pointing to it
					if (value === 'dashboard') {
						return null;
					}

					return last ? (
						<Typography color="text.primary" key={to} sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
							{icon}
							{name}
						</Typography>
					) : (
						<Link
							component={RouterLink}
							underline="hover"
							color="inherit"
							to={to}
							key={to}
							sx={{ display: 'flex', alignItems: 'center' }}
						>
							{icon}
							{name}
						</Link>
					);
				})}
			</MuiBreadcrumbs>
		</Box>
	);
};

export default Breadcrumbs;
