import { storageService } from '../services/storageService.js';

// === RICH DEMO GRAPH DATA: Beed (Maharashtra) Money Mule Network Case ===
// Based on real-world NCCRP portal case: 25 complaints linked to 1 primary account (ACC_BEED_MULE01),
// Rs. 23.73 Crore transferred & immediately withdrawn via ATM, cheques, and online channels.
const demoGraphData = {
  nodes: [
    // VICTIMS
    { id: 'PHONE_VIC_BED', type: 'PHONE', label: 'Victim Beed Resident', value: '+91 98760 01001', priority: 'low', riskScore: 12, group: 'victim' },
    { id: 'PHONE_VIC_NGP', type: 'PHONE', label: 'Victim Nagpur Trader', value: '+91 98220 02001', priority: 'low', riskScore: 15, group: 'victim' },
    { id: 'PHONE_VIC_AUR', type: 'PHONE', label: 'Victim Sambhajinagar', value: '+91 98230 03001', priority: 'low', riskScore: 14, group: 'victim' },
    { id: 'PHONE_VIC_NSK', type: 'PHONE', label: 'Victim Nashik Businessman', value: '+91 98240 04001', priority: 'low', riskScore: 10, group: 'victim' },
    { id: 'PHONE_VIC_SOL', type: 'PHONE', label: 'Victim Solapur Investor', value: '+91 98250 05001', priority: 'low', riskScore: 11, group: 'victim' },

    // SUSPECTS & FIELD AGENTS
    { id: 'PHONE_OPERATOR', type: 'PHONE', label: 'Beed Primary Mule Operator', value: '+91 97654 32100', priority: 'high', riskScore: 96, group: 'suspect' },
    { id: 'PHONE_COORD', type: 'PHONE', label: 'Master Syndicate Coordinator', value: '+91 98760 01001', priority: 'high', riskScore: 94, group: 'suspect' },
    { id: 'PHONE_FIELD_PUN', type: 'PHONE', label: 'Pune Cash Withdrawal Agent', value: '+91 98210 01002', priority: 'high', riskScore: 88, group: 'suspect' },
    { id: 'PHONE_FIELD_MUM', type: 'PHONE', label: 'Mumbai Hawala Agent', value: '+91 98330 01003', priority: 'high', riskScore: 86, group: 'suspect' },

    // BANK ACCOUNTS (MONEY MULE PIPELINE)
    { id: 'ACC_BEED_MULE01', type: 'BANK_ACCOUNT', label: 'Primary Mule Account (HDFC Beed)', value: 'ACC_BEED_MULE01 (₹23.73 Cr Pass-Through)', priority: 'high', riskScore: 98, group: 'financial' },
    { id: 'ACC_PUN_MULE02', type: 'BANK_ACCOUNT', label: 'Tier-2 Mule Account (ICICI Pune)', value: 'ACC_PUN_MULE02 (Layer 2)', priority: 'high', riskScore: 93, group: 'financial' },
    { id: 'ACC_MUM_MULE03', type: 'BANK_ACCOUNT', label: 'Tier-2 Mule Account (PNB Mumbai)', value: 'ACC_MUM_MULE03 (Layer 2)', priority: 'high', riskScore: 91, group: 'financial' },
    { id: 'ACC_CSN_MULE04', type: 'BANK_ACCOUNT', label: 'Tier-2 Mule Account (Kotak Sambhajinagar)', value: 'ACC_CSN_MULE04 (Layer 2)', priority: 'high', riskScore: 89, group: 'financial' },

    // UPI CHANNELS
    { id: 'UPI_BEED_PRIMARY', type: 'UPI_ID', label: 'Primary Mule UPI', value: 'mulebeed@upi', priority: 'high', riskScore: 92, group: 'financial' },

    // DEVICE / IMEI
    { id: 'IMEI_BEED_01', type: 'IMEI', label: 'Coordinating Handset (OnePlus Nord)', value: '356001234567890', priority: 'high', riskScore: 90, group: 'device' },
    { id: 'IMEI_PUNE_02', type: 'IMEI', label: 'Field Agent Handset (Samsung A54)', value: '357002345678901', priority: 'high', riskScore: 84, group: 'device' },

    // NETWORK / C2 IP
    { id: 'IP_C2_BEED', type: 'IP_ADDRESS', label: 'Scam Control Server / C2 Gateway', value: '103.21.45.67', priority: 'high', riskScore: 95, group: 'network' },
    { id: 'IP_PROXY_TELEGRAM', type: 'IP_ADDRESS', label: 'Telegram Proxy Relay', value: '157.16.62.20', priority: 'medium', riskScore: 87, group: 'network' },

    // MALWARE & EMAIL
    { id: 'APK_BEED_APP', type: 'APK', label: 'Beed Fake Investment Portal APK', value: 'com.beed.investment.helper', priority: 'high', riskScore: 96, group: 'malware' },
    { id: 'EMAIL_SCAM', type: 'EMAIL', label: 'Phishing Campaign Sender', value: 'support@beed-investment-portal.com', priority: 'high', riskScore: 91, group: 'email' }
  ],
  edges: [
    // Victims transferring money into Primary Beed Mule Account ACC_BEED_MULE01
    { id: 'E_VIC1_BEED', source: 'PHONE_VIC_BED', target: 'ACC_BEED_MULE01', type: 'TRANSFERRED_TO', label: 'TRANSFERRED ₹20.0 Lakhs', evidenceId: 'bank_transactions.csv' },
    { id: 'E_VIC2_BEED', source: 'PHONE_VIC_NGP', target: 'ACC_BEED_MULE01', type: 'TRANSFERRED_TO', label: 'TRANSFERRED ₹60.5 Lakhs', evidenceId: 'bank_transactions.csv' },
    { id: 'E_VIC3_BEED', source: 'PHONE_VIC_AUR', target: 'ACC_BEED_MULE01', type: 'TRANSFERRED_TO', label: 'TRANSFERRED ₹47.0 Lakhs', evidenceId: 'bank_transactions.csv' },
    { id: 'E_VIC4_BEED', source: 'PHONE_VIC_NSK', target: 'ACC_BEED_MULE01', type: 'TRANSFERRED_TO', label: 'TRANSFERRED ₹59.5 Lakhs', evidenceId: 'bank_transactions.csv' },
    { id: 'E_VIC5_BEED', source: 'PHONE_VIC_SOL', target: 'ACC_BEED_MULE01', type: 'TRANSFERRED_TO', label: 'TRANSFERRED ₹48.0 Lakhs', evidenceId: 'bank_transactions.csv' },

    // UPI transfers to Primary Account
    { id: 'E_UPI_ACC', source: 'UPI_BEED_PRIMARY', target: 'ACC_BEED_MULE01', type: 'LINKED_TO', label: 'ROUTED TO PRIMARY MULE', evidenceId: 'bank_transactions.csv' },

    // Money Laundering Pass-Through (Primary Mule → Layer 2 Mules)
    { id: 'E_LAYER_01', source: 'ACC_BEED_MULE01', target: 'ACC_PUN_MULE02', type: 'TRANSFERRED_TO', label: 'IMPS SPLIT (₹6.5 Cr)', evidenceId: 'bank_transactions.csv' },
    { id: 'E_LAYER_02', source: 'ACC_BEED_MULE01', target: 'ACC_MUM_MULE03', type: 'TRANSFERRED_TO', label: 'NEFT/RTGS SPLIT (₹8.4 Cr)', evidenceId: 'bank_transactions.csv' },
    { id: 'E_LAYER_03', source: 'ACC_BEED_MULE01', target: 'ACC_CSN_MULE04', type: 'TRANSFERRED_TO', label: 'RAPID TRANSFER (₹4.2 Cr)', evidenceId: 'bank_transactions.csv' },

    // Immediate ATM, Cheque & Cash Outs
    { id: 'E_CASHOUT_PUN', source: 'ACC_PUN_MULE02', target: 'PHONE_FIELD_PUN', type: 'CASHED_OUT_BY', label: 'ATM/CHEQUE CASH OUT (₹3.8 Cr)', evidenceId: 'bank_transactions.csv' },
    { id: 'E_CASHOUT_MUM', source: 'ACC_MUM_MULE03', target: 'PHONE_FIELD_MUM', type: 'CASHED_OUT_BY', label: 'HAWALA & ATM CASH OUT (₹5.2 Cr)', evidenceId: 'bank_transactions.csv' },

    // Calls & Coordination
    { id: 'E_CDR_01', source: 'PHONE_OPERATOR', target: 'PHONE_COORD', type: 'CALLED', label: 'COORDINATED (34× Calls)', evidenceId: 'cdr_sample.csv' },
    { id: 'E_CDR_02', source: 'PHONE_OPERATOR', target: 'PHONE_FIELD_PUN', type: 'CALLED', label: 'INSTRUCTED (28× Calls)', evidenceId: 'cdr_sample.csv' },
    { id: 'E_CDR_03', source: 'PHONE_OPERATOR', target: 'PHONE_FIELD_MUM', type: 'CALLED', label: 'INSTRUCTED (19× Calls)', evidenceId: 'cdr_sample.csv' },

    // Device Association
    { id: 'E_DEV_01', source: 'PHONE_OPERATOR', target: 'IMEI_BEED_01', type: 'ASSOCIATED_WITH', label: 'OPERATED ON HANDSET', evidenceId: 'mobile_logs.json' },
    { id: 'E_DEV_02', source: 'PHONE_FIELD_PUN', target: 'IMEI_PUNE_02', type: 'ASSOCIATED_WITH', label: 'OPERATED ON HANDSET', evidenceId: 'mobile_logs.json' },

    // IP DR & C2 Communications
    { id: 'E_IP_01', source: 'IMEI_BEED_01', target: 'IP_C2_BEED', type: 'ACCESSED_FROM', label: 'C2 PANIC BEACON (103.21.45.67)', evidenceId: 'ipdr_sample.csv' },
    { id: 'E_IP_02', source: 'IMEI_PUNE_02', target: 'IP_PROXY_TELEGRAM', type: 'ACCESSED_FROM', label: 'TELEGRAM RELAY (157.16.62.20)', evidenceId: 'ipdr_sample.csv' },

    // Malware & Phishing
    { id: 'E_APK_01', source: 'IMEI_BEED_01', target: 'APK_BEED_APP', type: 'INSTALLED', label: 'SIDELOADED SCAM APK', evidenceId: 'mobile_logs.json' },
    { id: 'E_APK_02', source: 'APK_BEED_APP', target: 'IP_C2_BEED', type: 'COMMUNICATES_WITH', label: 'EXFILTRATED OTP & CREDS', evidenceId: 'apk_metadata.json' },
    { id: 'E_EMAIL_01', source: 'EMAIL_SCAM', target: 'PHONE_VIC_BED', type: 'SENT_TO', label: 'PHISHING EMAIL CAMPAIGN', evidenceId: 'phishing_email.eml' },
    { id: 'E_EMAIL_02', source: 'EMAIL_SCAM', target: 'APK_BEED_APP', type: 'DISTRIBUTED', label: 'APK DOWNLOAD LINK', evidenceId: 'phishing_email.eml' }
  ]
};

// Comprehensive Entity Details for all nodes in Beed case
const demoEntityDetails = {
  ACC_BEED_MULE01: {
    id: 'ACC_BEED_MULE01', type: 'BANK_ACCOUNT', value: 'ACC_BEED_MULE01 (HDFC Beed Branch)', label: 'Primary Mule Account (HDFC Beed)',
    priority: 'high', riskScore: 98,
    associatedEntities: { incomingTxns: 25, outgoingTxns: 22, linkedDistricts: 12, totalAmountReceived: '₹23,73,00,000' },
    riskFactors: [
      'Primary pass-through account flagged across 25 distinct NCCRP cybercrime complaints',
      'Extremely high velocity of funds: ₹23.73 Crore routed between September 2025 and April 2026',
      'Zero commercial or retail profile — 99.4% of incoming funds were routed out within 15 minutes',
      'Linked to 3 downstream Layer-2 accounts in Pune, Mumbai, and Sambhajinagar',
      'Transactions initiated via suspicious C2 IP 103.21.45.67'
    ],
    graphAnalytics: { graphImportance: 0.98, bridgeScore: 0.94, connectionCount: 9 },
    evidenceSources: ['bank_transactions.csv', 'ipdr_sample.csv', 'mobile_logs.json']
  },
  PHONE_OPERATOR: {
    id: 'PHONE_OPERATOR', type: 'PHONE', value: '+91 97654 32100', label: 'Beed Primary Mule Operator',
    priority: 'high', riskScore: 96,
    associatedEntities: { phoneCalls: 50, bankAccounts: 1, upiIds: 1, imei: 1 },
    riskFactors: [
      'Master operator managing primary mule account ACC_BEED_MULE01',
      '50 CDR records showing daily coordination calls with field withdrawal agents',
      'SIM swap executed on 2025-08-15 prior to peak money flow',
      'Device connected to C2 server 103.21.45.67 during transaction hours'
    ],
    graphAnalytics: { graphImportance: 0.92, bridgeScore: 0.88, connectionCount: 7 },
    evidenceSources: ['cdr_sample.csv', 'mobile_logs.json', 'ipdr_sample.csv']
  },
  ACC_PUN_MULE02: {
    id: 'ACC_PUN_MULE02', type: 'BANK_ACCOUNT', value: 'ACC_PUN_MULE02 (ICICI Pune)', label: 'Tier-2 Mule Account (ICICI Pune)',
    priority: 'high', riskScore: 93,
    associatedEntities: { incomingTxns: 12, outgoingTxns: 10, atmWithdrawals: 8 },
    riskFactors: [
      'Layer-2 mule account used to disperse funds from primary account ACC_BEED_MULE01',
      'Received ₹6.5 Crore via IMPS split transactions',
      'Atm & cheque withdrawals performed by field agent (+91 98210 01002)'
    ],
    graphAnalytics: { graphImportance: 0.82, bridgeScore: 0.74, connectionCount: 5 },
    evidenceSources: ['bank_transactions.csv', 'cdr_sample.csv']
  },
  IP_C2_BEED: {
    id: 'IP_C2_BEED', type: 'IP_ADDRESS', value: '103.21.45.67', label: 'Scam Control Server / C2 Gateway',
    priority: 'high', riskScore: 95,
    associatedEntities: { connectedDevices: 3, bankTransactions: 30, domains: 2 },
    riskFactors: [
      'Command & Control server used for exfiltrating victim banking credentials and OTPs',
      'Hosts phishing platform beed-investment-portal.com',
      'Source IP for 30+ fraudulent money transfer sessions'
    ],
    graphAnalytics: { graphImportance: 0.89, bridgeScore: 0.81, connectionCount: 6 },
    evidenceSources: ['ipdr_sample.csv', 'apk_metadata.json', 'phishing_email.eml']
  },
  APK_BEED_APP: {
    id: 'APK_BEED_APP', type: 'APK', value: 'com.beed.investment.helper', label: 'Beed Fake Investment Portal APK',
    priority: 'high', riskScore: 96,
    associatedEntities: { devices: 1, victims: 5, c2Servers: 1 },
    riskFactors: [
      'Malicious Banking Trojan disguised as a high-yield investment portal',
      'Intercepts SMS messages and steals OTPs',
      'Communicates directly with C2 server 103.21.45.67'
    ],
    graphAnalytics: { graphImportance: 0.81, bridgeScore: 0.72, connectionCount: 4 },
    evidenceSources: ['apk_metadata.json', 'mobile_logs.json', 'phishing_email.eml']
  }
};

// Kingpin & Graph Analytics Prediction (PageRank, Betweenness, KingPin prediction)
const demoKingpinData = {
  mainSuspect: {
    id: 'ACC_BEED_MULE01',
    type: 'BANK_ACCOUNT',
    label: 'Primary Mule Account — ACC_BEED_MULE01 (HDFC Beed)',
    value: 'ACC_BEED_MULE01',
    riskScore: 98,
    pageRank: 0.98,
    betweenness: 0.94,
    degree: 9,
    riskReasons: [
      '🎯 PRIMARY MULE KINGPIN: Central pass-through bank account linked to 25 distinct NCCRP cybercrime complaints',
      '💰 TOTAL VOLUME: ₹23.73 Crore transferred between September 2025 and April 2026',
      '⚡ PASS-THROUGH PATTERN: 99.4% of funds received were immediately withdrawn via ATM, cash cheques, and IMPS layer transfers within minutes',
      '🌐 GEOGRAPHIC COVERAGE: Connected to victims across 12 Maharashtra districts (Beed, Nagpur, Sambhajinagar, Nashik, Solapur, Pune, etc.)',
      '📱 OPERATIONAL CORRELATION: Direct call correlation with Master Coordinator (+91 98760 01001) and C2 IP (103.21.45.67)'
    ]
  },
  rankings: [
    { id: 'ACC_BEED_MULE01', type: 'BANK_ACCOUNT', label: 'Primary Mule Account (HDFC Beed)', value: 'ACC_BEED_MULE01', riskScore: 98, pageRank: 0.98, betweenness: 0.94, degree: 9 },
    { id: 'PHONE_OPERATOR', type: 'PHONE', label: 'Beed Primary Mule Operator', value: '+91 97654 32100', riskScore: 96, pageRank: 0.92, betweenness: 0.88, degree: 7 },
    { id: 'IP_C2_BEED', type: 'IP_ADDRESS', label: 'Scam Control Server (103.21.45.67)', value: '103.21.45.67', riskScore: 95, pageRank: 0.89, betweenness: 0.81, degree: 6 },
    { id: 'PHONE_COORD', type: 'PHONE', label: 'Master Syndicate Coordinator', value: '+91 98760 01001', riskScore: 94, pageRank: 0.87, betweenness: 0.79, degree: 5 },
    { id: 'ACC_PUN_MULE02', type: 'BANK_ACCOUNT', label: 'Tier-2 Mule Account (ICICI Pune)', value: 'ACC_PUN_MULE02', riskScore: 93, pageRank: 0.82, betweenness: 0.74, degree: 5 },
    { id: 'APK_BEED_APP', type: 'APK', label: 'Beed Investment APK', value: 'com.beed.investment.helper', riskScore: 96, pageRank: 0.81, betweenness: 0.72, degree: 4 }
  ],
  linkageSummary: [
    { id: 'LINK_1', sourceLabel: '+91 98760 01001 (Victim Beed)', sourceType: 'PHONE', relationship: 'TRANSFERRED_TO', targetLabel: 'ACC_BEED_MULE01 (Primary Mule)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.csv', amount: '₹20,00,000', timestamp: '2025-09-08 11:05' },
    { id: 'LINK_2', sourceLabel: '+91 98220 02001 (Victim Nagpur)', sourceType: 'PHONE', relationship: 'TRANSFERRED_TO', targetLabel: 'ACC_BEED_MULE01 (Primary Mule)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.csv', amount: '₹60,50,000', timestamp: '2025-09-09 14:15' },
    { id: 'LINK_3', sourceLabel: '+91 98230 03001 (Victim Sambhajinagar)', sourceType: 'PHONE', relationship: 'TRANSFERRED_TO', targetLabel: 'ACC_BEED_MULE01 (Primary Mule)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.csv', amount: '₹47,00,000', timestamp: '2025-09-15 11:00' },
    { id: 'LINK_4', sourceLabel: 'ACC_BEED_MULE01 (Primary Mule)', sourceType: 'BANK_ACCOUNT', relationship: 'TRANSFERRED_TO', targetLabel: 'ACC_PUN_MULE02 (Layer 2 Pune)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.csv', amount: '₹6,50,00,000', timestamp: '2025-09-08 11:09' },
    { id: 'LINK_5', sourceLabel: 'ACC_BEED_MULE01 (Primary Mule)', sourceType: 'BANK_ACCOUNT', relationship: 'TRANSFERRED_TO', targetLabel: 'ACC_MUM_MULE03 (Layer 2 Mumbai)', targetType: 'BANK_ACCOUNT', evidenceId: 'bank_transactions.csv', amount: '₹8,40,00,000', timestamp: '2025-09-09 14:18' },
    { id: 'LINK_6', sourceLabel: 'ACC_PUN_MULE02 (Layer 2 Pune)', sourceType: 'BANK_ACCOUNT', relationship: 'CASHED_OUT_BY', targetLabel: '+91 98210 01002 (Pune Cash Agent)', targetType: 'PHONE', evidenceId: 'bank_transactions.csv', amount: '₹3,80,00,000', timestamp: '2025-09-08 11:12' },
    { id: 'LINK_7', sourceLabel: '+91 97654 32100 (Beed Operator)', sourceType: 'PHONE', relationship: 'CALLED', targetLabel: '+91 98760 01001 (Master Coordinator)', targetType: 'PHONE', evidenceId: 'cdr_sample.csv', amount: null, timestamp: '2025-09-08 11:02' },
    { id: 'LINK_8', sourceLabel: '356001234567890 (Handset IMEI)', sourceType: 'IMEI', relationship: 'ACCESSED_FROM', targetLabel: '103.21.45.67 (C2 Control Server)', targetType: 'IP_ADDRESS', evidenceId: 'ipdr_sample.csv', amount: null, timestamp: '2025-09-08 11:00' },
    { id: 'LINK_9', sourceLabel: 'com.beed.investment.helper (APK)', sourceType: 'APK', relationship: 'COMMUNICATES_WITH', targetLabel: '103.21.45.67 (C2 Server)', targetType: 'IP_ADDRESS', evidenceId: 'apk_metadata.json', amount: null, timestamp: '2025-08-20 19:05' }
  ],
  nerSummary: {
    phoneNumbers: 9,
    bankAccounts: 4,
    upiIds: 2,
    imeiDevices: 2,
    ipAddresses: 2,
    emailAddresses: 1,
    apkHashes: 1,
    totalEntities: 21,
    uniqueRelationships: 32,
    processingTime: '2m 45s',
    nccrpComplaintsLinked: 25,
    totalFraudAmount: '₹23,73,00,000'
  }
};

export const getGraphData = (req, res) => {
  try {
    const { caseId } = req.params;
    let graph = storageService.getGraphForCase(caseId);
    
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      graph = demoGraphData;
      storageService.setGraphForCase(caseId, graph);
    }

    return res.json({
      success: true,
      ...graph
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getKingpinPrediction = (req, res) => {
  try {
    const { caseId } = req.params;
    let data = storageService.getKingpinForCase(caseId);
    if (!data || !data.mainSuspect) {
      data = demoKingpinData;
    }
    return res.json({
      success: true,
      ...data
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getEntityDetails = (req, res) => {
  try {
    const { entityId } = req.params;
    let details = storageService.getEntityDetails(entityId);

    if (!details) {
      details = demoEntityDetails[entityId] || {
        id: entityId,
        type: 'ENTITY',
        value: entityId,
        label: entityId,
        priority: 'normal',
        riskScore: 45,
        associatedEntities: { phoneNumbers: 1, upiIds: 1 },
        riskFactors: ['Potential entity link detected in evidence'],
        graphAnalytics: { graphImportance: 0.35, bridgeScore: 0.20, connectionCount: 2 },
        evidenceSources: ['uploaded_evidence']
      };
    }

    return res.json({
      success: true,
      ...details
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
