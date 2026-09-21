import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data_store');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Memory + persistent JSON fallback store
class StorageService {
  constructor() {
    this.casesFile = path.join(DATA_DIR, 'cases.json');
    this.evidenceFile = path.join(DATA_DIR, 'evidence.json');
    this.graphFile = path.join(DATA_DIR, 'graph.json');
    this.entityFile = path.join(DATA_DIR, 'entities.json');

    this.cases = this._loadJson(this.casesFile, [
      {
        id: 'case-001',
        caseId: 'CF-2026-001',
        complainantName: 'Rohit Sharma',
        complaintType: 'Financial Fraud',
        dateOfIncident: '2026-08-12',
        complaintDetails: 'Victim reported a UPI fraud involving multiple fake transfers.',
        status: 'analysis_complete',
        createdAt: new Date().toISOString()
      }
    ]);

    this.evidence = this._loadJson(this.evidenceFile, []);
    this.graphs = this._loadJson(this.graphFile, {});
    this.entities = this._loadJson(this.entityFile, {});
    this.kingpinData = {};
    this.linkages = {};
    this.processingStatuses = {};
  }

  _loadJson(filePath, defaultValue) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (e) {
      console.error(`Failed to load ${filePath}:`, e);
    }
    return defaultValue;
  }

  _saveJson(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error(`Failed to save ${filePath}:`, e);
    }
  }

  // Case Methods
  getAllCases() {
    return this.cases;
  }

  getCaseById(caseId) {
    return this.cases.find(c => c.caseId === caseId || c.id === caseId);
  }

  createCase(caseData) {
    const existing = this.getCaseById(caseData.caseId);
    if (existing) {
      return existing;
    }
    const newCase = {
      id: `case-${Date.now()}`,
      caseId: caseData.caseId || `CF-2026-${String(this.cases.length + 1).padStart(3, '0')}`,
      complainantName: caseData.complainantName || 'Anonymous',
      complaintType: caseData.complaintType || 'Financial Fraud',
      dateOfIncident: caseData.dateOfIncident || new Date().toISOString().split('T')[0],
      complaintDetails: caseData.complaintDetails || '',
      status: 'created',
      createdAt: new Date().toISOString()
    };

    this.cases.push(newCase);
    this._saveJson(this.casesFile, this.cases);
    return newCase;
  }

  // Evidence Methods
  getEvidenceForCase(caseId) {
    return this.evidence.filter(e => e.caseId === caseId);
  }

  getEvidenceById(evidenceId) {
    return this.evidence.find(e => e.id === evidenceId);
  }

  addEvidence(caseId, file, evidenceType) {
    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const evidenceRecord = {
      id: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      caseId: caseId,
      fileName: file.originalname,
      type: evidenceType || 'other',
      size: file.size,
      sha256: hash,
      status: 'uploaded',
      storedPath: file.path,
      uploadedAt: new Date().toISOString()
    };

    this.evidence.push(evidenceRecord);
    this._saveJson(this.evidenceFile, this.evidence);
    return evidenceRecord;
  }

  updateEvidenceStatus(evidenceId, status) {
    const item = this.getEvidenceById(evidenceId);
    if (item) {
      item.status = status;
      this._saveJson(this.evidenceFile, this.evidence);
    }
    return item;
  }

  // Processing Status Methods
  getProcessingStatus(caseId) {
    return this.processingStatuses[caseId] || {
      fileProcessing: 'completed',
      dataParsing: 'completed',
      normalization: 'completed',
      entityExtraction: 'completed'
    };
  }

  setProcessingStatus(caseId, statusObj) {
    this.processingStatuses[caseId] = {
      ...this.getProcessingStatus(caseId),
      ...statusObj
    };
  }

  // Graph and Analytics Storage
  getGraphForCase(caseId) {
    return this.graphs[caseId] || { nodes: [], edges: [] };
  }

  setGraphForCase(caseId, graphData) {
    this.graphs[caseId] = graphData;
    this._saveJson(this.graphFile, this.graphs);
  }

  getKingpinForCase(caseId) {
    return this.kingpinData[caseId] || {
      mainSuspect: {
        id: 'ACC001',
        type: 'BANK_ACCOUNT',
        label: 'Mule Account 1 (ACC001)',
        value: 'ACC001',
        riskScore: 96,
        pageRank: 0.89,
        betweenness: 0.74,
        degree: 5,
        riskReasons: [
          'Primary destination for multi-hop rapid fund transfers',
          'Bridge entity connecting victim caller SIMs and cash-out accounts',
          'Associated with shared IMEI across 3 suspect phone numbers'
        ]
      },
      linkageSummary: [
        { id: 'LINK_1', sourceLabel: '+91 98765 43210 (Victim)', sourceType: 'PHONE', relationship: 'TRANSFERRED_TO', targetLabel: 'ACC001 (Mule Account 1)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.xlsx' },
        { id: 'LINK_2', sourceLabel: '+91 91234 56789 (Suspect)', sourceType: 'PHONE', relationship: 'LINKED_TO', targetLabel: 'user@upi (Suspect UPI)', targetType: 'UPI_ID', evidenceId: 'cdr_sample.csv' },
        { id: 'LINK_3', sourceLabel: 'user@upi (Suspect UPI)', sourceType: 'UPI_ID', relationship: 'LINKED_TO', targetLabel: 'ACC001 (Mule Account 1)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.xlsx' },
        { id: 'LINK_4', sourceLabel: 'ACC001 (Mule Account 1)', sourceType: 'BANK_ACCOUNT', relationship: 'TRANSFERRED_TO', targetLabel: 'ACC003 (Cash-out Account)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.xlsx' },
        { id: 'LINK_5', sourceLabel: '+91 91234 56789 (Suspect)', sourceType: 'PHONE', relationship: 'ASSOCIATED_WITH', targetLabel: '356782021345678 (IMEI)', targetType: 'IMEI', evidenceId: 'mobile_logs.json' }
      ]
    };
  }

  setKingpinForCase(caseId, data) {
    this.kingpinData[caseId] = data;
  }

  getEntityDetails(entityId) {
    return this.entities[entityId] || null;
  }

  setEntityDetails(entityId, details) {
    this.entities[entityId] = details;
    this._saveJson(this.entityFile, this.entities);
  }
}

export const storageService = new StorageService();
