import api from './api';
import type { JobRole } from '../models/jobRole';
import type { Candidate } from '../models/candidate';

export interface MatchMatchInfo {
    is_match: boolean;
    details: string;
}

export interface CandidateMatchResult {
    public_id: string;
    candidate_id: number;
    name: string;
    match_score: number;
    disability?: string;
    qualification?: string;
    skills: string[];
    skill_match: MatchMatchInfo;
    qualification_match: MatchMatchInfo;
    disability_match: MatchMatchInfo;
    other_mappings_count: number;
    other_mappings: string[];
    is_already_mapped: boolean;
}

export interface PlacementMapping {
    id: number;
    candidate_id: number;
    job_role_id: number;
    match_score: number;
    notes?: string;
    mapped_by_id?: number;
    mapped_at: string;
    
    candidate?: Candidate;
    job_role?: JobRole;
    mapped_by?: any;
}

export interface PlacementMappingCreate {
    candidate_id: number;
    job_role_id: number;
    match_score?: number;
    notes?: string;
}

const placementMappingService = {
    getMatchesForJobRole: async (jobRolePublicId: string): Promise<CandidateMatchResult[]> => {
        const response = await api.get(`/placement/mappings/match/${jobRolePublicId}`);
        return response.data;
    },

    mapCandidate: async (mapping: PlacementMappingCreate): Promise<PlacementMapping> => {
        const response = await api.post('/placement/mappings/', mapping);
        return response.data;
    },

    getJobRoleMappings: async (jobRolePublicId: string): Promise<PlacementMapping[]> => {
        const response = await api.get(`/placement/mappings/job-role/${jobRolePublicId}`);
        return response.data;
    },

    getCandidateMappings: async (candidateId: number): Promise<PlacementMapping[]> => {
        const response = await api.get(`/placement/mappings/candidate/${candidateId}`);
        return response.data;
    },

    unmapCandidate: async (candidateId: number, jobRoleId: number): Promise<void> => {
        await api.delete('/placement/mappings/unmap', {
            params: { candidate_id: candidateId, job_role_id: jobRoleId }
        });
    }
};

export default placementMappingService;
