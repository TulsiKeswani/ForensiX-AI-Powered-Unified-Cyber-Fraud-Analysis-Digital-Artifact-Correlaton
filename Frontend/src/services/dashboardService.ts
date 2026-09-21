import api from './api';

export interface DashboardStats {
  totalCases: number;
  analysisComplete: number;
  inProgress: number;
  pending: number;
  totalEvidenceFiles: number;
  totalEntities: number;
  highRiskEntities: number;
  totalTransactionsAnalyzed: number;
  totalCdrRecords: number;
  totalIpdrSessions: number;
  recentActivity: ActivityItem[];
  cases: CaseSummary[];
}

export interface ActivityItem {
  type: string;
  caseId: string;
  message: string;
  timestamp: string;
  icon: string;
}

export interface CaseSummary {
  caseId: string;
  complainant: string;
  type: string;
  date: string;
  status: string;
  entities: number;
  riskLevel: string;
}

const DEMO_STATS: DashboardStats = {
  totalCases: 3,
  analysisComplete: 1,
  inProgress: 1,
  pending: 1,
  totalEvidenceFiles: 6,
  totalEntities: 138,
  highRiskEntities: 8,
  totalTransactionsAnalyzed: 312,
  totalCdrRecords: 50,
  totalIpdrSessions: 30,
  recentActivity: [
    { type: 'ANALYSIS_COMPLETE', caseId: 'CF-2026-001', message: 'Case CF-2026-001 analysis complete. 14 entities, 1 kingpin predicted.', timestamp: '2026-08-15T10:32:00+05:30', icon: 'check' },
    { type: 'HIGH_RISK_ALERT', caseId: 'CF-2026-001', message: 'High-risk: ACC003 (PNB) — ₹2.5L+ cash-out. Risk score: 96/100.', timestamp: '2026-08-15T10:30:00+05:30', icon: 'alert' },
    { type: 'EVIDENCE_UPLOADED', caseId: 'CF-2026-007', message: 'New evidence: call_spoofing_cdr.csv uploaded for CF-2026-007.', timestamp: '2026-08-14T14:15:00+05:30', icon: 'upload' },
    { type: 'CASE_CREATED', caseId: 'CF-2026-003', message: 'CF-2026-003 created by Inspector Priya Mehta — APK fraud.', timestamp: '2026-08-13T09:00:00+05:30', icon: 'new' },
    { type: 'ENTITY_FLAGGED', caseId: 'CF-2026-001', message: 'APK com.fake.taxrefund flagged as Banking Trojan. Risk: 97/100.', timestamp: '2026-08-12T18:00:00+05:30', icon: 'flag' }
  ],
  cases: [
    { caseId: 'CF-2026-001', complainant: 'Rohit Sharma', type: 'UPI Fraud + APK Malware', date: '12 Aug 2026', status: 'Analysis Complete', entities: 14, riskLevel: 'Critical' },
    { caseId: 'CF-2026-007', complainant: 'Neha Verma', type: 'Call Spoofing + SIM Swap', date: '10 Aug 2026', status: 'In Analysis', entities: 8, riskLevel: 'High' },
    { caseId: 'CF-2026-003', complainant: 'Amit Singh', type: 'APK Fraud + Data Theft', date: '08 Aug 2026', status: 'Pending Evidence', entities: 0, riskLevel: 'Unknown' }
  ]
};

export const dashboardService = {
  async getStats(): Promise<{ success: boolean } & DashboardStats> {
    try {
      return await api.get('/dashboard');
    } catch {
      return { success: true, ...DEMO_STATS };
    }
  }
};

export default dashboardService;
