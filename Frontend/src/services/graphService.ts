import api from './api';

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  value?: string;
  priority?: string;
  riskScore?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  evidenceId?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface EntityDetails {
  id: string;
  type: string;
  value: string;
  label: string;
  priority: string;
  riskScore: number;
  associatedEntities: Record<string, number>;
  riskFactors: string[];
  graphAnalytics?: {
    graphImportance: number;
    bridgeScore: number;
    connectionCount: number;
  };
  evidenceSources?: string[];
}

export interface MainSuspect {
  id: string;
  type: string;
  label: string;
  value: string;
  riskScore: number;
  pageRank: number;
  betweenness: number;
  degree: number;
  riskReasons: string[];
}

export interface LinkageItem {
  id: string;
  sourceLabel: string;
  sourceType: string;
  relationship: string;
  targetLabel: string;
  targetType: string;
  evidenceId: string;
}

export interface KingpinResponse {
  success: boolean;
  mainSuspect: MainSuspect | null;
  linkageSummary: LinkageItem[];
  rankings?: MainSuspect[];
}

export const graphService = {
  async getGraphData(caseId: string): Promise<{ success: boolean } & GraphData> {
    return api.get(`/cases/${caseId}/graph`);
  },

  async getKingpinPrediction(caseId: string): Promise<KingpinResponse> {
    return api.get(`/cases/${caseId}/kingpin`);
  },

  async getEntityDetails(entityId: string): Promise<{ success: boolean } & EntityDetails> {
    return api.get(`/entities/${entityId}`);
  }
};

export default graphService;
