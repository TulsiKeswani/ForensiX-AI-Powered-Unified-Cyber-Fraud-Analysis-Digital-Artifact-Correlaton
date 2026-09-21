import { storageService } from '../services/storageService.js';

export const createCase = (req, res) => {
  try {
    const { caseId, complainantName, complaintType, dateOfIncident, complaintDetails } = req.body;
    
    if (!caseId) {
      return res.status(400).json({ success: false, error: 'caseId is required' });
    }

    const created = storageService.createCase({
      caseId,
      complainantName,
      complaintType,
      dateOfIncident,
      complaintDetails
    });

    return res.status(201).json({
      success: true,
      case: created
    });
  } catch (err) {
    console.error('Error creating case:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getCases = (req, res) => {
  try {
    const cases = storageService.getAllCases();
    return res.json({ success: true, cases });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getCaseById = (req, res) => {
  try {
    const { caseId } = req.params;
    const item = storageService.getCaseById(caseId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    return res.json({ success: true, case: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
