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
	Work as PlacementIcon,
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
	{
		label: 'Project Management',
		icon: ProjectIcon,
		roles: ['admin', 'manager', 'trainer', 'sourcing', 'project_coordinator', 'developer', 'placement'],
		children: [
			{ label: 'Projects', path: '/projects' },
			{ label: 'Activities', path: '/projects/activities' },
			{ label: 'Timesheet', path: '/projects/timesheet' },
		],
	},
	{
		label: 'CRM Management',
		icon: BusinessIcon,
		roles: ['admin', 'manager', 'sourcing', 'project_coordinator', 'developer', 'placement'],
		children: [
			// { label: 'Dashboard', path: '/crm/dashboard' },
			{ label: 'Companies', path: '/crm/companies' },
			{ label: 'Contacts', path: '/crm/contacts' },
			// { label: 'Leads', path: '/crm/leads' },
			// { label: 'Deals', path: '/crm/deals' },
			// { label: 'Tasks', path: '/crm/tasks' },
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
			// { label: 'Mock Interview', path: '/training/mock-interview', roles: ['admin', 'manager', 'trainer'] },

		],
	},
	{
		label: 'Placement Management',
		icon: PlacementIcon,
		roles: ['admin', 'manager', 'placement', 'sourcing', 'project_coordinator'],
		children: [
			{ label: 'Job Roles', path: '/placement/job-roles' },
			{ label: 'Candidate Mapping', path: '/placement/candidate-mapping' },
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
