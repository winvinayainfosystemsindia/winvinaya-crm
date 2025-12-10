import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

// Map of route paths to display names
// You can expand this map as you add more routes
const breadcrumbNameMap: { [key: string]: string } = {
	'dashboard': 'Dashboard',
	'candidates': 'Candidates',
	'candidate-registration': 'Candidate Registration',
	'login': 'Login',
	'profile': 'Profile',
	'settings': 'Settings',
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
				{/* Always show Home link */}
				<Link
					component={RouterLink}
					underline="hover"
					color="inherit"
					to="/dashboard"
				>
					Home
				</Link>

				{pathnames.map((value, index) => {
					const last = index === pathnames.length - 1;
					const to = `/${pathnames.slice(0, index + 1).join('/')}`;

					// Use map or fallback to title case
					const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

					// Skip "dashboard" if it's in the path since we have "Home" pointing to it, 
					// unless you want "Home > Dashboard"
					if (value === 'dashboard') {
						return null;
					}

					return last ? (
						<Typography color="text.primary" key={to} sx={{ fontWeight: 500 }}>
							{name}
						</Typography>
					) : (
						<Link
							component={RouterLink}
							underline="hover"
							color="inherit"
							to={to}
							key={to}
						>
							{name}
						</Link>
					);
				})}
			</MuiBreadcrumbs>
		</Box>
	);
};

export default Breadcrumbs;
