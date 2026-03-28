import { type CandidateMatchResult } from '../../../../services/placementMappingService';
import { type JobRole } from '../../../../models/jobRole';

export interface MappingComponentProps {
	selectedRole: JobRole | null;
	matches: CandidateMatchResult[];
	loading: boolean;
	onMapClick: (candidate: CandidateMatchResult) => void;
}
