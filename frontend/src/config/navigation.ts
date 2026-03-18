import {
	Home as HomeIcon,
	ManageAccounts as UserIcon,
	Business as BusinessIcon,
	Group as CandidatesIcon,
	School as SchoolIcon,
	Assessment as AssessmentIcon,
	Settings as SettingsIcon,
	HelpOutline as HelpIcon,
	Folder as ProjectIcon,
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
		label: 'Project Management',
		icon: ProjectIcon,
		roles: ['admin', 'manager', 'trainer', 'sourcing', 'project_coordinator', 'developer'],
		children: [
			{ label: 'Projects', path: '/projects' },
			{ label: 'Activities', path: '/projects/activities' },
			{ label: 'Timesheet', path: '/projects/timesheet' },
		],
	},
	{
		label: 'CRM Management',
		icon: BusinessIcon,
		roles: ['admin', 'manager', 'sourcing', 'project_coordinator', 'developer'],
		children: [
			{ label: 'Dashboard', path: '/crm/dashboard' },
			{ label: 'Companies', path: '/crm/companies' },
			{ label: 'Contacts', path: '/crm/contacts' },
			{ label: 'Leads', path: '/crm/leads' },
			{ label: 'Deals', path: '/crm/deals' },
			{ label: 'Tasks', path: '/crm/tasks' },
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
				roles: ['admin', 'sourcing', 'manager', 'project_coordinator', 'developer']
			},
			{
				label: 'Counseling',
				path: '/candidates/counseling',
				roles: ['admin', 'trainer', 'manager', 'project_coordinator', 'developer']
			},
			{
				label: 'Document Collection',
				path: '/candidates/documents',
				roles: ['admin', 'sourcing', 'manager', 'project_coordinator', 'developer']
			},
		],
	},
	{
		label: 'Training Management',
		icon: SchoolIcon,
		children: [
			{ label: 'Training Batch', path: '/training/batches', roles: ['admin', 'manager', 'trainer', 'sourcing', 'project_coordinator', 'developer'] },
			{ label: 'Weekly Training Plan', path: '/training/weekly-plan', roles: ['admin', 'manager', 'trainer', 'project_coordinator', 'developer'] },
			{ label: 'Candidate Allocation', path: '/training/allocation', roles: ['admin', 'manager', 'trainer', 'sourcing', 'project_coordinator', 'developer'] },
			{ label: 'Attendance', path: '/training/attendance', roles: ['admin', 'manager', 'trainer', 'project_coordinator', 'developer'] },
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
