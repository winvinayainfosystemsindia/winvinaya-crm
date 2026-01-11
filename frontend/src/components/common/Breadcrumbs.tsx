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
	const queryParams = new URLSearchParams(location.search);
	const tab = queryParams.get('tab');

	// Split the path into segments, filtering out empty strings
	const pathnames = location.pathname.split('/').filter((x) => x);

	if (pathnames.length === 0) {
		return null;
	}

	const getTrainingModuleName = (tabValue: string | null) => {
		switch (tabValue) {
			case '1': return 'Allocation';
			case '2': return 'Attendance';
			case '3': return 'Assessment';
			case '4': return 'Mock Interview';
			default: return 'Allocation';
		}
	};

	return (
		<Box sx={{ mb: 2, mt: 0.5 }}>
			<MuiBreadcrumbs
				separator={<NavigateNextIcon sx={{ fontSize: 14, color: '#879196' }} />}
				aria-label="breadcrumb"
				sx={{
					'& .MuiBreadcrumbs-ol': { alignItems: 'center' }
				}}
			>
				{/* Always show Home link with icon */}
				<Link
					component={RouterLink}
					underline="hover"
					color="inherit"
					to="/dashboard"
					sx={{
						display: 'flex',
						alignItems: 'center',
						color: '#545b64',
						fontSize: '0.8125rem',
						fontWeight: 500,
						'&:hover': { color: '#007eb9' }
					}}
				>
					<HomeIcon sx={{ fontSize: 16, mr: 0.5, color: '#879196' }} />
					Home
				</Link>

				{pathnames.map((value, index) => {
					const last = index === pathnames.length - 1;
					const to = `/${pathnames.slice(0, index + 1).join('/')}`;

					// Use map or fallback to title case
					const breadcrumbInfo = breadcrumbNameMap[value];
					let name = breadcrumbInfo?.name || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
					const icon = breadcrumbInfo?.icon;

					// Specialty logic for training allocation/sub-modules
					if (value === 'allocation' && pathnames.includes('training')) {
						name = getTrainingModuleName(tab);
					}

					// Skip "dashboard" if it's in the path since we have "Home" pointing to it
					if (value === 'dashboard') {
						return null;
					}

					return last ? (
						<Typography
							key={to}
							sx={{

								display: 'flex',
								alignItems: 'center',
								fontSize: '16',
								color: '#879196'
							}}
						>
							{icon}
							{name}
						</Typography>
					) : (
						<Link
							component={RouterLink}
							underline="hover"
							to={to}
							key={to}
							sx={{
								display: 'flex',
								alignItems: 'center',
								color: '#545b64',
								fontSize: '0.8125rem',
								fontWeight: 500,
								'&:hover': { color: '#007eb9' }
							}}
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
