import React, { createContext, useContext, useState, useEffect } from 'react';
import { caseService, CaseData } from '../services/caseService';
import { evidenceService, EvidenceItem } from '../services/evidenceService';

interface CaseContextType {
  currentCase: CaseData | null;
  uploadedEvidence: EvidenceItem[];
  setCurrentCase: (c: CaseData) => void;
  loadCase: (caseId: string) => Promise<void>;
  refreshEvidence: (caseId?: string) => Promise<void>;
  addUploadedFile: (item: EvidenceItem) => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCase, setCurrentCaseState] = useState<CaseData | null>({
    caseId: 'CF-2026-001',
    complainantName: 'Rohit Sharma',
    complaintType: 'Financial Fraud',
    dateOfIncident: '2026-08-12',
    complaintDetails: 'Victim reported a UPI fraud involving multiple transfers.'
  });

  const [uploadedEvidence, setUploadedEvidence] = useState<EvidenceItem[]>([
    { id: 'EV-1', caseId: 'CF-2026-001', fileName: 'cdr_sample.csv', type: 'cdr', size: 4821, sha256: 'a9f91c7d4e2b3f1c...', status: 'parsed', uploadedAt: '2026-08-15T10:00:00Z' },
    { id: 'EV-2', caseId: 'CF-2026-001', fileName: 'ipdr_sample.csv', type: 'ipdr', size: 3604, sha256: 'b7e82d3f1c4a5e2b...', status: 'parsed', uploadedAt: '2026-08-15T10:00:30Z' },
    { id: 'EV-3', caseId: 'CF-2026-001', fileName: 'bank_transactions.csv', type: 'bank', size: 5912, sha256: 'c5d7f4e3b2a1f6c9...', status: 'parsed', uploadedAt: '2026-08-15T10:01:00Z' },
    { id: 'EV-4', caseId: 'CF-2026-001', fileName: 'phishing_email.eml', type: 'email', size: 1337, sha256: 'd3c4b5a6f7e8d1c2...', status: 'parsed', uploadedAt: '2026-08-15T10:01:30Z' },
    { id: 'EV-5', caseId: 'CF-2026-001', fileName: 'mobile_logs.json', type: 'mobile_log', size: 8245, sha256: 'e2f3a4b5c6d7e8f9...', status: 'parsed', uploadedAt: '2026-08-15T10:02:00Z' },
    { id: 'EV-6', caseId: 'CF-2026-001', fileName: 'apk_metadata.json', type: 'apk', size: 6102, sha256: 'f1g2h3i4j5k6l7m8...', status: 'parsed', uploadedAt: '2026-08-15T10:02:30Z' },
  ]);

  const setCurrentCase = (c: CaseData) => {
    setCurrentCaseState(c);
  };

  const loadCase = async (caseId: string) => {
    try {
      const res = await caseService.getCaseById(caseId);
      if (res.success && res.case) {
        setCurrentCaseState(res.case);
      }
    } catch (e) {
      console.warn('Could not fetch case from API, using state:', e);
    }
  };

  const refreshEvidence = async (targetCaseId?: string) => {
    const cid = targetCaseId || currentCase?.caseId;
    if (!cid) return;
    try {
      const res = await evidenceService.getEvidenceForCase(cid);
      if (res.success && Array.isArray(res.evidence)) {
        setUploadedEvidence(res.evidence);
      }
    } catch (e) {
      console.warn('Could not refresh evidence list:', e);
    }
  };

  const addUploadedFile = (item: EvidenceItem) => {
    setUploadedEvidence(prev => [...prev.filter(x => x.fileName !== item.fileName), item]);
  };

  return (
    <CaseContext.Provider value={{ currentCase, uploadedEvidence, setCurrentCase, loadCase, refreshEvidence, addUploadedFile }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCaseContext = () => {
  const ctx = useContext(CaseContext);
  if (!ctx) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return ctx;
};
