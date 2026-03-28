import type { CandidateMatchResult } from '../../../services/placementMappingService';
import type { JobRole } from '../../../models/jobRole';

export const AWS_COLORS = {
	headerText: '#16191f',
	secondaryText: '#545b64',
	label: '#687078',
	border: '#eaeded',
	divider: '#d1d5db',
	background: '#f2f3f3',
	containerBg: '#ffffff',
	primary: '#ec7211', // AWS Orange
	primaryHover: '#eb5f07',
	link: '#007eb9',
	success: '#1d8102',
	warning: '#ec7211',
	error: '#d13212',
	surface: '#fafafa',
};

export interface MappingComponentProps {
	selectedRole: JobRole | null;
	matches: CandidateMatchResult[];
	loading: boolean;
	onMapClick: (candidate: CandidateMatchResult) => void;
}
