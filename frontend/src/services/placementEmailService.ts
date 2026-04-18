import api from './api';

export interface CandidateEmailRequest {
    mapping_ids?: number[];
    custom_email?: string;
    custom_subject?: string;
    custom_message?: string;
}

const placementEmailService = {
    sendCandidateProfile: async (mappingId: number, data: CandidateEmailRequest) => {
        const response = await api.post(`/placement/email/send-candidate/${mappingId}`, data);
        return response.data;
    },
    sendBulkProfiles: async (data: CandidateEmailRequest) => {
        const response = await api.post(`/placement/email/send-bulk`, data);
        return response.data;
    }
};

export default placementEmailService;
