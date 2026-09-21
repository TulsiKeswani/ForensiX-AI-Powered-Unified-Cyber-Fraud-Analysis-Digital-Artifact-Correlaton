import api from './api';

export interface CaseData {
  id?: string;
  caseId: string;
  complainantName?: string;
  complaintType?: string;
  dateOfIncident?: string;
  complaintDetails?: string;
  status?: string;
  createdAt?: string;
}

export const caseService = {
  async createCase(data: CaseData) {
    return api.post('/cases', data);
  },

  async getCases() {
    return api.get('/cases');
  },

  async getCaseById(caseId: string) {
    return api.get(`/cases/${caseId}`);
  }
};

export default caseService;
