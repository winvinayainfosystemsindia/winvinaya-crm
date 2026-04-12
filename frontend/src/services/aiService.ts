import api from './api';
import type {
  AISettingsData,
  AIConnectionTestResult,
  AITasksResponse,
} from '../models/ai';

const BASE = '/ai';

/**
 * AI Engine — API Service
 * =======================
 * Uses the standard Redux-integrated axios instance with auth interceptors.
 */
export const aiService = {
  /** Get current AI engine settings */
  async getSettings(): Promise<AISettingsData> {
    const res = await api.get(`${BASE}/settings`);
    return res.data;
  },

  /** Batch save AI settings */
  async saveSettings(data: Record<string, string>): Promise<{ message: string; saved_keys: string[] }> {
    const res = await api.put(`${BASE}/settings`, data);
    return res.data;
  },

  /** Test a provider connection */
  async testConnection(provider: string, apiKey?: string): Promise<AIConnectionTestResult> {
    const res = await api.post(`${BASE}/settings/test-connection`, {
      provider,
      api_key: apiKey || undefined,
    });
    return res.data;
  },

  /** Get paginated task runs */
  async getTasks(page = 1, pageSize = 20, status?: string): Promise<AITasksResponse> {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (status) params.status_filter = status;
    const res = await api.get(`${BASE}/tasks`, { params });
    return res.data;
  },

  /** Get health status */
  async getHealth(): Promise<Record<string, unknown>> {
    const res = await api.get(`${BASE}/health`);
    return res.data;
  },

  /** Extract Job Role details from JD text or PDF file */
  async extractJobRole(jdText?: string, file?: File): Promise<{
    data: any;
    suggestions: {
      company_id: number | null;
      company_name: string | null;
      contact_id: number | null;
      contact_name: string | null;
    };
  }> {
    const formData = new FormData();
    if (jdText) formData.append('jd_text', jdText);
    if (file) formData.append('file', file);

    const res = await api.post(`${BASE}/extract/job-role`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

export default aiService;
