import {
	Home as HomeIcon,
	ManageAccounts as UserIcon,
	// Dashboard as DashboardIcon,
	// FilterCenterFocus as LeadIcon,
	// Handshake as DealIcon,
	// Business as BusinessIcon,
	// Person as PersonIcon,
	// Assignment as TaskIcon,
	Group as CandidatesIcon,
	School as SchoolIcon,
	Assessment as AssessmentIcon,
	Settings as SettingsIcon,
	HelpOutline as HelpIcon,
	Folder as ProjectIcon,
	EventNote as DSRIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavigationItem {
	label?: string;
	path?: string;
	icon?: SvgIconComponent;
	roles?: string[];
	children?: NavigationItem[];
	divider?: boolean;
}

export const topNavigation: NavigationItem[] = [
	{
		label: 'Home',
		path: '/dashboard',
		icon: HomeIcon,
	},
	{
		label: 'User Management',
		path: '/users',
		icon: UserIcon,
		roles: ['admin'],
	},
	// },
	{
		label: 'DSR',
		icon: DSRIcon,
		children: [
			{ label: 'Submit DSR', path: '/dsr/submission' },
			{ label: 'DSR History', path: '/dsr' },
			{ label: 'DSR Admin', path: '/dsr/admin', roles: ['admin'] },
		],
	},
	{
		label: 'Project Management',
		icon: ProjectIcon,
		roles: ['admin', 'manager'],
		children: [
			{ label: 'Projects', path: '/projects' },
			{ label: 'Activity Planning', path: '/projects' },
		],
	},
	{
		label: 'Candidate Management',
		icon: CandidatesIcon,
		children: [
			{ label: 'All Candidates', path: '/candidates' },
			{
				label: 'Screening',
				path: '/candidates/screening',
				roles: ['admin', 'sourcing', 'manager']
			},
			{
				label: 'Counseling',
				path: '/candidates/counseling',
				roles: ['admin', 'trainer', 'manager']
			},
			{
				label: 'Document Collection',
				path: '/candidates/documents',
				roles: ['admin', 'sourcing', 'manager']
			},
		],
	},
	{
		label: 'Training Management',
		icon: SchoolIcon,
		children: [
			{ label: 'Training Batch', path: '/training/batches', roles: ['admin', 'manager', 'trainer', 'sourcing'] },
			{ label: 'Weekly Training Plan', path: '/training/weekly-plan', roles: ['admin', 'manager', 'trainer'] },
			{ label: 'Candidate Allocation', path: '/training/allocation', roles: ['admin', 'manager', 'trainer', 'sourcing'] },
			{ label: 'Attendance', path: '/training/attendance', roles: ['admin', 'manager', 'trainer'] },
			// { label: 'Assignment', path: '/training/assignment', roles: ['admin', 'manager', 'trainer'] },
			// { label: 'Online Assessment', path: '/training/assessment', roles: ['admin', 'manager', 'trainer'] },
			// { label: 'Mock Interview', path: '/training/mock-interview', roles: ['admin', 'manager', 'trainer'] },

		],
	},
];

export const bottomNavigation: NavigationItem[] = [
	{
		label: 'Reports',
		path: '/reports',
		icon: AssessmentIcon,
	},
	{
		label: 'Settings',
		path: '/settings',
		icon: SettingsIcon,
		roles: ['admin'],
	},
	{
		label: 'Help and Support',
		path: '/support',
		icon: HelpIcon,
	},
];
