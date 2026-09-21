import api from './api';

export interface EvidenceItem {
  id: string;
  caseId: string;
  fileName: string;
  type: string;
  size: number;
  sha256: string;
  status: string;
  uploadedAt: string;
}

export const evidenceService = {
  async uploadEvidence(caseId: string, file: File, evidenceType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('evidenceType', evidenceType);

    // Using raw axios for FormData upload
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${baseURL}/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async getEvidenceForCase(caseId: string) {
    return api.get(`/cases/${caseId}/evidence`);
  },

  async startAnalysis(caseId: string) {
    return api.post(`/cases/${caseId}/analyze`, { caseId });
  },

  async getProcessingStatus(caseId: string) {
    return api.get(`/cases/${caseId}/processing-status`);
  },

  async getProcessingSummary(caseId: string) {
    return api.get(`/cases/${caseId}/processing-summary`);
  },

  async getEntitySummary(caseId: string) {
    return api.get(`/cases/${caseId}/entities/summary`);
  }
};

export default evidenceService;
