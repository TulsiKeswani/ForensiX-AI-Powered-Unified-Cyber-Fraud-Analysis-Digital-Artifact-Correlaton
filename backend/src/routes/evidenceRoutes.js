import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  uploadEvidence,
  getEvidenceByCase,
  startAnalysis,
  getProcessingStatus,
  getProcessingSummary,
  getEntitySummary
} from '../controllers/evidenceController.js';

const router = Router();

router.post('/cases/:caseId/evidence', upload.single('file'), uploadEvidence);
router.get('/cases/:caseId/evidence', getEvidenceByCase);
router.post('/cases/:caseId/analyze', startAnalysis);
router.get('/cases/:caseId/processing-status', getProcessingStatus);
router.get('/cases/:caseId/processing-summary', getProcessingSummary);
router.get('/cases/:caseId/entities/summary', getEntitySummary);

export default router;
